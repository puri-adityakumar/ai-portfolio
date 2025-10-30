# Gemini AI Integration Setup

This project uses Google's Gemini AI API for the chat functionality.

## Quick Setup

1. **Get your Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Sign in with your Google account
   - Click "Get API Key" or "Create API Key"
   - Copy your API key

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`:
     ```bash
     copy .env.example .env.local
     ```
   
   - Edit `.env.local` and add your API key:
     ```env
     GEMINI_API_KEY=your_actual_api_key_here
     GEMINI_MODEL=gemini-2.5-flash
     ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

## Available Models

Choose from these Gemini models by setting `GEMINI_MODEL`:

- `gemini-2.5-flash` (Default) - Fast, cost-effective, with thinking enabled
- `gemini-2.5-pro` - More capable, with thinking enabled
- `gemini-1.5-flash` - Fast, previous generation
- `gemini-1.5-pro` - More capable, previous generation

## Features

- **Streaming Responses**: Real-time text generation
- **Conversation History**: Multi-turn conversations with context
- **System Instructions**: Portfolio-aware AI assistant
- **Error Handling**: Comprehensive error management
- **Type Safety**: Full TypeScript support

## API Usage

The chat API endpoint is available at `/api/chat`:

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Tell me about the projects',
    conversationHistory: []
  })
});
```

## Troubleshooting

### Chat not working?
1. Check that `GEMINI_API_KEY` is set in `.env.local`
2. Verify your API key is valid at [Google AI Studio](https://aistudio.google.com/apikey)
3. Check the browser console for errors
4. Ensure you have internet connectivity

### Rate limits?
- Free tier: 15 requests per minute
- Upgrade at [Google AI Studio](https://aistudio.google.com/)

## Documentation

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Text Generation Guide](https://ai.google.dev/gemini-api/docs/text-generation)
- [Streaming Guide](https://ai.google.dev/gemini-api/docs/text-generation#streaming)
