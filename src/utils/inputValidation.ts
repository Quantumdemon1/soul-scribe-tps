// Input validation utilities for security

export class InputValidator {
  static sanitizeText(input: string): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    // Remove potential injection patterns
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .trim();
  }

  static validatePromptInput(prompt: string): string {
    const sanitized = this.sanitizeText(prompt);
    
    if (!sanitized || sanitized.length === 0) {
      throw new Error('Prompt cannot be empty');
    }
    
    if (sanitized.length > 10000) {
      throw new Error('Prompt exceeds maximum length of 10,000 characters');
    }
    
    return sanitized;
  }

  static validateAssessmentResponses(responses: number[]): number[] {
    if (!Array.isArray(responses)) {
      throw new Error('Responses must be an array');
    }
    
    if (responses.length !== 108) {
      throw new Error('Assessment must contain exactly 108 responses');
    }
    
    // Validate each response is within range 1-10
    const validatedResponses = responses.map((response, index) => {
      const num = Number(response);
      if (isNaN(num) || num < 1 || num > 10) {
        throw new Error(`Response ${index + 1} must be a number between 1 and 10`);
      }
      return num;
    });
    
    return validatedResponses;
  }

  static validateLLMConfig(config: Record<string, unknown>): Record<string, unknown> {
    if (!config || typeof config !== 'object') {
      throw new Error('Configuration must be a valid object');
    }
    
    const allowedProviders = ['openai', 'claude'];
    if (config.provider && !allowedProviders.includes(config.provider as string)) {
      throw new Error('Provider must be either "openai" or "claude"');
    }
    
    if (config.temperature !== undefined) {
      const temp = Number(config.temperature);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        throw new Error('Temperature must be a number between 0 and 2');
      }
    }
    
    if (config.model && typeof config.model !== 'string') {
      throw new Error('Model must be a string');
    }
    
    return config;
  }

  static sanitizeErrorMessage(error: unknown): string {
    if (!error) return 'An unknown error occurred';
    
    const message = error instanceof Error ? error.message : 
                   (typeof error === 'string' ? error :
                   (error?.toString?.() || 'An error occurred'));
    
    // Remove sensitive information from error messages
    return message
      .replace(/\/[^\/\s]+\/[^\/\s]*\.tsx?/g, '[file]') // Remove file paths
      .replace(/localhost:\d+/g, '[host]') // Remove localhost URLs
      .replace(/\w+@\w+\.\w+/g, '[email]') // Remove email addresses
      .replace(/sk-[a-zA-Z0-9]{32,}/g, '[api-key]') // Remove API keys
      .substring(0, 200); // Limit message length
  }
}