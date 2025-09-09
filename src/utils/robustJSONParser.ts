// JSON parsing robustness for LLM responses

interface ParseResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fallback?: T;
}

export class RobustJSONParser {
  private static readonly MAX_PARSE_ATTEMPTS = 3;
  private static readonly COMMON_FIXES = [
    // Fix common JSON issues
    (text: string) => text.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'), // Quote unquoted keys
    (text: string) => text.replace(/,(\s*[}\]])/g, '$1'), // Remove trailing commas
    (text: string) => text.replace(/'/g, '"'), // Replace single quotes with double quotes
    (text: string) => text.replace(/([^\\])\\([^"\\\/bfnrt])/g, '$1\\\\$2'), // Fix escape sequences
  ];

  static parseWithFallback<T = unknown>(
    jsonString: string, 
    fallback?: T,
    validator?: (data: unknown) => data is T
  ): ParseResult<T> {
    // First attempt: direct parsing
    try {
      const parsed = JSON.parse(jsonString);
      if (validator && !validator(parsed)) {
        throw new Error('Parsed data failed validation');
      }
      return { success: true, data: parsed };
    } catch (initialError) {
      // Second attempt: try extracting JSON from text
      const extracted = this.extractJSONFromText(jsonString);
      if (extracted) {
        try {
          const parsed = JSON.parse(extracted);
          if (validator && !validator(parsed)) {
            throw new Error('Extracted data failed validation');
          }
          return { success: true, data: parsed };
        } catch (extractError) {
          // Third attempt: apply common fixes
          return this.parseWithCommonFixes(extracted, fallback, validator);
        }
      }
      
      // Final attempt: parse with fixes on original string
      return this.parseWithCommonFixes(jsonString, fallback, validator);
    }
  }

  private static parseWithCommonFixes<T>(
    text: string,
    fallback?: T,
    validator?: (data: unknown) => data is T
  ): ParseResult<T> {
    for (let attempt = 0; attempt < this.MAX_PARSE_ATTEMPTS; attempt++) {
      let fixedText = text;
      
      // Apply fixes cumulatively
      for (let i = 0; i <= attempt && i < this.COMMON_FIXES.length; i++) {
        fixedText = this.COMMON_FIXES[i](fixedText);
      }
      
      try {
        const parsed = JSON.parse(fixedText);
        if (validator && !validator(parsed)) {
          continue; // Try next fix
        }
        return { success: true, data: parsed };
      } catch (error) {
        continue; // Try next fix
      }
    }
    
    // All attempts failed, return fallback
    return {
      success: false,
      error: 'Failed to parse JSON after all repair attempts',
      fallback,
      data: fallback
    };
  }

  private static extractJSONFromText(text: string): string | null {
    // Try to find JSON in markdown code fences first
    const markdownMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (markdownMatch) {
      return markdownMatch[1];
    }
    
    // Try to find the first complete JSON object
    let braceCount = 0;
    let startIndex = -1;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') {
          if (startIndex === -1) {
            startIndex = i;
          }
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0 && startIndex !== -1) {
            return text.substring(startIndex, i + 1);
          }
        }
      }
    }
    
    return null;
  }

  static isValidJSON(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }

  static sanitizeForJSON(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeForJSON(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip functions, symbols, and undefined values
        if (typeof value !== 'function' && typeof value !== 'symbol' && value !== undefined) {
          sanitized[key] = this.sanitizeForJSON(value);
        }
      }
      return sanitized;
    }
    
    return null;
  }

  static createTypedParser<T>(
    validator: (data: unknown) => data is T,
    fallback: T
  ) {
    return (jsonString: string): ParseResult<T> => {
      return this.parseWithFallback(jsonString, fallback, validator);
    };
  }
}

// Common validators for LLM responses
export const LLMValidators = {
  isInsightResponse: (data: unknown): data is { insights: string[]; recommendations: string[] } => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'insights' in data &&
      'recommendations' in data &&
      Array.isArray((data as any).insights) &&
      Array.isArray((data as any).recommendations)
    );
  },

  isPersonalityResult: (data: unknown): data is { type: string; confidence: number; traits: Record<string, number> } => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'type' in data &&
      'confidence' in data &&
      'traits' in data &&
      typeof (data as any).type === 'string' &&
      typeof (data as any).confidence === 'number' &&
      typeof (data as any).traits === 'object'
    );
  },

  isArrayOfStrings: (data: unknown): data is string[] => {
    return Array.isArray(data) && data.every(item => typeof item === 'string');
  }
};