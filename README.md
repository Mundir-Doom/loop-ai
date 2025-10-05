# 🤖 Restricted Business Chatbot

A professional chatbot that **only answers questions from your Google Sheets knowledge base**. Built with React, TypeScript, DeepSeek AI via OpenRouter, and Google Sheets API.

## ✨ Key Features

- **🔒 Knowledge-Restricted**: Only answers questions from your Google Sheets data
- **🎯 Smart Query Detection**: AI-powered relevance checking
- **↩️ Graceful Fallback**: Redirects out-of-scope questions to live agents
- **⚡ Fast & Cached**: Optimized data fetching with caching
- **🏗️ Clean Architecture**: Modular, maintainable, and upgradable services
- **🎨 Modern UI**: Beautiful, responsive interface

## 🚀 Quick Start

See **[QUICK_START.md](QUICK_START.md)** for a 5-minute setup guide.

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get up and running in 5 minutes
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup and configuration guide
- **[deploy_important.md](deploy_important.md)** - Deployment instructions

## 🏗️ Architecture

```
src/
├── services/                      # Business logic layer
│   ├── GoogleSheetsService.ts     # Google Sheets API integration
│   ├── KnowledgeBaseService.ts    # Knowledge base management & relevance
│   ├── ChatService.ts             # AI chat with constraints
│   └── index.ts                   # Service exports
├── components/                    # UI components
│   ├── ChatMessage.tsx
│   ├── EmptyState.tsx
│   └── ThinkingAnimation.tsx
└── App.tsx                        # Main application
```

## 🎯 How It Works

1. **Loads Knowledge Base**: Fetches your business data from Google Sheets on startup
2. **User Asks Question**: User sends a query
3. **Relevance Check**: AI determines if the question is related to your business
4. **Conditional Response**:
   - ✅ **In-scope**: Answers using knowledge base context
   - ❌ **Out-of-scope**: Returns redirect message

## 🔧 Configuration

Create a `.env` file:

```env
# OpenRouter API
VITE_OPENROUTER_API_KEY=your_openrouter_key

# Google Sheets
VITE_GOOGLE_SHEETS_API_KEY=your_google_api_key
VITE_GOOGLE_SHEET_ID=your_sheet_id
VITE_GOOGLE_SHEET_RANGE=Sheet1
```

## 📊 Google Sheet Format

| Question | Answer | Category | Tags |
|----------|--------|----------|------|
| What are your business hours? | Mon-Fri 9am-5pm | Hours | hours, schedule |
| What services do you offer? | Web development, consulting | Services | services |
| How do I contact support? | support@example.com | Contact | support, contact |

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 🎨 Customization

### Change Out-of-Scope Message
Edit `src/services/ChatService.ts`:
```typescript
private readonly OUT_OF_SCOPE_MESSAGE = "Your custom message here";
```

### Adjust Relevance Threshold
Edit `src/services/ChatService.ts`:
```typescript
if (!relevanceCheck.isRelevant || relevanceCheck.confidence < 40) {
  // Change 40 to your threshold (0-100)
```

### Change AI Model
Edit `src/services/ChatService.ts`:
```typescript
model: 'deepseek/deepseek-chat-v3.1:free'
// Or any OpenRouter supported model
```

## 🧪 Testing

### Test In-Scope Questions
Ask questions related to your Google Sheets data:
- "What are your business hours?"
- "How can I contact support?"
- Bot should answer using the knowledge base

### Test Out-of-Scope Questions
Ask general/unrelated questions:
- "What's the weather today?"
- "Tell me a joke"
- Bot should respond: "May I connect you to an agent?"

## 🔒 Security

- ✅ Environment variables not committed
- ✅ API key restrictions supported
- ✅ No user data stored
- ✅ Public or OAuth-based sheet access

## 🚀 Deployment

Deploy to Vercel, Netlify, or any static hosting:

```bash
npm run build
# Deploy the /build directory
```

**Important**: Set environment variables in your hosting platform!

## 📈 Tech Stack

- **Frontend**: React 18 + TypeScript
- **AI**: DeepSeek via OpenRouter API
- **Data**: Google Sheets API
- **UI**: Tailwind CSS + Radix UI + Framer Motion
- **Build**: Vite

## 💡 Pro Tips

1. **Structure your Google Sheet well** - Better data = better answers
2. **Include common FAQs** - Faster, more accurate responses
3. **Test edge cases** - Try various question formats
4. **Monitor console logs** - Check initialization and errors
5. **Adjust thresholds** - Fine-tune relevance sensitivity

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Configuration incomplete" | Check `.env` file and restart server |
| "API error: 403" | Verify Google Sheet is shared publicly |
| Answers everything | Lower confidence threshold |
| Empty responses | Check OpenRouter API key and credits |

## 📄 License

MIT - See LICENSE file for details

## 🤝 Contributing

This is a custom business chatbot. For improvements:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

Built with ❤️ using modern web technologies