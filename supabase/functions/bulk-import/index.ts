import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Minimal scoring logic ported from src/utils/tpsScoring.ts to compute profiles
const TRAIT_MAPPINGS: Record<string, number[]> = {
  "Structured": [1,4,7,10,13,16],
  "Ambivalent": [2,5,8,11,14,17],
  "Independent": [3,6,9,12,15,18],
  "Passive": [19,22,25,28,31,34],
  "Diplomatic": [20,23,26,29,32,35],
  "Assertive": [21,24,27,30,33,36],
  "Lawful": [37,40,43,46,49,52],
  "Pragmatic": [38,41,44,47,50,53],
  "Self-Principled": [39,42,45,48,51,54],
  "Self-Indulgent": [55,58,61,64,67,70],
  "Self-Aware": [56,59,62,65,68,71],
  "Self-Mastery": [57,60,63,66,69,72],
  "Intrinsic": [73,76,79,82,85,88],
  "Responsive": [74,77,80,83,86,89],
  "Extrinsic": [75,78,81,84,87,90],
  "Pessimistic": [91,94,97,100,103,106],
  "Realistic": [92,95,98,101,104,107],
  "Optimistic": [93,96,99,102,105,108],
  "Independent Navigate": [1,7,13,19,25,31],
  "Mixed Navigate": [2,8,14,20,26,32],
  "Communal Navigate": [3,9,15,21,27,33],
  "Direct": [4,10,16,22,28,34],
  "Mixed Communication": [5,11,17,23,29,35],
  "Passive Communication": [6,12,18,24,30,36],
  "Dynamic": [37,43,49,55,61,67],
  "Modular": [38,44,50,56,62,68],
  "Static": [39,45,51,57,63,69],
  "Analytical": [40,46,52,58,64,70],
  "Varied": [41,47,53,59,65,71],
  "Intuitive": [42,48,54,60,66,72],
  "Turbulent": [73,79,85,91,97,103],
  "Responsive Regulation": [74,80,86,92,98,104],
  "Stoic": [75,81,87,93,99,105],
  "Physical": [76,82,88,94,100,106],
  "Social": [77,83,89,95,101,107],
  "Universal": [78,84,90,96,102,108],
};

const DOMAINS: Record<string, Record<string, string[]>> = {
  External: {
    Control: ['Structured','Ambivalent','Independent'],
    Will: ['Passive','Diplomatic','Assertive'],
    Design: ['Lawful','Pragmatic','Self-Principled'],
  },
  Internal: {
    'Self-Focus': ['Self-Indulgent','Self-Aware','Self-Mastery'],
    Motivation: ['Intrinsic','Responsive','Extrinsic'],
    Behavior: ['Pessimistic','Realistic','Optimistic'],
  },
  Interpersonal: {
    Navigate: ['Independent Navigate','Mixed Navigate','Communal Navigate'],
    Communication: ['Direct','Mixed Communication','Passive Communication'],
    Stimulation: ['Dynamic','Modular','Static'],
  },
  Processing: {
    Cognitive: ['Analytical','Varied','Intuitive'],
    Regulation: ['Turbulent','Responsive Regulation','Stoic'],
    Reality: ['Physical','Social','Universal'],
  },
};

function validateResponses(responses: number[]): number[] {
  if (!Array.isArray(responses)) throw new Error('Responses must be an array');
  if (responses.length !== 108) throw new Error('Must contain exactly 108 responses');
  return responses.map((n, i) => {
    const num = Number(n);
    if (!Number.isFinite(num) || num < 1 || num > 10) {
      throw new Error(`Response ${i + 1} must be 1-10`);
    }
    return num;
  });
}

