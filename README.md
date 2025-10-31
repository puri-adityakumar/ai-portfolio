# AI Portfolio

An interactive, AI-powered portfolio website featuring a conversational AI assistant that answers questions about professional experience, projects, and achievements. Built with cutting-edge web technologies and modern design principles.

## 🌟 Overview

This portfolio website offers two unique ways to explore professional credentials:

- **AI Chat Interface**: Engage with an intelligent AI assistant powered by Google's Generative AI to ask questions about experience, skills, projects, and achievements in a conversational manner.
- **Traditional Portfolio View**: Browse through a beautifully designed portfolio with detailed sections for work experience, projects, education, and accomplishments.

The application features a modern glassmorphism design with smooth animations, dark theme aesthetics, and full responsive support across all devices.

## ✨ Key Features

- **Conversational AI**: Powered by Google Generative AI (Gemini) to provide intelligent, context-aware responses about professional background
- **Conversation Persistence**: Chat history saved in local storage for seamless user experience
- **Dynamic Portfolio**: Automatically generated from structured JSON data
- **CV Generation**: Download professional CV in PDF format
- **Performance Optimized**: Lazy loading, code splitting, and optimized asset delivery
- **SEO Friendly**: Complete meta tags, Open Graph images, sitemap, and robots.txt
- **Responsive Design**: Mobile-first approach with beautiful UI across all screen sizes
- **Error Handling**: Graceful error boundaries with retry mechanisms
- **Type-Safe**: Full TypeScript implementation with strict type checking

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Icons**: React Icons
- **Fonts**: Geist Font Family

### AI & Backend
- **AI Model**: Google Generative AI (@google/genai)
- **API Routes**: Next.js API Routes with streaming support
- **Data Management**: JSON-based data storage

### Development Tools
- **Language**: TypeScript 5
- **Linting**: ESLint 9
- **Code Formatting**: Prettier integration
- **Build Optimization**: Critters for critical CSS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: Version 20.x or higher
- **npm**: Version 10.x or higher (comes with Node.js)
- **Git**: For cloning the repository

## 🚀 Setup and Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-portfolio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and add the required environment variables:

```env
# Google Generative AI API Key (Required)
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

# Optional: Node Environment
NODE_ENV=development
```

**Getting Google Generative AI API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and paste it in your `.env.local` file

### 4. Configure Portfolio Data

Edit the `data.json` file to customize the portfolio with your own information:

```json
{
  "profile": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "title": "Your Title",
    "bio": "Your bio..."
  },
  "skills": { ... },
  "experiences": [ ... ],
  "projects": [ ... ],
  "achievements": [ ... ],
  "education": [ ... ]
}
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📦 Available Scripts

- `npm run dev` - Start the development server on port 3000
- `npm run build` - Create an optimized production build
- `npm start` - Run the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run validate:env` - Validate environment variables
- `npm run build:analyze` - Build with bundle analysis
- `npm run build:standalone` - Create a standalone build for deployment

## 🏗️ Project Structure

```
ai-portfolio/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── chat/           # AI chat endpoint
│   │   └── health/         # Health check endpoint
│   ├── chat/               # Chat interface pages
│   │   ├── components/     # Chat-specific components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   ├── portfolio/          # Portfolio pages
│   │   └── components/    # Portfolio-specific components
│   ├── components/         # Shared components
│   ├── contexts/          # React contexts
│   ├── hooks/            # Global hooks
│   └── layout.tsx        # Root layout
├── lib/                    # Utility libraries
│   ├── data.ts           # Data fetching logic
│   ├── cv-generator.ts   # CV generation utility
│   ├── env-validation.ts # Environment validation
│   └── seo.ts           # SEO utilities
├── types/                # TypeScript type definitions
├── public/              # Static assets
├── data.json           # Portfolio data
└── next.config.ts     # Next.js configuration
```

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Google Generative AI API key for chat functionality |
| `NODE_ENV` | No | Node environment (development/production) |

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in project settings
5. Deploy!

### Deploy to Other Platforms

Build the production version:

```bash
npm run build
npm start
```

The application will be available on port 3000.

## 🎨 Customization

- **Colors & Theme**: Modify Tailwind configuration in `tailwind.config.js`
- **Portfolio Content**: Edit `data.json` with your information
- **AI Behavior**: Adjust prompts in `app/api/chat/route.ts`
- **UI Components**: Customize components in `app/components/`

## 🐛 Troubleshooting

**Issue: API key not working**
- Ensure your API key is correctly set in `.env.local`
- Restart the development server after adding environment variables

**Issue: Build fails**
- Run `npm run validate:env` to check environment configuration
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

**Issue: Chat not responding**
- Check browser console for errors
- Verify API key has proper permissions in Google AI Studio

## 📝 License

This project is open source and available under the MIT License.

## 👤 Contact

- **Email**: kumar.adityapuri@gmail.com
- **GitHub**: [@puriadityakumar](https://github.com/puriadityakumar)
- **LinkedIn**: [puri-adityakumar](https://linkedin.com/in/puri-adityakumar)

---

Built with ❤️ using Next.js and Google Generative AI
