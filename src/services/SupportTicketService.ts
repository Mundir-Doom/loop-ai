/**
 * Support Ticket Service
 * Manages the multi-step support ticket collection flow
 */

import type { TelegramService, SupportTicket } from './TelegramService';

export type TicketStep = 'idle' | 'collect_name' | 'collect_email' | 'collect_customer_number' | 'collect_problem' | 'submitting' | 'completed';

export interface TicketData {
  name?: string;
  email?: string;
  customerNumber?: string;
  problem?: string;
}

export interface TicketFlowState {
  currentStep: TicketStep;
  data: TicketData;
  isActive: boolean;
}

export class SupportTicketService {
  private telegramService: TelegramService;
  private currentState: TicketFlowState;

  constructor(telegramService: TelegramService) {
    this.telegramService = telegramService;
    this.currentState = {
      currentStep: 'idle',
      data: {},
      isActive: false,
    };
  }

  /**
   * Starts the support ticket collection flow
   */
  startTicketFlow(): string {
    this.currentState = {
      currentStep: 'collect_name',
      data: {},
      isActive: true,
    };

    return "Let me collect some information to create your support ticket.\n\nFirst, may I have your full name?";
  }

  /**
   * Processes user input based on current step
   */
  async processInput(userInput: string): Promise<string> {
    if (!this.currentState.isActive) {
      throw new Error('Ticket flow is not active');
    }

    const trimmedInput = userInput.trim();

    switch (this.currentState.currentStep) {
      case 'collect_name':
        return this.collectName(trimmedInput);

      case 'collect_email':
        return this.collectEmail(trimmedInput);

      case 'collect_customer_number':
        return this.collectCustomerNumber(trimmedInput);

      case 'collect_problem':
        return await this.collectProblem(trimmedInput);

      default:
        return "I'm sorry, something went wrong. Let me start over.";
    }
  }

  /**
   * Collects customer name
   */
  private collectName(name: string): string {
    // Check minimum length
    if (name.length < 2) {
      return "Please provide your full name (at least 2 characters).";
    }

    // Check for numbers in name (likely not a real name)
    if (/\d/.test(name)) {
      return "Please provide a valid name without numbers.";
    }

    // Check for special characters (except spaces, hyphens, apostrophes)
    if (/[^a-zA-Z\s'\-.]/.test(name)) {
      return "Please provide a valid name using only letters.";
    }

    // Check for at least first and last name (has a space)
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      return "Please provide your full name (first and last name). For example: John Smith";
    }

    // Check each name part is at least 2 characters
    for (const part of nameParts) {
      if (part.length < 2) {
        return "Please provide a complete name. Each part should be at least 2 letters.";
      }
    }

    // Format name properly (capitalize first letter of each word)
    const formattedName = nameParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');

    this.currentState.data.name = formattedName;
    this.currentState.currentStep = 'collect_email';

    return `Thank you, ${formattedName}! Now, what's your email address?`;
  }

  /**
   * Collects customer email
   */
  private collectEmail(email: string): string {
    // Remove any whitespace
    email = email.trim().toLowerCase();

    // Check basic format
    if (!email.includes('@') || !email.includes('.')) {
      return "That doesn't look like a valid email address. Please include '@' and a domain (e.g., name@example.com).";
    }

    // Comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return "Please provide a valid email address. Example: john.smith@example.com";
    }

