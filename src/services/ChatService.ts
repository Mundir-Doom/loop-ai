/**
 * Chat Service
 * Handles AI chat interactions with knowledge base constraints
 */

import type { KnowledgeBaseService } from './KnowledgeBaseService';
import type { SupportTicketService } from './SupportTicketService';
import { FriendlyResponseService } from './FriendlyResponseService';
import { AssistanceService } from './AssistanceService';
import { LanguageService } from './LanguageService';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatServiceConfig {
  apiKey: string;
  referer?: string;
  title?: string;
  model?: string;
}

export class ChatService {
  private config: ChatServiceConfig;
  private knowledgeBaseService: KnowledgeBaseService;
  private supportTicketService: SupportTicketService | null;
  private friendlyResponseService: FriendlyResponseService;
  private assistanceService: AssistanceService;
  private languageService: LanguageService;

  constructor(
    config: ChatServiceConfig, 
    knowledgeBaseService: KnowledgeBaseService,
    supportTicketService?: SupportTicketService,
    friendlyResponseService?: FriendlyResponseService,
    assistanceService?: AssistanceService,
    languageService?: LanguageService
  ) {
    this.config = config;
    this.knowledgeBaseService = knowledgeBaseService;
    this.supportTicketService = supportTicketService || null;
    this.friendlyResponseService = friendlyResponseService || new FriendlyResponseService();
    this.assistanceService = assistanceService || new AssistanceService();
    this.languageService = languageService || new LanguageService();
  }

