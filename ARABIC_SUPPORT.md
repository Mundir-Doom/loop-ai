# 🌍 Arabic Language Support

## ✨ What's New

Your chatbot now **fully supports Arabic**! 

### Features

✅ **Auto-Detects Arabic** - Knows when user is speaking Arabic  
✅ **Translates Questions** - Converts Arabic to English to search your data  
✅ **Translates Answers** - Converts English answers to Arabic  
✅ **Arabic Greetings** - Natural Arabic responses for hi/thanks/bye  
✅ **Bilingual** - Works seamlessly in both English and Arabic  

---

## 🎯 How It Works

### **Flow for Arabic Users:**

```
User asks in Arabic: "ما هي ساعات العمل؟"
     ↓
Bot detects: Arabic language (confidence: 95%)
     ↓
Translates to English: "What are your business hours?"
     ↓
Searches Google Sheets for answer
     ↓
Finds: "We're open Mon-Fri 9am-5pm"
     ↓
Translates back to Arabic: "نحن مفتوحون من الاثنين إلى الجمعة من 9 صباحاً إلى 5 مساءً"
     ↓
User receives Arabic answer ✅
```

---

## 📝 Examples

### Example 1: Greeting in Arabic
```
User: "مرحبا"
Bot: "مرحباً! 👋 كيف يمكنني مساعدتك اليوم؟"
```

### Example 2: Business Question in Arabic
```
User: "ما هي ساعات عملكم؟"
Bot: (Detects Arabic → Translates → Searches → Translates back)
     "نحن مفتوحون من الاثنين إلى الجمعة من 9 صباحاً إلى 5 مساءً"
```

### Example 3: Thanks in Arabic
```
User: "شكرا جزيلا"
Bot: "على الرحب والسعة! 😊 سعيد بمساعدتك!"
```

### Example 4: Mixed Conversation
```
User: "مرحبا"
Bot: "مرحباً! 👋 كيف يمكنني مساعدتك اليوم؟"

User: "أين موقعكم؟"
Bot: "نحن في شارع 123، المدينة" (translated from your Google Sheet)

User: "شكرا"
Bot: "على الرحب والسعة! 😊 سعيد بمساعدتك!"
```

---

## 🎨 Built-in Arabic Phrases

These are answered instantly without translation:

| Situation | Arabic Response |
|-----------|----------------|
| **Greeting** | مرحباً! 👋 كيف يمكنني مساعدتك اليوم؟ |
| **Thanks** | على الرحب والسعة! 😊 سعيد بمساعدتك! |
| **Goodbye** | مع السلامة! أتمنى لك يوماً رائعاً! 🌟 |
| **Loading** | جارٍ تحميل معلومات أعمالنا... |
| **Error** | أعتذر، واجهت خطأ. الرجاء المحاولة مرة أخرى. |

---

## 🔍 Language Detection

The bot automatically detects language by:

1. **Counting Arabic characters** (Unicode range 0600-06FF)
2. **If > 30% Arabic** → Treated as Arabic message
3. **Confidence score** → How sure it is (0-100%)

**Console output:**
```javascript
🌐 Language detected: { language: 'ar', confidence: 95 }
```

---

## 🌟 How Translations Work

### For Arabic Questions:
1. User asks in Arabic
2. **Translate to English** (for searching Google Sheets)
3. Search knowledge base in English
4. **Translate answer to Arabic**
5. Return Arabic response

### For English Questions:
1. User asks in English
2. Search knowledge base in English
3. Return English response (no translation)

---

## 💡 Best Practices

### 1. Keep Your Google Sheet in English
Your Google Sheet should remain in English:
```
| Question | Answer |
|----------|--------|
| What are your business hours? | We're open Mon-Fri 9am-5pm |
```

The bot will:
- Translate Arabic questions to English → Search
- Translate English answers to Arabic → Return

### 2. Add Arabic Keywords (Optional)
You can add Arabic keywords to help search:
```
| Question | Answer | Tags |
|----------|--------|------|
| What are your business hours? | Mon-Fri 9am-5pm | hours, ساعات |
```

---

## 🧪 Testing Arabic Support

Try these Arabic phrases:

**Greetings:**
- مرحبا
- السلام عليكم
- هاي

**Questions:**
- ما هي ساعات العمل؟
- أين موقعكم؟
- كيف يمكنني التواصل معكم؟

**Thanks:**
- شكرا
- شكرا جزيلا
- ممتاز

**Goodbye:**
- مع السلامة
- باي
- وداعا

---

## 🎯 Support Ticket in Arabic

If Arabic user needs support ticket:

```
User: "لدي مشكلة" (I have a problem)
Bot: (After 2 attempts)
     "سأوصلك بفريق الدعم للحصول على مساعدة متخصصة."
     
     "دعني أجمع بعض المعلومات لإنشاء تذكرة الدعم الخاصة بك.
     
      أولاً، ما هو اسمك الكامل؟"

User: "أحمد محمد"
Bot: "رائع! ما هو عنوان بريدك الإلكتروني؟"

[continues in Arabic...]
```

All support ticket collection happens in Arabic for Arabic users!

---

## 📊 How It Saves API Calls

### Direct Answers (No Translation Needed):
If exact match found in Google Sheets:
```
User: "ما هي ساعات العمل؟"
     ↓
Translate query: 1 API call
     ↓
Find direct answer in Sheet (no AI needed)
     ↓
Translate answer: 1 API call
     ↓
Total: 2 API calls
```

### AI-Powered Answers:
```
User: "اشرح لي ساعات العمل بالتفصيل"
     ↓
Translate query: 1 API call
     ↓
AI generates detailed answer: 1 API call
     ↓
Total: 2 API calls
```

---

## 🌐 Supported Languages

Currently:
- ✅ **English** (en)
- ✅ **Arabic** (ar)

Easy to add more languages by extending LanguageService!

---

## 🔧 Customization

### Add More Arabic Phrases

Edit `src/services/LanguageService.ts`:

```typescript
getArabicPhrase(key: string): string {
  const phrases: { [key: string]: string } = {
    greeting: 'مرحباً! 👋 كيف يمكنني مساعدتك اليوم؟',
    // Add your custom phrases here:
    welcome: 'أهلا وسهلا',
    help: 'كيف يمكنني المساعدة؟',
  };
  return phrases[key] || '';
}
```

### Adjust Language Detection Threshold

Edit `src/services/LanguageService.ts`:

```typescript
// If more than 30% Arabic characters, consider it Arabic
if (arabicRatio > 0.3) {  // Change 0.3 to be more/less strict
```

---

## ✅ Summary

Your chatbot now:

✅ **Detects Arabic automatically**  
✅ **Translates questions to search your English data**  
✅ **Translates answers back to Arabic**  
✅ **Uses natural Arabic greetings**  
✅ **Handles support tickets in Arabic**  
✅ **Works seamlessly for bilingual customers**  

**Test it now with:** "مرحبا" or "ما هي ساعات العمل؟" 🚀
