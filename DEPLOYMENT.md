# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- GitHub account (for git-based deployments)
- Vercel account (recommended) or any Node.js hosting
- OpenAI or Anthropic API key

## Local Development

### 1. Setup

```bash
git clone https://github.com/WaltGilead/Ai-code-generator.git
cd Ai-code-generator
npm install
```

### 2. Environment Configuration

Create `.env.local` based on `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:

```bash
# Choose one:
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Follow the prompts and add environment variables in the Vercel dashboard.

### Option 2: Using GitHub Integration

1. Push code to GitHub:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [vercel.com](https://vercel.com/new)
3. Import your GitHub repository
4. Add environment variables:
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
5. Click Deploy

### Option 3: Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Select your repository
4. Configure environment variables
5. Deploy

## Environment Variables

### Required

One of the following API keys must be set:

- `OPENAI_API_KEY`: For GPT-4 Turbo or GPT-4o
- `ANTHROPIC_API_KEY`: For Claude 3.5 Sonnet or other Claude models

### Optional

- `NEXT_PUBLIC_SUPABASE_URL`: For future database features
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: For future authentication

## Deployment Checklist

- [ ] Environment variables configured
- [ ] COOP/COEP headers enabled (already in `next.config.js`)
- [ ] API rate limits considered for your plan
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate enabled (automatic with Vercel)
- [ ] Monitoring/logging setup

## Production Optimization

### Build Optimization

```bash
# Build for production
npm run build

# Test production build
npm run start
```

### Performance Tips

1. **API Rate Limiting**: Implement rate limiting for `/api/chat`
2. **Token Optimization**: Monitor token usage to control costs
3. **Caching**: Implement caching strategies for frequently used code patterns
4. **Monitor**: Use Vercel Analytics to track performance

## Troubleshooting Deployment

### Issue: "WebContainer not supported"

**Cause**: Browser doesn't support WebContainers

**Solution**: 
- Use Chrome 89+, Firefox 79+, or Edge 89+
- Update browser to latest version

### Issue: "API Key not found"

**Cause**: Environment variable not set

**Solution**:
```bash
# Check if variable exists
echo $OPENAI_API_KEY

# In Vercel dashboard, go to:
# Project > Settings > Environment Variables
# Add your API key there
```

### Issue: "CORS/COEP headers error"

**Cause**: Headers not properly configured

**Solution**: Verify `next.config.js` has the correct headers:
```javascript
headers: async () => [{
  source: '/:path*',
  headers: [
    { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ],
}],
```

### Issue: "Build fails"

**Solution**:
```bash
# Verify local build works
npm run build

# Check for type errors
npm run type-check

# Check logs in Vercel dashboard
```

## Monitoring & Debugging

### View Logs

```bash
# Local development
npm run dev

# Production (Vercel)
vercel logs --prod
```

### Monitor API Usage

- **OpenAI**: https://platform.openai.com/account/usage/overview
- **Anthropic**: https://console.anthropic.com/

## Scaling Considerations

### Current Limitations

- WebContainer sessions expire after ~10 minutes
- Single user per session
- Memory limited by browser constraints

### Future Scaling

1. **Database Integration**: Add Supabase for project persistence
2. **Authentication**: Implement user accounts
3. **Project Storage**: Save projects for later access
4. **Collaboration**: Real-time collaborative editing
5. **Backend Workers**: Offload heavy processing

## Cost Estimation

### API Costs (per million tokens)

- **OpenAI GPT-4 Turbo**: ~$10-30 per 1M tokens
- **Anthropic Claude 3.5**: ~$3 per 1M tokens

### Hosting Costs

- **Vercel**: Free tier + pay-as-you-go ($0.50 per GB-hour)
- **WebContainer**: Free (provided by StackBlitz)

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **WebContainers**: https://webcontainers.io/
- **Vercel AI SDK**: https://sdk.vercel.ai/
- **OpenAI API**: https://platform.openai.com/docs
- **Anthropic API**: https://docs.anthropic.com/
