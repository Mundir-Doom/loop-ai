# Restricted Business Chatbot - Setup Guide

This chatbot is configured to ONLY answer questions based on your Google Sheets data. Any questions outside the scope of your business data will receive a redirect message to connect with a live agent.

## 🎯 Features

- **Knowledge Base Restriction**: Only answers questions from your Google Sheets
- **Query Relevance Checking**: Uses AI to determine if questions are in-scope
- **Graceful Fallback**: Redirects out-of-scope queries to live agents
- **Clean Architecture**: Modular, upgradable services
- **Caching**: Reduces API calls to Google Sheets

## 📋 Prerequisites

1. **OpenRouter API Key** - For DeepSeek AI model
2. **Google Cloud Project** - For Google Sheets API access
3. **Google Sheets** - Your business data spreadsheet

## 🔧 Setup Instructions

### Step 1: Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create an API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key
   - (Optional) Restrict the API key to only Google Sheets API

### Step 2: Prepare Your Google Sheet

1. Open your business data Google Sheet
2. Make sure your data has:
   - **First row as headers** (column names)
   - **Data starting from row 2**
   - **Relevant business information**

3. **Make the sheet accessible**:
   - Option A (Public): Share > "Anyone with the link can view"
   - Option B (Private): Use OAuth 2.0 (requires additional setup)

4. **Get your Sheet ID**:
   - Copy from URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`

### Step 3: Configure Environment Variables

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Fill in your credentials:

```env
# OpenRouter API
VITE_OPENROUTER_API_KEY=your_openrouter_key

# Google Sheets
VITE_GOOGLE_SHEETS_API_KEY=your_google_api_key
VITE_GOOGLE_SHEET_ID=your_sheet_id
VITE_GOOGLE_SHEET_RANGE=Sheet1
```

### Step 4: Run the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📊 Google Sheets Format Example

Your Google Sheet should be structured like this:

| Question | Answer | Category | Tags |
|----------|--------|----------|------|
| What are your business hours? | We're open Mon-Fri 9am-5pm | Hours | hours, schedule |
| What services do you offer? | We offer web development, mobile apps, and consulting | Services | services, offerings |
| How can I contact support? | Email support@example.com or call 555-1234 | Contact | contact, support |

**Tips:**
- Include common customer questions
- Add detailed answers
- Use categories for organization
- Add tags for better search

## 🏗️ Architecture

```
src/
├── services/
│   ├── GoogleSheetsService.ts    # Fetches data from Google Sheets
│   ├── KnowledgeBaseService.ts   # Manages knowledge base & relevance
│   ├── ChatService.ts            # Handles AI chat with constraints
│   └── index.ts                  # Service exports
├── components/
│   ├── ChatMessage.tsx
│   ├── EmptyState.tsx
│   └── ThinkingAnimation.tsx
└── App.tsx                       # Main application
```

### Service Breakdown

**GoogleSheetsService**
- Fetches data from Google Sheets API
- Caches data for 5 minutes to reduce API calls
- Converts sheet data into searchable format

**KnowledgeBaseService**
- Loads and manages the knowledge base
- Checks query relevance using AI
- Retrieves relevant context for queries

**ChatService**
- Orchestrates the chat flow
- Enforces knowledge base constraints
- Returns out-of-scope message when needed

## 🎨 Customization

### Change the Out-of-Scope Message

Edit `/src/services/ChatService.ts`:

```typescript
private readonly OUT_OF_SCOPE_MESSAGE = 
  "Your custom message here";
```

### Adjust Relevance Threshold

Edit `/src/services/ChatService.ts` line ~51:

```typescript
if (!relevanceCheck.isRelevant || relevanceCheck.confidence < 40) {
  // Change 40 to your desired threshold (0-100)
```

### Change Cache Duration

Edit `/src/services/GoogleSheetsService.ts` line ~22:

```typescript
private cacheDuration: number = 5 * 60 * 1000; // 5 minutes
```

### Use Different AI Model

Edit `/src/services/ChatService.ts` or pass in config:

```typescript
model: 'deepseek/deepseek-chat-v3.1:free'
// Change to any OpenRouter supported model
```

## 🧪 Testing

### Test In-Scope Questions
1. Ask questions directly related to your Google Sheets data
2. Bot should answer using the knowledge base

### Test Out-of-Scope Questions
1. Ask general questions: "What's the weather?"
2. Ask unrelated questions: "Tell me a joke"
3. Bot should respond with the redirect message

## 🔒 Security Best Practices

1. **Never commit .env files** - Already in .gitignore
2. **Restrict API keys** - Use Google Cloud's API restrictions
3. **Use private sheets** - Implement OAuth for sensitive data
4. **Rate limiting** - Consider adding rate limits for production

## 🚀 Deployment

The app is configured for static hosting. You can deploy to:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **Render**: See `deploy_important.md`
- **GitHub Pages**: `npm run build` then deploy `/build`

**Important**: Make sure to set environment variables in your hosting platform!

## 📈 Monitoring

Check browser console for:
- ✅ "Services initialized successfully"
- 📊 Knowledge base summary
- ❌ Any initialization errors

## 🐛 Troubleshooting

### "Google Sheets configuration is incomplete"
- Check `.env` file has `VITE_GOOGLE_SHEETS_API_KEY` and `VITE_GOOGLE_SHEET_ID`
- Restart dev server after changing `.env`

### "Google Sheets API error: 403"
- API key might not have access
- Check if Google Sheets API is enabled
- Verify sheet is shared publicly or with the API key

### "Empty response from AI"
- Check OpenRouter API key is valid
- Check your OpenRouter account has credits
- Verify network connection

### Bot answers out-of-scope questions
- Lower the confidence threshold (currently 40)
- Check if your knowledge base loaded correctly
- Review the relevance checking prompt

## 📚 Further Improvements

1. **Add authentication** - Restrict who can use the chatbot
2. **Implement OAuth** - For private Google Sheets
3. **Add analytics** - Track query patterns
4. **Multi-sheet support** - Load data from multiple sheets
5. **Admin panel** - Manage knowledge base without editing code
6. **Vector search** - Use embeddings for better relevance matching
7. **Agent handoff** - Actually connect to live chat system
8. **A/B testing** - Test different relevance thresholds

## 💡 Pro Tips

1. **Structure your Google Sheet well** - Better data = better answers
2. **Include FAQs** - Common questions get faster answers
3. **Update regularly** - Keep your knowledge base current
4. **Test thoroughly** - Try edge cases before launching
5. **Monitor usage** - See what users ask most

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Review this guide
3. Check your environment variables
4. Verify API keys are active

---

Built with ❤️ using React, TypeScript, and modern AI
