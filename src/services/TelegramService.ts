/**
 * Telegram Service
 * Handles sending support tickets to Telegram group via bot API
 * 
 * Setup Instructions:
 * 1. Create a Telegram bot: Talk to @BotFather on Telegram
 * 2. Get your bot token
 * 3. Add bot to your group chat
 * 4. Get the chat ID (can be negative number for groups)
 * 5. Add VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID to .env
 */

export interface SupportTicket {
  name: string;
  email: string;
  customerNumber: string;
  problem: string;
  timestamp: string;
}

export class TelegramService {
  private botToken: string;
  private chatId: string;

  constructor(botToken: string, chatId: string) {
    this.botToken = botToken;
    this.chatId = chatId;
  }

  /**
   * Sends a support ticket to Telegram group
   */
  async sendSupportTicket(ticket: SupportTicket): Promise<boolean> {
    try {
      const message = this.formatTicketMessage(ticket);
      
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Telegram API error:', errorData);
        throw new Error(`Telegram API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Support ticket sent to Telegram:', data);
      return true;
    } catch (error) {
      console.error('❌ Failed to send support ticket to Telegram:', error);
      throw error;
    }
  }

  /**
   * Formats the support ticket as a nice Telegram message
   */
  private formatTicketMessage(ticket: SupportTicket): string {
    return `
🎫 <b>NEW SUPPORT TICKET</b>

👤 <b>Customer Information:</b>
• Name: ${this.escapeHtml(ticket.name)}
• Email: ${this.escapeHtml(ticket.email)}
• Customer #: ${this.escapeHtml(ticket.customerNumber)}

📝 <b>Problem Description:</b>
${this.escapeHtml(ticket.problem)}

🕐 <b>Submitted:</b> ${ticket.timestamp}

━━━━━━━━━━━━━━━━━━━━
<i>Sent via AI Chatbot</i>
    `.trim();
  }

  /**
   * Escapes HTML special characters for Telegram
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Tests the Telegram connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/getMe`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      console.log('✅ Telegram bot connected:', data.result.username);
      return true;
    } catch (error) {
      console.error('❌ Telegram connection test failed:', error);
      return false;
    }
  }
}