  /**
   * Sends a message to the AI with knowledge base constraints
   */
  async sendMessage(userMessage: string, conversationHistory: ChatMessage[]): Promise<string> {
    // Detect user's language
    const languageDetection = this.languageService.detectLanguage(userMessage);
    const isArabic = languageDetection.language === 'ar';
    
    console.log('🌐 Language detected:', languageDetection);

    // Check if support ticket flow is active
    if (this.supportTicketService?.isFlowActive()) {
      // Handle cancellation
      const cancelWords = ['cancel', 'stop', 'إلغاء', 'توقف'];
      if (cancelWords.some(word => userMessage.toLowerCase().includes(word))) {
        const response = this.supportTicketService.cancelFlow();
        return isArabic ? await this.translateIfNeeded(response, true) : response;
      }
      
      // Process the ticket flow step
      const response = await this.supportTicketService.processInput(userMessage);
      return isArabic ? await this.translateIfNeeded(response, true) : response;
    }

    // Check for friendly/social messages (greetings, thanks, etc.)
    const friendlyCheck = this.friendlyResponseService.checkFriendlyMessage(userMessage);
    if (friendlyCheck.isFriendly && friendlyCheck.response) {
      // Use Arabic phrases if user is speaking Arabic
      if (isArabic) {
        if (userMessage.includes('مرحبا') || userMessage.includes('السلام') || userMessage.includes('هاي')) {
          return this.languageService.getArabicPhrase('greeting');
        }
        if (userMessage.includes('شكر') || userMessage.includes('ممتاز') || userMessage.includes('رائع')) {
          return this.languageService.getArabicPhrase('thanks');
        }
        if (userMessage.includes('وداع') || userMessage.includes('باي') || userMessage.includes('مع السلامة')) {
          return this.languageService.getArabicPhrase('goodbye');
        }
        // Fallback to translation
        return await this.translateIfNeeded(friendlyCheck.response, true);
      }
      return friendlyCheck.response;
    }

    // Check if the knowledge base is loaded
    if (!this.knowledgeBaseService.isLoaded()) {
      const message = "I'm currently loading our business information. Please try again in a moment.";
      return isArabic ? this.languageService.getArabicPhrase('loading') : message;
    }

    // Translate Arabic query to English for searching
    let searchQuery = userMessage;
    if (isArabic) {
      console.log('🔄 Translating Arabic query to English for search...');
      searchQuery = await this.languageService.translateToEnglish(
        userMessage,
        this.config.apiKey,
        this.config.referer,
        this.config.title
      );
      console.log('📝 Translated query:', searchQuery);
    }

    // Quick check: Does the query directly mention something in the knowledge base?
    const lowerQuery = searchQuery.toLowerCase();
    const quickKeywords = ['hours', 'open', 'close', 'business hours', 'schedule', 'time', 'ساعات', 'وقت', 'مفتوح'];
    const hasDirectKeyword = quickKeywords.some(keyword => lowerQuery.includes(keyword));
    
    if (hasDirectKeyword) {
      console.log('⚡ Quick keyword match detected! Trying direct answer first...');
      
      // Try to get a direct answer without calling AI (avoids rate limits!)
      const directAnswer = this.knowledgeBaseService.getDirectAnswer(searchQuery);
      if (directAnswer) {
        console.log('✅ Found direct answer without AI!');
        this.assistanceService.reset();
        // Translate to Arabic if user is speaking Arabic
        return isArabic ? await this.translateIfNeeded(directAnswer, true) : directAnswer;
      }
      
      // If no direct match, try AI-powered answer
      const context = this.knowledgeBaseService.getRelevantContext(searchQuery);
      if (context && context.length > 50) {
        console.log('✅ Found context, using AI to answer...');
        // Answer using AI (may hit rate limit)
        const answer = await this.answerFromKnowledgeBase(searchQuery, context, conversationHistory, isArabic);
        return answer;
      }
    }

    // Step 1: Check if the query is relevant to the knowledge base
    const relevanceCheck = await this.knowledgeBaseService.checkRelevance(
      userMessage,
      this.config.apiKey,
      this.config.referer,
      this.config.title
    );

    console.log('🔍 Relevance Check:', {
      query: userMessage,
      isRelevant: relevanceCheck.isRelevant,
      confidence: relevanceCheck.confidence
    });

    // If not relevant or low confidence, try to help first before escalating
    if (!relevanceCheck.isRelevant || relevanceCheck.confidence < 30) {
      // Check if we should try to help or escalate to ticket
      if (this.assistanceService.shouldTryToHelp()) {
        // Record this attempt
        this.assistanceService.recordAttempt(userMessage);
        const attemptNumber = this.assistanceService.getAttemptCount();

        console.log(`🤔 Assistance attempt ${attemptNumber}/2`);

        // Try to help with a clarifying/guiding response
        const helpfulResponse = await this.assistanceService.generateHelpfulResponse(
          userMessage,
          attemptNumber,
          this.config.apiKey,
          this.knowledgeBaseService.getSummary(),
          this.config.referer,
          this.config.title
        );

        return helpfulResponse;
      } else {
        // After 2 attempts, CREATE TICKET IMMEDIATELY
        console.log('🎫 Max assistance attempts reached, creating support ticket');
        
        const escalationMessage = this.assistanceService.getEscalationMessage();
        
        // Reset assistance attempts
        this.assistanceService.reset();

        // Start ticket flow if service is available
        if (this.supportTicketService) {
          const ticketStart = this.supportTicketService.startTicketFlow();
          const fullMessage = escalationMessage + "\n\n" + ticketStart;
          return isArabic ? await this.translateIfNeeded(fullMessage, true) : fullMessage;
        } else {
          return escalationMessage + "\n\nPlease contact our support team directly at support@example.com";
        }
      }
    }

    // If query was relevant, try to answer from knowledge base
    const answer = await this.answerFromKnowledgeBase(searchQuery, '', conversationHistory, isArabic);

    // Check if the answer indicates the bot doesn't know (unhelpful response)
    const unhelpfulPhrases = [
      "don't know",
      "don't have",
      "cannot answer",
      "can't answer",
      "no information",
      "not sure",
      "unable to",
      "sorry",
      "لا أعرف", // Arabic: "I don't know"
      "لا أملك", // Arabic: "I don't have"
      "لا يمكنني", // Arabic: "I cannot"
      "عذراً", // Arabic: "sorry"
    ];

    const answerLower = answer.toLowerCase();
    const isUnhelpful = unhelpfulPhrases.some(phrase => answerLower.includes(phrase));

    // If the answer was unhelpful, trigger the assistance flow OR create ticket
    if (isUnhelpful) {
      console.log('⚠️ Answer was unhelpful, triggering assistance flow');
      
      // Check if we've already tried helping
      const attemptCount = this.assistanceService.getAttemptCount();
      
      // If we've already made ANY assistance attempts, go straight to ticket
      // This prevents endless back-and-forth when bot clearly can't help
      if (attemptCount >= 1) {
        console.log(`🎫 Already tried helping ${attemptCount} time(s), creating ticket now`);
        
        const escalationMessage = this.assistanceService.getEscalationMessage();
        this.assistanceService.reset();

        if (this.supportTicketService) {
          const ticketStart = this.supportTicketService.startTicketFlow();
          const fullMessage = escalationMessage + "\n\n" + ticketStart;
          return isArabic ? await this.translateIfNeeded(fullMessage, true) : fullMessage;
        } else {
          return escalationMessage + "\n\nPlease contact our support team directly at support@example.com";
        }
      }
      
      // First unhelpful answer - try to help once
      if (this.assistanceService.shouldTryToHelp()) {
        this.assistanceService.recordAttempt(userMessage);
        const attemptNumber = this.assistanceService.getAttemptCount();

        console.log(`🤔 Assistance attempt ${attemptNumber}/2 (unhelpful answer path)`);

        const helpfulResponse = await this.assistanceService.generateHelpfulResponse(
          userMessage,
          attemptNumber,
          this.config.apiKey,
          this.knowledgeBaseService.getSummary(),
          this.config.referer,
          this.config.title
        );

        return isArabic ? await this.translateIfNeeded(helpfulResponse, true) : helpfulResponse;
      } else {
        // Shouldn't reach here, but just in case
        console.log('🎫 Max attempts reached, creating ticket');
        
        const escalationMessage = this.assistanceService.getEscalationMessage();
        this.assistanceService.reset();

        if (this.supportTicketService) {
          const ticketStart = this.supportTicketService.startTicketFlow();
          const fullMessage = escalationMessage + "\n\n" + ticketStart;
          return isArabic ? await this.translateIfNeeded(fullMessage, true) : fullMessage;
        } else {
          return escalationMessage + "\n\nPlease contact our support team directly at support@example.com";
        }
      }
    }

    // Answer was helpful, reset assistance attempts
    this.assistanceService.reset();
    return answer;
  }

