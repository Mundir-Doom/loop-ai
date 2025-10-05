/**
 * Knowledge Base Service
 * Manages the business knowledge base and query relevance checking
 */

import type { SheetData, SheetRow } from './GoogleSheetsService';

export interface RelevanceCheck {
  isRelevant: boolean;
  confidence: number;
  matchedContent?: string;
}

export class KnowledgeBaseService {
  private knowledgeBase: SheetData | null = null;

  /**
   * Loads knowledge base from sheet data
   */
  loadKnowledgeBase(sheetData: SheetData): void {
    this.knowledgeBase = sheetData;
    console.log('📚 Knowledge Base Loaded:', {
      entries: sheetData.rows.length,
      headers: sheetData.headers,
      firstEntry: sheetData.rows[0]
    });
  }

  /**
   * Checks if a query is relevant to the knowledge base
   */
  async checkRelevance(
    query: string,
    apiKey: string,
    referer?: string,
    title?: string
  ): Promise<RelevanceCheck> {
    if (!this.knowledgeBase) {
      return {
        isRelevant: false,
        confidence: 0,
      };
    }

    try {
      // Create a prompt to check relevance
      const systemPrompt = `You are a relevance checker. Your job is to determine if a user's question can be answered using the provided business knowledge base.

Knowledge Base Contains:
${this.knowledgeBase.rawContent.substring(0, 2000)}

Analyze the user's question and respond with ONLY a JSON object in this exact format:
{
  "isRelevant": true/false,
  "confidence": 0-100,
  "reasoning": "brief explanation"
}

Rules:
- Return isRelevant: true if the question is related to ANY information in the knowledge base
- Even if partially related, return true with appropriate confidence score
- Return isRelevant: false ONLY for completely unrelated topics (weather, jokes, general knowledge)
- Confidence should be 0-100 (higher = more confident)
- Be generous with relevance - if there's ANY connection, mark as relevant
- Keep reasoning brief (one sentence)`;

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
              content: `Question: "${query}"`,
            },
          ],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        throw new Error(`Relevance check failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          isRelevant: result.isRelevant === true,
          confidence: result.confidence || 0,
        };
      }

      // Fallback if parsing fails
      return {
        isRelevant: false,
        confidence: 0,
      };
    } catch (error) {
      console.error('Relevance check error:', error);
      // On error, err on the side of caution
      return {
        isRelevant: false,
        confidence: 0,
      };
    }
  }

  /**
   * Gets relevant context for a query
   */
  getRelevantContext(query: string, maxLength: number = 3000): string {
    if (!this.knowledgeBase) {
      return '';
    }

    // Improved keyword-based relevance with better matching
    const queryLower = query.toLowerCase();
    const searchTerms = queryLower.split(' ').filter(term => term.length > 2);
    
    // Score each row by relevance
    const scoredRows = this.knowledgeBase.rows.map(row => {
      const rowText = Object.values(row).join(' ').toLowerCase();
      let score = 0;
      
      // Check for exact phrase match (highest score)
      if (rowText.includes(queryLower)) {
        score += 100;
      }
      
      // Check for individual term matches
      searchTerms.forEach(term => {
        if (rowText.includes(term)) {
          score += 10;
        }
      });
      
      return { row, score };
    });

    // Sort by score and get top matches
    const relevantRows = scoredRows
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.row);

    if (relevantRows.length === 0) {
      // Return first few entries as general context
      relevantRows.push(...this.knowledgeBase.rows.slice(0, 3));
    }

    // Build context string
    let context = 'Relevant Information:\n\n';
    const headers = this.knowledgeBase.headers;

    for (const row of relevantRows) {
      if (context.length > maxLength) break;
      
      for (const header of headers) {
        if (row[header]) {
          context += `${header}: ${row[header]}\n`;
        }
      }
      context += '\n';
    }

    return context.substring(0, maxLength);
  }

  /**
   * Checks if knowledge base is loaded
   */
  isLoaded(): boolean {
    return this.knowledgeBase !== null;
  }

  /**
   * Gets knowledge base summary
   */
  getSummary(): string {
    if (!this.knowledgeBase) {
      return 'No knowledge base loaded';
    }

    return `Knowledge Base: ${this.knowledgeBase.rows.length} entries with fields: ${this.knowledgeBase.headers.join(', ')}`;
  }

  /**
   * Tries to find a direct answer in the knowledge base without AI
   * Returns null if no direct match found
   */
  getDirectAnswer(query: string): string | null {
    if (!this.knowledgeBase) {
      return null;
    }

    const queryLower = query.toLowerCase().trim();
    
    // Look for a row where the Question field closely matches
    for (const row of this.knowledgeBase.rows) {
      const question = row['Question']?.toLowerCase() || '';
      const answer = row['Answer'] || '';
      
      // Check for close match
      if (question && answer) {
        // Exact match
        if (question === queryLower) {
          return answer;
        }
        
        // Contains all key words
        const queryWords = queryLower.split(' ').filter(w => w.length > 3);
        const questionWords = question.split(' ');
        
        const matchCount = queryWords.filter(qw => 
          questionWords.some(qsw => qsw.includes(qw) || qw.includes(qsw))
        ).length;
        
        // If most key words match, return this answer
        if (queryWords.length > 0 && matchCount / queryWords.length >= 0.7) {
          return answer;
        }
      }
    }
    
    return null;
  }
}
