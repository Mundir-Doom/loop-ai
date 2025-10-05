/**
 * Assistance Service
 * Tries to help customers by understanding their problem and guiding them to solutions
 * Only escalates to support ticket after multiple attempts
 */

export interface AssistanceAttempt {
  attemptCount: number;
  lastQuery: string;
  context: string[];
}

export class AssistanceService {
  private maxAttempts: number = 2;
  private currentAttempt: AssistanceAttempt = {
    attemptCount: 0,
    lastQuery: '',
    context: [],
  };

  /**
   * Checks if we should try to help or escalate to ticket
   */
  shouldTryToHelp(): boolean {
    return this.currentAttempt.attemptCount < this.maxAttempts;
  }

  /**
   * Increments attempt counter
   */
  recordAttempt(query: string): void {
    this.currentAttempt.attemptCount++;
    this.currentAttempt.lastQuery = query;
    this.currentAttempt.context.push(query);
  }

  /**
   * Gets current attempt count
   */
  getAttemptCount(): number {
    return this.currentAttempt.attemptCount;
  }

  /**
   * Gets conversation context
   */
  getContext(): string[] {
    return [...this.currentAttempt.context];
  }

  /**
   * Resets assistance attempts (when issue is resolved or ticket created)
   */
  reset(): void {
    this.currentAttempt = {
      attemptCount: 0,
      lastQuery: '',
      context: [],
    };
  }

  /**
   * Generates a helpful response that tries to understand the problem better
   */
  async generateHelpfulResponse(
    query: string,
    attemptNumber: number,
    apiKey: string,
    knowledgeBaseSummary: string,
    referer?: string,
    title?: string
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(attemptNumber, knowledgeBaseSummary);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };

      if (referer) {
        headers['HTTP-Referer'] = referer;
      }

      if (title) {
        headers['X-Title'] = title;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3.1:free',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: query,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const helpfulResponse = data.choices?.[0]?.message?.content?.trim();

      if (!helpfulResponse) {
        throw new Error('Empty response from AI');
      }

      return helpfulResponse;
    } catch (error) {
      console.error('Failed to generate helpful response:', error);
      // Fallback response
      return this.getFallbackResponse(attemptNumber);
    }
  }

  /**
   * Builds system prompt based on attempt number
   */
  private buildSystemPrompt(attemptNumber: number, knowledgeBaseSummary: string): string {
    if (attemptNumber === 1) {
      // First attempt - try to understand and guide
      return `You are a helpful customer service assistant. A customer has a question that might not be directly in our knowledge base, but you should try to help them.

Our knowledge base covers: ${knowledgeBaseSummary}

Your goal for this FIRST attempt:
1. Try to understand what they're really asking for
2. Ask ONE clarifying question to better understand
3. Be brief and direct

IMPORTANT: 
- Keep response under 2 sentences
- Ask ONE specific question
- Do NOT mention support tickets
- Be direct and helpful

Example responses:
- "Could you tell me more about what specifically you need help with?"
- "What exactly are you trying to do?"
- "Can you describe the issue in more detail?"`;
    } else {
      // Second attempt - try one more time with different angle
      return `You are a helpful customer service assistant. This is your SECOND attempt to help a customer.

Our knowledge base covers: ${knowledgeBaseSummary}

Your goal for this SECOND attempt:
1. Try ONE more clarifying question from a different angle
2. Be brief - maximum 2 sentences

IMPORTANT:
- Keep it short (under 2 sentences)
- Ask ONE specific question
- Be direct

Example responses:
- "Could you rephrase your question? I want to make sure I understand."
- "What's the main issue you're facing?"
- "Can you be more specific about what you need?"`;
    }
  }

  /**
   * Gets fallback response if AI fails
   */
  private getFallbackResponse(attemptNumber: number): string {
    if (attemptNumber === 1) {
      return "Could you tell me more about what you need?";
    } else {
      return "Can you rephrase your question? I want to help you properly.";
    }
  }

  /**
   * Generates the escalation message (when ready for ticket)
   */
  getEscalationMessage(): string {
    return `I'll connect you with our support team for specialized help.`;
  }
}
