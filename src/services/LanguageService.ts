/**
 * Language Service
 * Handles language detection and translation between English and Arabic
 */

export type Language = 'en' | 'ar';

export interface LanguageDetection {
  language: Language;
  confidence: number;
}

export class LanguageService {
  /**
   * Detects if the text is in Arabic or English
   */
  detectLanguage(text: string): LanguageDetection {
    // Remove spaces and punctuation for analysis
    const cleanText = text.replace(/[\s\d\p{P}]/gu, '');
    
    if (cleanText.length === 0) {
      return { language: 'en', confidence: 0 };
    }

    // Count Arabic characters (Unicode range for Arabic: 0600-06FF)
    const arabicChars = (cleanText.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = cleanText.length;
    const arabicRatio = arabicChars / totalChars;

    // If more than 30% Arabic characters, consider it Arabic
    if (arabicRatio > 0.3) {
      return {
        language: 'ar',
        confidence: Math.min(arabicRatio * 100, 100)
      };
    }

    return {
      language: 'en',
      confidence: Math.min((1 - arabicRatio) * 100, 100)
    };
  }

  /**
   * Translates text from English to Arabic using AI
   */
  async translateToArabic(
    text: string,
    apiKey: string,
    referer?: string,
    title?: string
  ): Promise<string> {
    try {
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
              content: 'You are a translator. Translate the following English text to Arabic. Only provide the translation, nothing else. Keep the tone professional and friendly.'
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        console.warn('Translation failed, returning original text');
        return text;
      }

      const data = await response.json();
      const translation = data.choices?.[0]?.message?.content?.trim();

      return translation || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  /**
   * Translates text from Arabic to English using AI
   */
  async translateToEnglish(
    text: string,
    apiKey: string,
    referer?: string,
    title?: string
  ): Promise<string> {
    try {
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
              content: 'You are a translator. Translate the following Arabic text to English. Only provide the translation, nothing else.'
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        console.warn('Translation failed, returning original text');
        return text;
      }

      const data = await response.json();
      const translation = data.choices?.[0]?.message?.content?.trim();

      return translation || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  /**
   * Gets common phrases in Arabic
   */
  getArabicPhrase(key: string): string {
    const phrases: { [key: string]: string } = {
      greeting: 'مرحباً! 👋 كيف يمكنني مساعدتك اليوم؟',
      thanks: 'على الرحب والسعة! 😊 سعيد بمساعدتك!',
      goodbye: 'مع السلامة! أتمنى لك يوماً رائعاً! 🌟',
      loading: 'جارٍ تحميل معلومات أعمالنا. الرجاء المحاولة مرة أخرى بعد لحظة.',
      error: 'أعتذر، واجهت خطأ. الرجاء المحاولة مرة أخرى.',
      clarify: 'هل يمكنك إخباري بالمزيد عما تحتاجه؟',
      rephrase: 'هل يمكنك إعادة صياغة سؤالك؟ أريد مساعدتك بشكل صحيح.',
      escalate: 'سأوصلك بفريق الدعم للحصول على مساعدة متخصصة.',
      collectName: 'دعني أجمع بعض المعلومات لإنشاء تذكرة الدعم الخاصة بك.\n\nأولاً، ما هو اسمك الكامل؟',
      collectEmail: 'رائع! ما هو عنوان بريدك الإلكتروني؟',
      collectCustomerNumber: 'عظيم! ما هو رقم العميل الخاص بك؟ (إذا لم يكن لديك، اكتب "لا يوجد")',
      collectProblem: 'ممتاز! الآن، يرجى وصف مشكلتك بالتفصيل. كلما قدمت معلومات أكثر، كان بإمكاننا مساعدتك بشكل أفضل.',
      ticketSuccess: '✅ تم تقديم تذكرة الدعم الخاصة بك بنجاح!\n\nسيتواصل معك فريق الدعم لدينا خلال 24 ساعة.',
    };

    return phrases[key] || '';
  }
}