function calculateTraitScores(userScores: number[]) {
  const traitScores: Record<string, number> = {};
  for (const [trait, idxs] of Object.entries(TRAIT_MAPPINGS)) {
    const vals = idxs.map(i => userScores[i - 1] || 5);
    traitScores[trait] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  return traitScores;
}

function determineDominantTrait(triadTraits: string[], traitScores: Record<string, number>): string {
  const scores = triadTraits.map(trait => ({ trait, score: traitScores[trait] || 0 }));
  scores.sort((a, b) => b.score - a.score);
  const highest = scores[0].score;
  const tied = scores.filter(s => Math.abs(s.score - highest) < 0.01);
  if (tied.length === 2) {
    const idxs = tied.map(t => triadTraits.indexOf(t.trait));
    if (idxs.includes(0) && idxs.includes(2)) return triadTraits[1];
    return tied[0].trait;
  } else if (tied.length === 3) {
    return triadTraits[1];
  }
  return scores[0].trait;
}

function calculateDominantTraits(traitScores: Record<string, number>) {
  const dominant: Record<string, string> = {};
  for (const [domain, triads] of Object.entries(DOMAINS)) {
    for (const [triadName, triadTraits] of Object.entries(triads)) {
      const name = `${domain}-${triadName}`;
      dominant[name] = determineDominantTrait(triadTraits, traitScores);
    }
  }
  return dominant;
}

function calculateDomainScores(traitScores: Record<string, number>) {
  const res: any = { External: 0, Internal: 0, Interpersonal: 0, Processing: 0 };
  for (const [domain, triads] of Object.entries(DOMAINS)) {
    let total = 0; let count = 0;
    for (const triadTraits of Object.values(triads)) {
      for (const trait of triadTraits) { total += traitScores[trait] || 0; count++; }
    }
    (res as any)[domain] = total / count;
  }
  return res;
}

function calculateMBTI(traitScores: Record<string, number>): string {
  const extraversion = (traitScores['Communal Navigate'] * 0.35) + (traitScores['Dynamic'] * 0.35) + (traitScores['Assertive'] * 0.15) + (traitScores['Direct'] * 0.15);
  const E_I = extraversion > 5 ? 'E' : 'I';
  const intuition = (traitScores['Intuitive'] * 0.40) + (traitScores['Universal'] * 0.30) + (traitScores['Varied'] * 0.15) + (traitScores['Self-Aware'] * 0.15);
  const S_N = intuition > 5 ? 'N' : 'S';
  const thinking = (traitScores['Analytical'] * 0.35) + (traitScores['Stoic'] * 0.25) + (traitScores['Direct'] * 0.20) + (traitScores['Pragmatic'] * 0.20);
  const T_F = thinking > 5 ? 'T' : 'F';
  const judging = (traitScores['Structured'] * 0.35) + (traitScores['Lawful'] * 0.25) + (traitScores['Self-Mastery'] * 0.20) + (traitScores['Assertive'] * 0.20);
  const J_P = judging > 5 ? 'J' : 'P';
  return E_I + S_N + T_F + J_P;
}

function calculateEnneagramDetails(traitScores: Record<string, number>) {
  const e: Record<number, number> = {
    1: ((traitScores['Self-Mastery']*0.30)+(traitScores['Lawful']*0.25)+(traitScores['Structured']*0.25)+(traitScores['Analytical']*0.10)+(traitScores['Stoic']*0.10))/5,
    2: ((traitScores['Communal Navigate']*0.30)+(traitScores['Responsive']*0.25)+(traitScores['Direct']*0.20)+(traitScores['Social']*0.15)+(traitScores['Optimistic']*0.10))/5,
    3: ((traitScores['Assertive']*0.30)+(traitScores['Dynamic']*0.25)+(traitScores['Structured']*0.20)+(traitScores['Extrinsic']*0.15)+(traitScores['Analytical']*0.10))/5,
    4: ((traitScores['Varied']*0.30)+(traitScores['Intuitive']*0.25)+(traitScores['Intrinsic']*0.20)+(traitScores['Turbulent']*0.15)+(traitScores['Self-Aware']*0.10))/5,
    5: ((traitScores['Analytical']*0.30)+(traitScores['Stoic']*0.25)+(traitScores['Structured']*0.20)+(traitScores['Independent']*0.15)+(traitScores['Physical']*0.10))/5,
    6: ((traitScores['Lawful']*0.30)+(traitScores['Realistic']*0.25)+(traitScores['Structured']*0.20)+(traitScores['Responsive Regulation']*0.15)+(traitScores['Social']*0.10))/5,
    7: ((traitScores['Optimistic']*0.30)+(traitScores['Dynamic']*0.25)+(traitScores['Communal Navigate']*0.20)+(traitScores['Varied']*0.15)+(traitScores['Responsive']*0.10))/5,
    8: ((traitScores['Assertive']*0.30)+(traitScores['Direct']*0.25)+(traitScores['Pragmatic']*0.20)+(traitScores['Dynamic']*0.15)+(traitScores['Self-Principled']*0.10))/5,
    9: ((traitScores['Ambivalent']*0.30)+(traitScores['Passive Communication']*0.25)+(traitScores['Realistic']*0.20)+(traitScores['Social']*0.15)+(traitScores['Stoic']*0.10))/5,
  };
  const sorted = Object.entries(e).sort((a,b)=>b[1]-a[1]);
  const type = Number(sorted[0][0]);
  const wing = Number(sorted[1][0]);
  const head = type === 7 || wing === 7 ? 7 : 7; // simple tritype placeholder
  const heart = type === 4 || wing === 4 ? 4 : 4;
  const gut = type === 8 || wing === 8 ? 8 : 8;
  return { type, wing, tritype: `${head}-${heart}-${gut}` };
}

function calculateBigFive(traitScores: Record<string, number>) {
  return {
    Openness: ((traitScores['Intuitive']||0)+(traitScores['Varied']||0)+(traitScores['Universal']||0))/3,
    Conscientiousness: ((traitScores['Structured']||0)+(traitScores['Self-Mastery']||0)+(traitScores['Lawful']||0))/3,
    Extraversion: ((traitScores['Communal Navigate']||0)+(traitScores['Dynamic']||0)+(traitScores['Assertive']||0))/3,
    Agreeableness: ((traitScores['Diplomatic']||0)+(traitScores['Social']||0)+(traitScores['Realistic']||0))/3,
    Neuroticism: ((traitScores['Turbulent']||0)+(traitScores['Pessimistic']||0)+(traitScores['Responsive Regulation']||0))/3,
  } as Record<string, number>;
}

function calculateAlignment(traitScores: Record<string, number>) {
  const lawChaos = (traitScores['Lawful']||0) - (traitScores['Varied']||0);
  const goodEvil = (traitScores['Social']||0) + (traitScores['Diplomatic']||0) - (traitScores['Self-Indulgent']||0);
  const ethical = lawChaos > 1 ? 'Lawful' : lawChaos < -1 ? 'Chaotic' : 'Neutral';
  const moral = goodEvil > 1 ? 'Good' : goodEvil < -1 ? 'Evil' : 'Neutral';
  return `${ethical} ${moral}`;
}

function calculateSocionics(mbti: string): string {
  const map: Record<string, string> = {
    INTJ: 'LII', INTP: 'LII', ENTJ: 'LIE', ENTP: 'ILE',
    INFJ: 'EII', INFP: 'EII', ENFJ: 'EIE', ENFP: 'IEE',
    ISTJ: 'LSI', ISTP: 'SLI', ESTJ: 'LSE', ESTP: 'SLE',
    ISFJ: 'ESI', ISFP: 'SEI', ESFJ: 'ESE', ESFP: 'SEE',
  };
  return map[mbti as keyof typeof map] || 'Unknown';
}

function calculateHollandCode(traitScores: Record<string, number>) {
  const scores: Record<string, number> = {
    R: (traitScores['Physical']||0) + (traitScores['Stoic']||0),
    I: (traitScores['Analytical']||0) + (traitScores['Varied']||0),
    A: (traitScores['Intuitive']||0) + (traitScores['Universal']||0),
    S: (traitScores['Communal Navigate']||0) + (traitScores['Social']||0),
    E: (traitScores['Assertive']||0) + (traitScores['Dynamic']||0),
    C: (traitScores['Structured']||0) + (traitScores['Lawful']||0),
  };
  const code = Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k).join('');
  return code;
}