  /**
   * Translates text to Arabic if needed
   */
  private async translateIfNeeded(text: string, toArabic: boolean): Promise<string> {
    if (!toArabic) return text;
    
    return await this.languageService.translateToArabic(
      text,
      this.config.apiKey,
      this.config.referer,
      this.config.title
    );
  }

  /**
   * Answers a query using the knowledge base
   */
  private async answerFromKnowledgeBase(
    userMessage: string,
    providedContext: string,
    conversationHistory: ChatMessage[],
    translateToArabic: boolean = false
  ): Promise<string> {
    // Get relevant context from knowledge base if not provided
    const context = providedContext || this.knowledgeBaseService.getRelevantContext(userMessage);

    // Build the system prompt with context
    const languageInstruction = translateToArabic 
      ? '\n5. IMPORTANT: The user is speaking Arabic. Respond in Arabic (العربية).'
      : '';

    const systemPrompt = `You are a helpful business assistant. You can ONLY answer questions using the information provided in the knowledge base below. 

IMPORTANT RULES:
1. ONLY use information from the knowledge base below
2. Be concise and professional (1-2 sentences max)
3. Do not make up information
4. Do not answer general knowledge questions${languageInstruction}

KNOWLEDGE BASE:
${context}

Remember: Stay strictly within the scope of the knowledge base. Be brief.`;

    // Send to AI with constrained context
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      };

      if (this.config.referer) {
        headers['HTTP-Referer'] = this.config.referer;
      }

      if (this.config.title) {
        headers['X-Title'] = this.config.title;
      }

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: systemPrompt,
        },
        // Include recent conversation history (last 3 messages)
        ...conversationHistory.slice(-6),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.config.model || 'deepseek/deepseek-chat-v3.1:free',
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content?.trim();

      if (!aiResponse) {
        throw new Error('Empty response from AI');
      }

      return aiResponse;
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }

  /**
   * Updates the configuration
   */
  updateConfig(config: Partial<ChatServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Sets the support ticket service
   */
  setSupportTicketService(service: SupportTicketService): void {
    this.supportTicketService = service;
  }

  /**
   * Checks if support ticket flow is active
   */
  isTicketFlowActive(): boolean {
    return this.supportTicketService?.isFlowActive() || false;
  }
}
