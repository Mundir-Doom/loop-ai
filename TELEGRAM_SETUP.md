# 🤖 Telegram Support Ticket Setup Guide

This guide will help you set up the Telegram integration so support tickets are automatically sent to your Telegram group.

## 📋 Prerequisites

- A Telegram account
- Admin access to a Telegram group (or create a new one)

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** with BotFather
3. **Send command:** `/newbot`
4. **Choose a name** for your bot (e.g., "Support Ticket Bot")
5. **Choose a username** (must end in 'bot', e.g., "mysupport_ticket_bot")
6. **Copy the bot token** (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

**Example:**
```
BotFather: Alright, a new bot. How are we going to call it?
You: Support Ticket Bot

BotFather: Good. Now let's choose a username for your bot.
You: mysupport_ticket_bot

BotFather: Done! Here's your token: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Step 2: Create or Choose a Telegram Group

**Option A: Create New Group**
1. In Telegram, click **"New Group"**
2. Add a name (e.g., "Support Tickets")
3. Add at least one member initially
4. Click **"Create"**

**Option B: Use Existing Group**
- Use any existing group where you want tickets sent

### Step 3: Add Your Bot to the Group

1. **Open your group**
2. Click **group name** → **"Add Members"**
3. **Search for your bot** (by username)
4. **Add the bot** to the group
5. **Make bot an admin** (optional but recommended):
   - Click group name → "Administrators" → "Add Administrator"
   - Select your bot
   - Grant "Send Messages" permission

### Step 4: Get Your Chat ID

There are several ways to get your group's chat ID:

**Method 1: Using Web Browser (Easiest)**
1. **Send a message** to your group (any message)
2. **Open this URL** in your browser:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
   Replace `<YOUR_BOT_TOKEN>` with your actual token
3. **Look for "chat"** section in the response
4. **Copy the "id"** (usually a negative number like `-1001234567890`)

**Example Response:**
```json
{
  "ok": true,
  "result": [{
    "message": {
      "chat": {
        "id": -1001234567890,  ← This is your chat ID!
        "title": "Support Tickets",
        "type": "supergroup"
      }
    }
  }]
}
```

**Method 2: Using a Bot**
1. Add `@RawDataBot` to your group
2. It will send you the chat ID
3. Remove the bot after getting the ID

**Method 3: Using get_id_bot**
1. Search for `@get_id_bot` on Telegram
2. Forward a message from your group to this bot
3. It will reply with the chat ID

### Step 5: Update Your .env File

Edit your `.env` file and add:

```env
# Telegram Bot Configuration
VITE_TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
VITE_TELEGRAM_CHAT_ID=-1001234567890
```

**Important Notes:**
- The bot token is the full string from BotFather
- The chat ID for groups is usually negative (starts with `-`)
- For private chats with the bot, the ID is positive

### Step 6: Test Your Setup

1. **Restart your app:**
   ```bash
   npm run dev
   ```

2. **Check console** for these messages:
   ```
   ✅ Telegram support ticket system enabled
   ✅ Telegram bot connected: your_bot_name
   ```

3. **Test the bot:**
   - Ask an out-of-scope question (e.g., "What's the weather?")
   - Follow the prompts to submit a support ticket
   - Check your Telegram group for the ticket message

---

## 🎯 How It Works

### User Flow

```
User asks out-of-scope question
         ↓
Bot: "I'd be happy to help you submit a support ticket..."
         ↓
Bot asks for: Name → Email → Customer # → Problem
         ↓
User provides information
         ↓
Bot summarizes and sends to Telegram
         ↓
Support team sees ticket in Telegram group
```

### Ticket Format

When a ticket is submitted, your Telegram group receives:

```
🎫 NEW SUPPORT TICKET

👤 Customer Information:
• Name: John Doe
• Email: john@example.com
• Customer #: 12345

📝 Problem Description:
I can't access my account after password reset

🕐 Submitted: 10/5/2025, 3:45:30 PM

━━━━━━━━━━━━━━━━━━━━
Sent via AI Chatbot
```

---

## 🧪 Testing Your Integration

### Test Script

Run this to test your Telegram connection:

```bash
cd /Users/mundiraboein/Downloads/apps/chatbot
node -e "
const fetch = require('node-fetch');
const token = 'YOUR_BOT_TOKEN';
const chatId = 'YOUR_CHAT_ID';

fetch(\`https://api.telegram.org/bot\${token}/sendMessage\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: chatId,
    text: '✅ Test message from chatbot! If you see this, the integration works!'
  })
})
.then(r => r.json())
.then(d => console.log('Result:', d))
.catch(e => console.error('Error:', e));
"
```

Replace `YOUR_BOT_TOKEN` and `YOUR_CHAT_ID` with your actual values.

### Manual Test via curl

```bash
# Test bot connection
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"

# Send test message
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "<YOUR_CHAT_ID>", "text": "Test message!"}'
```

---

## 🔧 Troubleshooting

### Issue: "Bot was kicked from the group"
**Solution:** Re-add the bot to the group

### Issue: "Chat not found"
**Solution:** 
- Verify chat ID is correct (should be negative for groups)
- Make sure bot is still in the group
- Try getting the chat ID again

### Issue: "Unauthorized"
**Solution:**
- Check bot token is correct
- Make sure there are no extra spaces in `.env`
- Bot token should be one continuous string

### Issue: Bot doesn't respond in group
**Solution:**
- Make bot an admin
- Or enable "Privacy Mode" off in BotFather:
  - Send `/mybots` to BotFather
  - Select your bot
  - Bot Settings → Group Privacy → Turn OFF

### Issue: Can't find chat ID
**Solution:**
1. Make sure you sent a message to the group AFTER adding the bot
2. Use `@RawDataBot` or `@get_id_bot` as alternative methods
3. Check the getUpdates URL returns data

### Issue: Messages not appearing in group
**Solution:**
- Verify bot has "Send Messages" permission
- Check bot is still in the group
- Try making bot an administrator

---

## 🔒 Security Best Practices

1. **Never commit `.env`** - It's already in `.gitignore`
2. **Keep bot token secret** - Anyone with it can control your bot
3. **Restrict bot permissions** - Only give necessary permissions
4. **Monitor bot usage** - Check for unexpected activity
5. **Rotate tokens** - If compromised, get new token from BotFather

### How to Regenerate Bot Token

If your token is compromised:
1. Go to `@BotFather`
2. Send `/mybots`
3. Select your bot
4. Click "API Token"
5. Click "Revoke current token"
6. Update `.env` with new token

---

## 📈 Advanced Configuration

### Custom Message Format

Edit `src/services/TelegramService.ts` to customize the ticket format:

```typescript
private formatTicketMessage(ticket: SupportTicket): string {
  // Customize this message format
  return `Your custom format here`;
}
```

### Multiple Groups

To send tickets to multiple groups:

```typescript
// In TelegramService.ts
const chatIds = ['-1001234567890', '-1009876543210'];
for (const chatId of chatIds) {
  // Send to each group
}
```

### Add Buttons

Add inline buttons to tickets:

```typescript
body: JSON.stringify({
  chat_id: this.chatId,
  text: message,
  parse_mode: 'HTML',
  reply_markup: {
    inline_keyboard: [[
      { text: '✅ Claim', callback_data: 'claim' },
      { text: '📧 Email', callback_data: 'email' }
    ]]
  }
})
```

---

## 📱 Mobile Setup

You can also use Telegram mobile app:

1. Install Telegram app
2. Follow same steps to create bot via BotFather
3. Create/use group on mobile
4. Get chat ID using web browser method
5. Bot will work on all devices once configured

---

## 🎓 Additional Resources

- **Telegram Bot API Docs:** https://core.telegram.org/bots/api
- **BotFather Commands:** https://core.telegram.org/bots#6-botfather
- **Creating Bots Tutorial:** https://core.telegram.org/bots/tutorial

---

## ✅ Quick Checklist

- [ ] Created bot via @BotFather
- [ ] Copied bot token
- [ ] Created/chose Telegram group
- [ ] Added bot to group
- [ ] Made bot admin (optional)
- [ ] Got chat ID using getUpdates or bot
- [ ] Updated `.env` with token and chat ID
- [ ] Restarted app (`npm run dev`)
- [ ] Checked console for "✅ Telegram support ticket system enabled"
- [ ] Tested with out-of-scope question
- [ ] Verified ticket appeared in Telegram group

---

## 💡 Pro Tips

1. **Use separate bots** for dev/prod environments
2. **Create dedicated group** for tickets (easier to manage)
3. **Set up notifications** on Telegram for new tickets
4. **Use Telegram Desktop** for easier copy/paste of IDs
5. **Test regularly** to ensure integration still works

---

Need help? Check the console logs for error messages or re-run the test script above! 🚀