function generateProfile(responses: number[]) {
  const validated = validateResponses(responses);
  const traitScores = calculateTraitScores(validated);
  const dominantTraits = calculateDominantTraits(traitScores);
  const domainScores = calculateDomainScores(traitScores);
  const mbti = calculateMBTI(traitScores);
  const enneagramDetails = calculateEnneagramDetails(traitScores);
  return {
    dominantTraits,
    traitScores,
    domainScores,
    mappings: {
      mbti,
      enneagram: `Type ${enneagramDetails.type}w${enneagramDetails.wing}`,
      enneagramDetails,
      bigFive: calculateBigFive(traitScores),
      dndAlignment: calculateAlignment(traitScores),
      socionics: calculateSocionics(mbti),
      hollandCode: calculateHollandCode(traitScores),
      personalityMatches: [],
    },
    timestamp: new Date().toISOString(),
    version: '2.1.0',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    });
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Verify admin
    const { data: isAdmin } = await supabaseClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const body = await req.json();
    const { type, batchId, filename } = body as { type: 'users' | 'assessments'; batchId: string; filename: string };

    // Create bulk import record
    const { data: importRow } = await serviceClient.from('bulk_imports').insert({
      admin_user_id: user.id,
      import_type: type,
      batch_id: batchId,
      filename,
      status: 'processing',
    }).select('id').single();

    let total = 0, success = 0, errorCount = 0;
    const errors: any[] = [];

    if (type === 'users') {
      const users: any[] = body.users || [];
      total = users.length;
      for (const row of users) {
        try {
          const email = String(row.email || '').trim().toLowerCase();
          if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Invalid email');
          const password: string = row.password && String(row.password).length >= 6
            ? String(row.password)
            : Math.random().toString(36).slice(-10) + 'Aa1!';
          const metadata: Record<string,string> = {};
          if (row.first_name) metadata.first_name = String(row.first_name);
          if (row.last_name) metadata.last_name = String(row.last_name);

          const { error: createErr } = await serviceClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: metadata,
          });
          if (createErr) throw createErr;
          success++;
        } catch (e: any) {
          errorCount++;
          errors.push({ row, error: e.message || String(e) });
        }
      }
    } else if (type === 'assessments') {
      const assessments: any[] = body.assessments || [];
      total = assessments.length;
      for (const row of assessments) {
        try {
          const email = String(row.email || '').trim().toLowerCase();
          if (!email) throw new Error('Missing email');

          // Find or create user by email
          let userId: string | null = null;
          const { data: byEmail } = await serviceClient.auth.admin.getUserByEmail(email);
          if (byEmail?.user) {
            userId = byEmail.user.id;
          } else {
            const tmpPass = Math.random().toString(36).slice(-10) + 'Aa1!';
            const { data: created, error: cuErr } = await serviceClient.auth.admin.createUser({ email, password: tmpPass, email_confirm: true });
            if (cuErr) throw cuErr;
            userId = created.user?.id || null;
          }
          if (!userId) throw new Error('Failed to resolve user');

          const responses: number[] = validateResponses(row.responses);
          const profile = generateProfile(responses);
          const variant = (row.variant || 'full').toString();

          const { error: insErr } = await serviceClient.from('assessments').insert({
            user_id: userId,
            profile,
            responses,
            variant,
          });
          if (insErr) throw insErr;
          success++;
        } catch (e: any) {
          errorCount++;
          errors.push({ row: { email: row?.email }, error: e.message || String(e) });
        }
      }
    } else {
      return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Update import record
    await serviceClient.from('bulk_imports').update({
      total_records: total,
      success_count: success,
      error_count: errorCount,
      status: errorCount > 0 && success === 0 ? 'failed' : 'completed',
      errors,
      completed_at: new Date().toISOString(),
    }).eq('id', importRow?.id);

    return new Response(JSON.stringify({ successCount: success, errorCount, total }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('bulk-import error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
