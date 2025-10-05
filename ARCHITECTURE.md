# 🏗️ System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                       │
│                          (App.tsx)                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Chat Service   │  │  Knowledge Base │  │   Google    │ │
│  │                 │→│    Service      │→│   Sheets    │ │
│  │  - Orchestrate  │  │  - Check        │  │  Service    │ │
│  │  - Constrain AI │  │    relevance    │  │  - Fetch    │ │
│  │  - History      │  │  - Get context  │  │    data     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│  DeepSeek AI │  │  Knowledge Base  │  │ Google       │
│  (OpenRouter)│  │  (In Memory)     │  │ Sheets API   │
└──────────────┘  └──────────────────┘  └──────────────┘
```

## Request Flow

### 1️⃣ User Sends Message
```
User Input: "What are your business hours?"
          ↓
    App.tsx (handleSend)
          ↓
   ChatService.sendMessage()
```

### 2️⃣ Relevance Check
```
ChatService
     ↓
KnowledgeBaseService.checkRelevance()
     ↓
DeepSeek AI (via OpenRouter)
     ↓
Returns: { isRelevant: true, confidence: 85 }
```

### 3️⃣ Decision Point
```
Is confidence > 40% ?
     ├─ YES → Continue to step 4
     └─ NO  → Return redirect message
```

### 4️⃣ Get Context (If Relevant)
```
KnowledgeBaseService.getRelevantContext()
     ↓
Search knowledge base for relevant rows
     ↓
Returns: "Business hours: Mon-Fri 9am-5pm..."
```

### 5️⃣ Send to AI with Constraints
```
ChatService.sendMessage()
     ↓
Build constrained prompt with:
  - System: "ONLY use knowledge base"
  - Context: Relevant data from sheet
  - History: Recent conversation
  - User query: Original question
     ↓
DeepSeek AI (via OpenRouter)
     ↓
Returns: "We're open Monday to Friday..."
```

### 6️⃣ Display Response
```
AI Response
     ↓
App.tsx (appendMessages)
     ↓
User sees answer
```

## Service Responsibilities

### 🔵 GoogleSheetsService
**Purpose:** Data access layer

**Responsibilities:**
- Fetch data from Google Sheets API
- Cache data for 5 minutes
- Parse sheet into structured format
- Convert to searchable text

**Key Methods:**
- `fetchSheetData()` - Gets sheet data
- `clearCache()` - Force refresh
- `searchRows()` - Keyword search

**Dependencies:**
- Google Sheets API

### 🟢 KnowledgeBaseService
**Purpose:** Knowledge management and query processing

**Responsibilities:**
- Load knowledge base from sheet data
- Check query relevance using AI
- Extract relevant context
- Manage knowledge state

**Key Methods:**
- `loadKnowledgeBase()` - Initialize KB
- `checkRelevance()` - Is query relevant?
- `getRelevantContext()` - Get matching data
- `isLoaded()` - Check initialization

**Dependencies:**
- DeepSeek AI (for relevance)
- Sheet data (from GoogleSheetsService)

### 🟡 ChatService
**Purpose:** Orchestration and AI interaction

**Responsibilities:**
- Coordinate the chat flow
- Enforce knowledge base constraints
- Maintain conversation history
- Handle out-of-scope queries

**Key Methods:**
- `sendMessage()` - Main entry point
- `updateConfig()` - Change settings

**Dependencies:**
- KnowledgeBaseService
- DeepSeek AI
- OpenRouter API

## Data Flow

### Initialization (On App Startup)
```
App.tsx useEffect
     ↓
1. Validate environment variables
     ↓
2. Create GoogleSheetsService
     ↓
3. Fetch sheet data (API call)
     ↓
4. Load into KnowledgeBaseService
     ↓
5. Create ChatService
     ↓
✅ Ready for queries
```

### Chat Flow (On User Message)
```
User types message
     ↓
App.tsx validates input
     ↓
ChatService.sendMessage()
     ├─ Step 1: Check relevance (AI call)
     │    ↓
     │  Is relevant?
     │    ├─ NO → Return redirect message ❌
     │    └─ YES → Continue ✅
     ├─ Step 2: Get context from KB
     │    ↓
     │  Search knowledge base
     │    ↓
     │  Extract relevant rows
     ├─ Step 3: Build constrained prompt
     │    ↓
     │  System: Strict instructions
     │  Context: Relevant data
     │  History: Recent messages
     │  Query: User question
     └─ Step 4: Send to AI (API call)
          ↓
       Format response
          ↓
       Return to App.tsx
          ↓
       Display to user