    // Check for common typos in popular domains
    const commonTypos: { [key: string]: string } = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gnail.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
    };

    const [localPart, domain] = email.split('@');
    
    if (commonTypos[domain]) {
      return `Did you mean ${localPart}@${commonTypos[domain]}? Please check your email and type it again.`;
    }

    // Check if domain has at least one dot
    const domainParts = domain.split('.');
    if (domainParts.length < 2) {
      return "Please provide a complete email with a valid domain (e.g., @example.com).";
    }

    // Check if top-level domain is at least 2 characters
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      return "Please provide a valid email with a proper domain extension (like .com, .org, etc.).";
    }

    this.currentState.data.email = email;
    this.currentState.currentStep = 'collect_customer_number';

    return "Great! What's your customer number? (If you don't have one, just type 'N/A' or 'None')";
  }

  /**
   * Collects customer number
   */
  private collectCustomerNumber(customerNumber: string): string {
    const trimmed = customerNumber.trim();

    // Check if user doesn't have a customer number
    const noNumberVariations = ['n/a', 'na', 'none', 'no', 'dont have', "don't have", 'not applicable'];
    const isNoNumber = noNumberVariations.some(variation => 
      trimmed.toLowerCase() === variation || trimmed.toLowerCase().includes(variation)
    );

    if (isNoNumber) {
      this.currentState.data.customerNumber = 'N/A';
      this.currentState.currentStep = 'collect_problem';
      return "No problem! Now, please describe your issue in detail. The more information you provide, the better we can help you.";
    }

    // Validate customer number format
    // Remove spaces and hyphens for validation
    const cleanNumber = trimmed.replace(/[\s\-]/g, '');

    // Check if it contains only alphanumeric characters
    if (!/^[A-Za-z0-9]+$/.test(cleanNumber)) {
      return "Customer numbers should only contain letters and numbers. Please provide a valid customer number or type 'N/A' if you don't have one.";
    }

    // Check minimum length
    if (cleanNumber.length < 3) {
      return "That customer number seems too short. Please check and try again, or type 'N/A' if you don't have one.";
    }

    // Check maximum length (most customer numbers are reasonable length)
    if (cleanNumber.length > 20) {
      return "That customer number seems too long. Please check and try again, or type 'N/A' if you don't have one.";
    }

    // Store the formatted version (uppercase)
    this.currentState.data.customerNumber = cleanNumber.toUpperCase();
    this.currentState.currentStep = 'collect_problem';

    return "Perfect! Now, please describe your problem in detail. The more information you provide, the better we can help you.";
  }

  /**
   * Collects problem description and submits ticket
   */
  private async collectProblem(problem: string): Promise<string> {
    const trimmed = problem.trim();

    // Check minimum length
    if (trimmed.length < 10) {
      return "Please provide more details about your problem (at least 10 characters). The more details you provide, the better we can help!";
    }

    // Check if it's just repeated characters or keyboard mashing
    if (/^(.)\1{9,}$/.test(trimmed) || /^[^a-zA-Z0-9\s]{10,}$/.test(trimmed)) {
      return "Please provide a meaningful description of your problem so we can help you effectively.";
    }

    // Check for minimum number of words (at least 3)
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);
    if (words.length < 3) {
      return "Please describe your problem in more detail (at least 3 words). For example: 'I cannot log into my account after password reset.'";
    }

    this.currentState.data.problem = trimmed;
    this.currentState.currentStep = 'submitting';

    try {
      // Create the ticket
      const ticket: SupportTicket = {
        name: this.currentState.data.name!,
        email: this.currentState.data.email!,
        customerNumber: this.currentState.data.customerNumber!,
        problem: this.currentState.data.problem!,
        timestamp: new Date().toLocaleString(),
      };

      // Send to Telegram
      await this.telegramService.sendSupportTicket(ticket);

      // Generate summary
      const summary = this.generateSummary(ticket);

      // Mark as completed
      this.currentState.currentStep = 'completed';
      this.currentState.isActive = false;

      return summary;
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      return "I apologize, but I encountered an error while submitting your ticket. Please try contacting us directly at support@example.com or call our support line.";
    }
  }

  /**
   * Generates a summary of the submitted ticket
   */
  private generateSummary(ticket: SupportTicket): string {
    return `✅ Your support ticket has been submitted successfully!

📋 **Summary:**
• Name: ${ticket.name}
• Email: ${ticket.email}
• Customer #: ${ticket.customerNumber}
• Problem: ${ticket.problem}

Our support team has been notified and will contact you at ${ticket.email} within 24 hours. 

Is there anything else I can help you with?`;
  }

  /**
   * Gets the current flow state
   */
  getFlowState(): TicketFlowState {
    return { ...this.currentState };
  }

  /**
   * Checks if ticket flow is active
   */
  isFlowActive(): boolean {
    return this.currentState.isActive;
  }

  /**
   * Resets the ticket flow
   */
  resetFlow(): void {
    this.currentState = {
      currentStep: 'idle',
      data: {},
      isActive: false,
    };
  }

  /**
   * Cancels the ticket flow
   */
  cancelFlow(): string {
    this.resetFlow();
    return "Support ticket submission cancelled. How else can I help you?";
  }
}
