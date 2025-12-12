# UI Assistant

An interactive chat widget that can render UI components dynamically.  
The project supports **large chat histories (~1000 messages)** and uses **IndexedDB** for persistence to ensure smooth performance over long conversations.

---

## 🚀 How to Run the Project


```bash
git clone https://github.com/abhix4/Bujo
npm install
npm run dev 
```


## Directions

### JSON → Components

The assistant streams:
```
Structured JSON blocks wrapped inside:
```COMPONENT_JSON
{ ... }

```

### Large Chat History

Messages are saved in IndexedDB, not simply localStorage.

## Assumptions
- A mock stream generator is used.
- Introductory text (markdown-style)
- Streaming responses follow the `COMPONENT_JSON` format.

## Trade-offs

IndexedDB adds complexity, but was chosen because:

- It handles large chat histories safely.
- It avoids blocking the main thread.

## Limitations

- Clearing browser storage deletes full chat history.
- Streaming cannot be cancelled mid-response.



# AI usage disclosure
- Used GPT-5.1
- IndexedDB implementation

## Common queries 
- show me a form component
- show me buttons
- show me all buttons
- show me primary button or other variants
- show me input 
- show empty state component