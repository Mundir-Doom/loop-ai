# 🔍 Debug Instructions

## Your Google Sheets Data is Loading! ✅

I confirmed your data is there:
- Question: "What are your business hours?"
- Answer: "We're open Mon-Fri 9am-5pm"

## Debug Steps

### 1. Open Browser Console
1. Open http://localhost:3001/
2. Press F12 (or Cmd+Option+I on Mac)
3. Click "Console" tab

### 2. Check Initialization
Look for these messages when page loads:
```
✅ Services initialized successfully
📊 Knowledge Base: 2 entries...
📚 Knowledge Base Loaded: {entries: 2, headers: [...], firstEntry: {...}}
```

### 3. Test a Question
Type: "What are your business hours?"

### 4. Check Console Output
You should see:
```
🔍 Relevance Check: {
  query: "What are your business hours?",
  isRelevant: true/false,
  confidence: XX
}
```

### 5. Share This Info
Tell me:
- Is isRelevant true or false?
- What is the confidence number?
- Do you see the knowledge base loaded message?

## Possible Issues

**If confidence is low (<30):**
- The AI relevance checker is being too strict
- I'll adjust it further

**If knowledge base shows 0 entries:**
- Sheet isn't loading
- Check the .env file

**If you don't see console logs:**
- Make sure you're looking at the Console tab (not Network or Elements)
- Refresh the page

## Quick Fix: Try Direct Answer

Meanwhile, let me add a bypass so "business hours" questions are ALWAYS answered...