```

## State Management

### App Level State
```typescript
- messages: Message[]              // Chat history
- inputValue: string               // Current input
- isThinking: boolean              // Loading state
- isInitializing: boolean          // Startup state
- initError: string                // Error message
```

### Service Level State
```typescript
GoogleSheetsService:
- cache: SheetData | null          // Cached sheet data
- cacheTimestamp: number           // Cache time

KnowledgeBaseService:
- knowledgeBase: SheetData | null  // Loaded KB

ChatService:
- config: ChatServiceConfig        // API settings
- knowledgeBaseService: ref        // KB reference

App.tsx:
- conversationHistory: ChatMessage[] // Full history
```

## Error Handling

### Initialization Errors
```
Missing API keys → Red banner + Error message
Google Sheets API error → Red banner + Error message
Network error → Red banner + Error message
```

### Runtime Errors
```
Relevance check fails → Assume out-of-scope (safe)
Context retrieval fails → Empty context
AI request fails → "Please try again" message
```

## Performance Optimizations

### ✅ Caching
- Sheet data cached for 5 minutes
- Reduces API calls
- Configurable duration

### ✅ Lazy Loading
- Services initialize on demand
- Knowledge base loads once
- No unnecessary API calls

### ✅ Context Optimization
- Only relevant data sent to AI
- Max 3000 characters by default
- Reduces token costs

### ✅ Conversation History
- Last 6 messages (3 exchanges)
- Maintains context
- Prevents token overflow

## Security Architecture

### Environment Variables
```
.env (NOT committed)
     ↓
import.meta.env
     ↓
useRef (avoid re-renders)
     ↓
Services
```

### API Key Protection
- Never exposed to client
- Only in environment
- Can be restricted in Google Cloud

### Data Privacy
- No user data stored
- No conversation persistence
- All client-side processing

## Scalability Considerations

### Current Design (Small-Medium)
- ✅ In-memory knowledge base
- ✅ Simple keyword search
- ✅ Single sheet support
- ✅ No persistence

### Future Upgrades (Large Scale)
- 🚀 Vector database (Pinecone, Weaviate)
- 🚀 Semantic search with embeddings
- 🚀 Multi-sheet support
- 🚀 Conversation persistence
- 🚀 Real-time sheet updates
- 🚀 Load balancing
- 🚀 Edge caching

## Technology Stack

```
┌─────────────────────────────────────┐
│           Frontend Layer             │
│  - React 18 (UI)                    │
│  - TypeScript (Type Safety)         │
│  - Tailwind CSS (Styling)           │
│  - Framer Motion (Animations)       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          Service Layer               │
│  - Custom Services (Business Logic) │
│  - TypeScript Classes               │
│  - Async/Await (API calls)          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          External APIs               │
│  - OpenRouter (DeepSeek AI)         │
│  - Google Sheets API                │
└─────────────────────────────────────┘
```

## Deployment Architecture

```
Development:
  npm run dev → Vite Dev Server → localhost:3000

Production:
  npm run build → Static Files → CDN/Static Host
                   (Vercel, Netlify, etc.)
```

## Extension Points

### Add New Service
```typescript
// 1. Create new service
export class MyNewService {
  constructor(dependencies) { }
  
  async myMethod() { }
}

// 2. Add to App.tsx
const myServiceRef = useRef<MyNewService | null>(null);

// 3. Initialize in useEffect
myServiceRef.current = new MyNewService(deps);

// 4. Use in handlers
await myServiceRef.current.myMethod();
```

### Add New Data Source
```typescript
// 1. Create new data service (like GoogleSheetsService)
export class AirtableService {
  async fetchData() { }
}

// 2. Update KnowledgeBaseService to accept multiple sources
loadKnowledgeBase(sources: DataSource[]) { }

// 3. Merge data in initialization
```

### Add Analytics
```typescript
// 1. Create AnalyticsService
export class AnalyticsService {
  trackQuery(query: string, isRelevant: boolean) { }
  trackResponse(response: string) { }
}

// 2. Inject into ChatService
// 3. Call in key methods
```

---

## Summary

This architecture provides:
- ✅ **Clean separation of concerns**
- ✅ **Testable components**
- ✅ **Easy to extend**
- ✅ **Professional code quality**
- ✅ **Type-safe**
- ✅ **Well documented**

Perfect for a senior developer! 🚀
