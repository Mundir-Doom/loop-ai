


ihave built a multi-channel AI Support Agent that:
	•	Reads customer messages (from your frontend form or chatbot)
	•	Checks your Google Sheets knowledge base
	•	Uses OpenRouter (DeepSeek V3.1 model) to generate accurate, polite responses
	•	Automatically detects complex issues and escalates them to your Telegram support group
	•	Returns a structured HTTP response (for frontend use)
	•	Can be directly connected to your React chatbot page
[
  {
    "role": "system",
    "content": "You are a helpful support AI assistant..."
  },
  {
    "role": "user",
    "content": "Customer info...\nKnowledge base matches (JSON): [...]"
  }
]

5.	openrouter_decide_answer
Sends this conversation to OpenRouter (DeepSeek model).
Returns an AI-generated reply, structured as choices[0].message.content.
	6.	filter
Logic gate to decide whether the issue is simple or complex:
	•	If is_complex === true, it continues workflow (to notify support).
	•	If not, it ends the flow (simple AI-only response).
	7.	send_telegram_message
Sends a summary to your Telegram group (using your bot and group ID).
The message includes:
	•	Customer reason
	•	AI suggestion (from OpenRouter)
Example Telegram message:
⚠️ Complex case detected!
Reason: Customer issue not in KB
AI Suggestion: "Please check payment gateway configuration..."
	8.	return_http_response
Sends a structured HTTP JSON response back to the frontend, including:
{
  "aiReply": "Hello! Please try restarting your app...",
  "escalationStatus": "none",
  "contactInfoRequired": false,
  "knowledgeBaseHits": 2,
  "timestamp": "2025-10-05T23:59:00Z"
}

🧩 React Frontend Integration
{
  "message": "I can't access my dashboard",
  "name": "Sara",
  "email": "sara@domain.com",
  "phone": "555-0101"
}
It receives:
{
  "aiReply": "Please log out and back in — if it persists, we’ll escalate it.",
  "escalationStatus": "none",
  "contactInfoRequired": false,
  "knowledgeBaseHits": 1
}
Then displays it in your chat UI.
If contactInfoRequired or escalationStatus = "escalated", it shows a follow-up prompt.

⸻

🧾 Example Telegram Message (if complex
🚨 Escalation Alert
Reason: No KB match or ambiguous message
AI Suggestion: "The customer’s account may have syncing issues."
Customer Info:
- Name: Sara
- Email: sara@domain.com
- Phone: 555-0101
Message: "I can’t see my dashboard anymore."
⸻

⚙️ Architecture Summary

🟩 1. Pipedream Flow Components

Trigger:
Starts the workflow when a POST request is sent from your React frontend (webhook endpoint).

Steps in the Flow:
	1.	code – Knowledge Base Preparation
Ensures knowledge base data from Google Sheets is ready to be searched.
	2.	get_rows_from_google_sheets
Fetches data from your support or FAQ sheet, where each row is a known issue + solution.
	3.	match_kb_items
Compares the incoming customer message with your KB data.
Exports:
	•	matches: Related KB items
	•	is_complex: Whether it’s a complex issue
	•	customerInfo: Extracted name, email, phone, message
	•	reason: Why it was classified that way
	4.	Build_openrouter_message (Node.js)
Generates the proper messages array for OpenRouter.
It creates a system + user message like this:
⸻

1) Grab your endpoint URL

In Pipedream, open your HTTP trigger step and copy the endpoint URL (it looks like https://eoxc...m.pipedream.net).

Put it in your React app as an env var:
# .env
REACT_APP_SUPPORT_BOT_URL= https://eoxc461dc8hjfjr.m.pipedream.net

2) What your frontend should POST

Your pipeline expects a request body like this (you can extend it later):
{
  "message": "Hi, my payment failed twice.",
  "name": "Alex Doe",
  "email": "alex@example.com",
  "phone": "+1 555 0100"
}

Your Pipedream flow replies with JSON like:
{
  "aiReply": "Please try re-adding your card and check the CVV...",
  "escalationStatus": "none | escalated | pending | resolved",
  "contactInfoRequired": true,
  "knowledgeBaseHits": 2,
  "timestamp": "2025-10-05T08:20:33.123Z",
  "metadata": { "...optional fields..." }
}

3) Drop-in React component

Paste this into your app as SupportChat.jsx (or similar). It’s a minimal, production-safe pattern with loading state, quick error handling, and support for collecting contact info if your flow asks for it.

import React, { useState, useRef, useEffect } from "react";

const PD_URL = process.env.REACT_APP_SUPPORT_BOT_URL;

export default function SupportChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Basic contact fields (optional)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !PD_URL) return;

    // add user's message to UI
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(PD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Optional shared secret header if you add a check in the trigger step:
          // "X-Client-Token": process.env.REACT_APP_CLIENT_TOKEN
        },
        body: JSON.stringify({
          message: text,
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status} – ${errText}`);
      }

      const data = await res.json();
      const {
        aiReply = "Sorry, I couldn't generate a reply.",
        escalationStatus = "none",
        contactInfoRequired = false,
        knowledgeBaseHits,
      } = data;

      // show AI message
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: aiReply,
          meta: {
            escalated: escalationStatus === "escalated",
            kbHits: knowledgeBaseHits,
          },
        },
      ]);

      // if the backend says we need contact info, prompt the user
      if (contactInfoRequired) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text:
              "Could you share your name, email, and phone so we can follow up? " +
              "You can fill the fields above and send your next message.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Network error. Please try again shortly." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.panel}>
        <h3 style={{ margin: 0 }}>Support</h3>

        {/* Optional contact fields (use if your flow sets contactInfoRequired=true) */}
        <div style={styles.row}>
          <input
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <input
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.chat}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.msg,
                ...(m.role === "user" ? styles.user : styles.assistant),
              }}
            >
              <div>{m.text}</div>
              {m.meta?.kbHits !== undefined && (
                <div style={styles.meta}>
                  KB hits: {m.meta.kbHits}{" "}
                  {m.meta.escalated ? " • escalated to human" : ""}
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form onSubmit={sendMessage} style={styles.row}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loading ? "Thinking..." : "Type your message"}
            disabled={loading}
            style={{ ...styles.input, flex: 1 }}
          />
          <button disabled={loading || !input.trim()} style={styles.btn}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", justifyContent: "center", padding: 16 },
  panel: {
    width: 520,
    maxWidth: "100%",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  chat: {
    height: 360,
    overflowY: "auto",
    border: "1px solid #eee",
    borderRadius: 8,
    padding: 12,
    margin: "8px 0 12px",
    background: "#fafafa",
  },
  msg: {
    padding: "10px 12px",
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: "80%",
    lineHeight: 1.4,
  },
  user: { marginLeft: "auto", background: "#DCF3FF" },
  assistant: { marginRight: "auto", background: "#fff" },
  meta: { fontSize: 12, opacity: 0.6, marginTop: 6 },
  row: { display: "flex", gap: 8, marginTop: 8 },
  input: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    flex: 1,
  },
  btn: {
    padding: "10px 14px",
    border: 0,
    borderRadius: 8,
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },
};

you are a proffesional senior developer
make your code clean and efficient without affecting the site workflow
and be carfull not to touch the structre and site functunality, make the code clean