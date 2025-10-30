# Installation Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Google account (for Gemini API key)

## Step-by-Step Installation

### 1. Install Dependencies

Run the following command to install all required packages including the Gemini SDK:

```bash
npm install
```

This will install:
- `@google/genai` - Official Gemini AI SDK
- Next.js and React dependencies
- All other project dependencies

### 2. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key (it will look like: `AIza...`)

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env.local
   ```

2. Open `.env.local` and update with your API key:
   ```env
   GEMINI_API_KEY=AIzaSyC...your_actual_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Test the Chat

1. Open your browser to `http://localhost:3000`
2. Click on the chat icon
3. Try asking: "Tell me about the projects"
4. You should see a streaming response from Gemini AI

## Troubleshooting

### Module not found: '@google/genai'

**Solution**: Run `npm install` to install the package.

### Chat not responding

**Solution**: 
1. Check that `GEMINI_API_KEY` is set in `.env.local`
2. Verify the API key is valid
3. Check browser console for errors

### TypeScript errors

**Solution**: 
1. Restart your IDE/editor
2. Run `npm install` again
3. Delete `node_modules` and `.next` folders, then run `npm install`

## Next Steps

- Read [GEMINI_SETUP.md](./GEMINI_SETUP.md) for detailed Gemini configuration
- Customize the portfolio data in `data/portfolio.json`
- Modify the system instructions in `app/api/chat/route.ts`

## Support

For issues with:
- **Gemini API**: Visit [Google AI Documentation](https://ai.google.dev/gemini-api/docs)
- **This project**: Check the README.md or create an issue
