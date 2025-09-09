// Utility functions to safely extract and parse JSON from LLM responses
// Handles cases where JSON is wrapped in Markdown code fences or mixed with prose

import { logger } from './structuredLogging';

export function extractJSONFromText(text: string): string | null {
  if (!text) return null;

  // 1) Prefer fenced code blocks ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json|javascript|js)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    return fenceMatch[1].trim();
  }

  // 2) Try to locate the first balanced {...} block
  const firstBrace = text.indexOf('{');
  if (firstBrace === -1) return null;

  // Attempt to find a balanced JSON object by tracking brace depth
  let depth = 0;
  for (let i = firstBrace; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth === 0) {
      const candidate = text.slice(firstBrace, i + 1).trim();
      try {
        JSON.parse(candidate);
        return candidate; // Return only if it parses successfully
      } catch {
        // Ignore and continue searching (there might be trailing text)
      }
    }
  }

  // 3) Fallback: take from first { to last } and hope it's close
  const lastBrace = text.lastIndexOf('}');
  if (lastBrace > firstBrace) {
    const candidate = text.slice(firstBrace, lastBrace + 1).trim();
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      return null;
    }
  }

  return null;
}

export function parseLLMJson<T = unknown>(raw: string): T {
  if (!raw) throw new Error('Empty LLM response');

  // 1) Try direct parse
  try {
    return JSON.parse(raw) as T;
  } catch {
    // continue
  }

  // 2) Try extracting JSON from text
  const extracted = extractJSONFromText(raw);
  if (extracted) {
    try {
      return JSON.parse(extracted) as T;
    } catch (err) {
      logger.error('Failed to parse extracted JSON', { 
        component: 'JsonUtils', 
        action: 'safeParseJSON',
        metadata: { extractedSnippet: extracted.slice(0, 500) } 
      }, err);
      throw new Error('Invalid JSON format in LLM response after extraction');
    }
  }

  // 3) Provide a helpful error with a safe snippet
  const snippet = raw.length > 500 ? raw.slice(0, 500) + '…' : raw;
  logger.error('Failed to locate JSON in LLM response', { 
    component: 'JsonUtils', 
    action: 'safeParseJSON',
    metadata: { rawSnippet: snippet } 
  });
  throw new Error('The AI did not return valid JSON. Please try again.');
}
