// Supabase Edge Function: bulk-recalculate
// Provides two modes:
// - list: returns paginated assessments (id, responses, profile, user_id, variant)
// - apply: applies recalculated profiles sent by the client; records bulk operation progress and audit entry
// NOTE: We intentionally keep all logic in this file (no imports from app code)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ListPayload = {
  mode: "list";
  offset?: number;
  limit?: number;
  filter?: { since?: string; variant?: string };
};

type ApplyItem = {
  id: string;
  oldProfile?: any;
  newProfile: any;
};

type ApplyPayload = {
  mode: "apply";
  items: ApplyItem[];
  dryRun?: boolean;
  operationId?: string | null;
};

type Payload = ListPayload | ApplyPayload;

function getClients(req: Request) {
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Client bound to the caller's JWT for auth checks
  const supabaseUser = createClient(url, anon, {
    global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
  });
  // Admin client for privileged operations (RLS bypass)
  const supabaseAdmin = createClient(url, service);
  return { supabaseUser, supabaseAdmin };
}

async function ensureAdmin(req: Request, supabaseUser: any, supabaseAdmin: any) {
  const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
  const userId = userData.user.id;
  // Check admin role using has_role function if present, else fallback to user_roles
  let isAdmin = false;
  try {
    const { data: rpcData } = await supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (rpcData === true) isAdmin = true;
  } catch (_) {
    // fallback
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    isAdmin = Array.isArray(roles) && roles.some((r: any) => r.role === "admin");
  }
  if (!isAdmin) {
    return { ok: false, status: 403, message: "Forbidden: admin role required" };
  }
  return { ok: true, userId } as const;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { supabaseUser, supabaseAdmin } = getClients(req);

    const adminCheck = await ensureAdmin(req, supabaseUser, supabaseAdmin);
    if (!("ok" in adminCheck) || !adminCheck.ok) {
      return new Response(JSON.stringify({ error: adminCheck.message }), {
        status: adminCheck.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const payload = (await req.json()) as Payload;

    if (payload.mode === "list") {
      const offset = Math.max(0, payload.offset ?? 0);
      const limit = Math.min(1000, Math.max(1, payload.limit ?? 200));

      let query = supabaseAdmin
        .from("assessments")
        .select("id, responses, profile, user_id, variant, updated_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (payload.filter?.since) {
        query = query.gte("updated_at", payload.filter.since);
      }
      if (payload.filter?.variant) {
        query = query.eq("variant", payload.filter.variant);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ items: data || [], total: count ?? null, nextOffset: (data?.length || 0) < limit ? null : offset + limit }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (payload.mode === "apply") {
      const dryRun = !!payload.dryRun;
      const items = payload.items || [];

      // Create or resume bulk operation
      let operationId = payload.operationId || null;
      if (!operationId) {
        const { data: op, error: opErr } = await supabaseAdmin
          .from("bulk_operations")
          .insert({
            created_by: adminCheck.userId,
            operation_type: "recalculate_assessments",
            status: dryRun ? "dry_run" : "processing",
            total_items: items.length,
            processed_items: 0,
            success_count: 0,
            parameters: { dryRun },
          })
          .select("id")
          .single();
        if (opErr) throw opErr;
        operationId = op.id;
      }

      let success = 0;
      let errors: Array<{ id: string; error: string }> = [];

      if (!dryRun && items.length > 0) {
        // Apply updates in small chunks to avoid payload limits
        const chunkSize = 100;
        for (let i = 0; i < items.length; i += chunkSize) {
          const chunk = items.slice(i, i + chunkSize);
          const updates = chunk.map((it) => ({ id: it.id, profile: it.newProfile }));
          const { error: upErr } = await supabaseAdmin.from("assessments").upsert(updates, { onConflict: "id" });
          if (upErr) {
            // fallback to per-row updates when conflicts or payload size issues occur
            for (const it of chunk) {
              const { error: rowErr } = await supabaseAdmin
                .from("assessments")
                .update({ profile: it.newProfile })
                .eq("id", it.id);
              if (rowErr) {
                errors.push({ id: it.id, error: rowErr.message });
              } else {
                success += 1;
              }
            }
          } else {
            success += chunk.length;
          }
        }
      }

      // Update bulk operation progress
      const { error: progErr } = await supabaseAdmin
        .from("bulk_operations")
        .update({
          processed_items: (dryRun ? 0 : success),
          success_count: (dryRun ? 0 : success),
          error_count: errors.length,
          status: dryRun ? "dry_run" : "completed",
          completed_at: dryRun ? null : new Date().toISOString(),
          error_details: errors,
        })
        .eq("id", operationId);
      if (progErr) console.error("bulk_recalculate: progress update failed", progErr.message);

      // Write a compact audit log record
      const { error: auditErr } = await supabaseAdmin.from("scoring_audit_log").insert({
        user_id: adminCheck.userId,
        action: dryRun ? "bulk_recalc_dry_run" : "bulk_recalc_apply",
        target: "assessments",
        change_description: dryRun
          ? `Dry run evaluated ${items.length} assessments`
          : `Updated ${success}/${items.length} assessments during bulk recalculation`,
        impacted_users: null,
        new_values: dryRun ? null : { updated: success },
        old_values: null,
        metadata: { operationId, errorsCount: errors.length },
      });
      if (auditErr) console.error("bulk_recalculate: audit insert failed", auditErr.message);

      return new Response(
        JSON.stringify({ operationId, success, errors }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid mode" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    console.error("bulk-recalculate error", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
