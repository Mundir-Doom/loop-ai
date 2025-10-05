/**
 * Friendly Response Service
 * Handles greetings, thanks, and casual conversation
 */

export interface FriendlyResponse {
  isFriendly: boolean;
  response?: string;
}

export class FriendlyResponseService {
  private greetings = [
    'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 
    'good evening', 'howdy', 'hi there', 'hello there', 'hey there',
    'whats up', "what's up", 'sup', 'yo'
  ];

  private thanks = [
    'thank', 'thanks', 'thank you', 'thx', 'thanx', 'appreciate',
    'appreciated', 'grateful', 'awesome', 'great', 'perfect',
    'nice', 'helpful', 'you helped', 'you\'re helpful'
  ];

  private goodbyes = [
    'bye', 'goodbye', 'good bye', 'see you', 'see ya', 'later',
    'catch you later', 'gotta go', 'have a good', 'take care'
  ];

  private greetingResponses = [
    "Hello! 👋 How can I help you today?",
    "Hi there! 😊 What can I do for you?",
    "Hey! Great to see you! How may I assist you today?",
    "Hello! I'm here to help. What do you need?",
    "Hi! 🌟 How can I make your day better?",
  ];

  private thanksResponses = [
    "You're very welcome! 😊 Happy to help!",
    "My pleasure! Is there anything else I can assist you with?",
    "Glad I could help! 🌟 Feel free to ask if you need anything else!",
    "You're welcome! That's what I'm here for! 😊",
    "Anytime! Let me know if you need anything else!",
    "I'm happy I could help! Don't hesitate to reach out again! 💙",
  ];

  private goodbyeResponses = [
    "Goodbye! Have a wonderful day! 🌟",
    "Take care! Feel free to come back anytime! 😊",
    "See you later! Have a great day! 👋",
    "Bye! Don't hesitate to return if you need help! 💙",
    "Have a fantastic day! See you soon! 🌞",
  ];

  /**
   * Checks if the message is a friendly/social interaction
   */
  checkFriendlyMessage(message: string): FriendlyResponse {
    const lowerMessage = message.toLowerCase().trim();
    
    // Remove punctuation for better matching
    const cleanMessage = lowerMessage.replace(/[!?.,;:]/g, '');

    // Check for greetings
    if (this.isGreeting(cleanMessage)) {
      return {
        isFriendly: true,
        response: this.getRandomResponse(this.greetingResponses),
      };
    }

    // Check for thanks
    if (this.isThanks(cleanMessage)) {
      return {
        isFriendly: true,
        response: this.getRandomResponse(this.thanksResponses),
      };
    }

    // Check for goodbyes
    if (this.isGoodbye(cleanMessage)) {
      return {
        isFriendly: true,
        response: this.getRandomResponse(this.goodbyeResponses),
      };
    }

    // Check for simple yes/no responses
    if (this.isSimpleAffirmative(cleanMessage)) {
      return {
        isFriendly: true,
        response: "Great! How else can I help you? 😊",
      };
    }

    // Check for "how are you"
    if (this.isHowAreYou(cleanMessage)) {
      return {
        isFriendly: true,
        response: "I'm doing great, thank you for asking! 😊 How can I help you today?",
      };
    }

    return {
      isFriendly: false,
    };
  }

  /**
   * Checks if message is a greeting
   */
  private isGreeting(message: string): boolean {
    // Check for exact matches or at the start of message
    return this.greetings.some(greeting => {
      const words = message.split(' ');
      return words.includes(greeting) || message.startsWith(greeting);
    });
  }

  /**
   * Checks if message is a thanks
   */
  private isThanks(message: string): boolean {
    return this.thanks.some(thank => message.includes(thank));
  }

  /**
   * Checks if message is a goodbye
   */
  private isGoodbye(message: string): boolean {
    return this.goodbyes.some(goodbye => message.includes(goodbye));
  }

  /**
   * Checks if message is "how are you"
   */
  private isHowAreYou(message: string): boolean {
    const howAreYouPatterns = [
      'how are you',
      'how r u',
      'hows it going',
      "how's it going",
      'how are things',
      'you doing ok',
      'are you ok',
      'you good'
    ];
    return howAreYouPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Checks if message is simple affirmative
   */
  private isSimpleAffirmative(message: string): boolean {
    const affirmatives = ['yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'alright'];
    const words = message.split(' ');
    return words.length <= 2 && affirmatives.some(aff => message === aff);
  }

  /**
   * Gets a random response from array
   */
  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Adds custom greeting responses
   */
  addGreetingResponse(response: string): void {
    this.greetingResponses.push(response);
  }

  /**
   * Adds custom thanks responses
   */
  addThanksResponse(response: string): void {
    this.thanksResponses.push(response);
  }

  /**
   * Adds custom goodbye responses
   */
  addGoodbyeResponse(response: string): void {
    this.goodbyeResponses.push(response);
  }
}
