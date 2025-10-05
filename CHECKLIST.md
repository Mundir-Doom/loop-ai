# ✅ Setup Checklist

Use this checklist to get your restricted chatbot up and running.

## 📋 Pre-Launch Checklist

### 1. Google Sheets Setup
- [ ] Created Google Cloud Project
- [ ] Enabled Google Sheets API
- [ ] Created API Key
- [ ] Copied API Key to safe place
- [ ] Created business knowledge Google Sheet
- [ ] Added headers in first row (e.g., Question, Answer, Category)
- [ ] Added at least 5-10 FAQ entries
- [ ] Made sheet publicly viewable (Share → Anyone with link)
- [ ] Copied Sheet ID from URL

### 2. Environment Configuration
- [ ] Created `.env` file from `.env.example`
- [ ] Added `VITE_OPENROUTER_API_KEY`
- [ ] Added `VITE_GOOGLE_SHEETS_API_KEY`
- [ ] Added `VITE_GOOGLE_SHEET_ID`
- [ ] Set `VITE_GOOGLE_SHEET_RANGE` (or use default "Sheet1")
- [ ] Verified `.env` is in `.gitignore`

### 3. Installation
- [ ] Ran `npm install`
- [ ] No installation errors
- [ ] All dependencies installed

### 4. First Run
- [ ] Ran `npm run dev`
- [ ] Server started on port 3000
- [ ] Browser opened automatically
- [ ] Saw "Loading business knowledge base..." message
- [ ] No red error banner
- [ ] Console shows: "✅ Services initialized successfully"
- [ ] Console shows: "📊 Knowledge Base: X entries..."

### 5. Testing In-Scope Questions
Test with questions that ARE in your Google Sheet:

- [ ] Asked about business hours (if in sheet)
- [ ] Asked about services (if in sheet)
- [ ] Asked about contact info (if in sheet)
- [ ] Bot answered correctly using sheet data
- [ ] Answers were relevant and accurate

### 6. Testing Out-of-Scope Questions
Test with questions NOT in your Google Sheet:

- [ ] Asked: "What's the weather?"
- [ ] Asked: "Tell me a joke"
- [ ] Asked: "Who is the president?"
- [ ] Bot responded: "May I connect you to an agent?"
- [ ] Bot did NOT answer general questions

### 7. Configuration Tuning
- [ ] Tested with various question types
- [ ] Relevance threshold feels right (not too strict/loose)
- [ ] Adjusted threshold if needed (in `ChatService.ts`)
- [ ] Customized redirect message if needed
- [ ] Bot behavior matches requirements

### 8. Documentation Review
- [ ] Read `QUICK_START.md`
- [ ] Read `SETUP_GUIDE.md`
- [ ] Read `IMPLEMENTATION_SUMMARY.md`
- [ ] Read `ARCHITECTURE.md`
- [ ] Understand how to customize

## 🚀 Pre-Deployment Checklist

### 1. Final Testing
- [ ] Tested 10+ in-scope questions
- [ ] Tested 5+ out-of-scope questions
- [ ] Tested edge cases (half-related questions)
- [ ] No errors in console
- [ ] Performance is acceptable
- [ ] Mobile responsive

### 2. Security Review
- [ ] `.env` file not committed
- [ ] No API keys in code
- [ ] `.gitignore` properly configured
- [ ] Google Sheet is public (or OAuth configured)
- [ ] API key restrictions set in Google Cloud (optional)

### 3. Build & Deploy
- [ ] Ran `npm run build`
- [ ] Build succeeded
- [ ] Tested build locally
- [ ] Set environment variables in hosting platform
- [ ] Deployed to hosting (Vercel/Netlify/etc)
- [ ] Production URL works
- [ ] Environment variables loaded correctly

### 4. Production Testing
- [ ] Tested on production URL
- [ ] Knowledge base loads
- [ ] Chat works correctly
- [ ] In-scope questions answered
- [ ] Out-of-scope questions redirected
- [ ] No console errors
- [ ] Performance acceptable

## 🎯 Post-Launch Checklist

### 1. Monitoring
- [ ] Monitor for errors in hosting logs
- [ ] Check Google Sheets API usage
- [ ] Check OpenRouter API usage/costs
- [ ] Track common user questions

### 2. Optimization
- [ ] Add more FAQ entries based on usage
- [ ] Adjust relevance threshold if needed
- [ ] Improve Google Sheet organization
- [ ] Update documentation

### 3. Maintenance
- [ ] Schedule regular knowledge base updates
- [ ] Monitor API costs
- [ ] Update dependencies monthly
- [ ] Review user feedback

## 🆘 Troubleshooting Guide

### Issue: Red Error Banner
**Check:**
- [ ] `.env` file exists
- [ ] All required environment variables set
- [ ] API keys are correct
- [ ] Restarted dev server after changing `.env`

### Issue: "Google Sheets API error: 403"
**Check:**
- [ ] Google Sheets API is enabled
- [ ] API key is correct
- [ ] Sheet is publicly viewable
- [ ] Sheet ID is correct

### Issue: Bot Answers Everything
**Check:**
- [ ] Console shows knowledge base loaded
- [ ] Tried obvious out-of-scope questions
- [ ] Consider lowering confidence threshold
- [ ] Check `ChatService.ts` configuration

### Issue: Bot Answers Nothing
**Check:**
- [ ] Console shows knowledge base loaded
- [ ] Try questions directly from your sheet
- [ ] Consider raising confidence threshold
- [ ] Check sheet data format

## 📝 Quick Reference

### Important Files
- **Configuration**: `.env`
- **Main Logic**: `src/App.tsx`
- **Services**: `src/services/`
- **Customization**: `src/services/ChatService.ts`

### Key Configuration Points
- **Redirect Message**: `ChatService.ts` line 15
- **Confidence Threshold**: `ChatService.ts` line 51
- **Cache Duration**: `GoogleSheetsService.ts` line 22
- **AI Model**: `ChatService.ts` line 115

### Commands
```bash
# Development
npm run dev

# Build
npm run build

# Install
npm install
```

### Support Resources
- **Quick Start**: `QUICK_START.md`
- **Full Setup**: `SETUP_GUIDE.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **Architecture**: `ARCHITECTURE.md`

---

## ✅ Ready to Launch!

Once all items are checked, you're ready to go! 🚀

**Questions?** Review the documentation files listed above.
