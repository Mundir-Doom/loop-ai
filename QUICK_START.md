# Quick Start Guide - Restricted Business Chatbot

## 🚀 Quick Setup (5 minutes)

### 1. Get Google Sheets API Key
1. Visit: https://console.cloud.google.com/apis/credentials
2. Create API Key
3. Enable Google Sheets API

### 2. Prepare Your Google Sheet
1. Create a Google Sheet with your business data
2. **First row = headers** (e.g., Question, Answer, Category)
3. Share > "Anyone with the link can view"
4. Copy Sheet ID from URL

### 3. Configure Environment
```bash
# Copy the example
cp .env.example .env

# Edit .env and add:
VITE_OPENROUTER_API_KEY=your_openrouter_key
VITE_GOOGLE_SHEETS_API_KEY=your_google_api_key
VITE_GOOGLE_SHEET_ID=your_sheet_id
VITE_GOOGLE_SHEET_RANGE=Sheet1
```

### 4. Run
```bash
npm install
npm run dev
```

## 📝 Example Google Sheet Structure

| Question | Answer | Category |
|----------|--------|----------|
| What are your hours? | Mon-Fri 9am-5pm | Hours |
| Where are you located? | 123 Main St, City | Location |
| How can I contact you? | Email: info@example.com | Contact |

## ✅ How It Works

1. **User asks a question**
2. **AI checks if it's related to your Google Sheets data**
   - ✅ Related → Answers using your data
   - ❌ Not related → "May I connect you to an agent?"
3. **Bot NEVER answers general questions** (weather, jokes, etc.)

## 🎯 Test It

**✅ Should Answer:**
- "What are your business hours?"
- "How can I contact support?"
- Questions about YOUR business

**❌ Should Redirect:**
- "What's the weather?"
- "Tell me a joke"
- General knowledge questions

## 📖 Full Documentation
See `SETUP_GUIDE.md` for detailed information.

## 🛠️ Troubleshooting

### "Google Sheets configuration is incomplete"
→ Check your `.env` file and restart the dev server

### "API error: 403"
→ Make sure your Google Sheet is shared publicly

### Bot answers everything
→ Lower the confidence threshold in `ChatService.ts` line 51

---

**Need Help?** Check the console for error messages!
