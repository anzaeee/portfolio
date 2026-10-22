# Deployment Strategy for GitLab CI/CD

This document outlines free deployment options for your SvelteKit portfolio using GitLab CI/CD.

## 🎯 Recommended: GitLab Pages (100% Free)

**Best for:** Simple, integrated deployment with no external services needed.

### Setup Steps:

1. **Push your code to GitLab:**
   ```bash
   git remote add gitlab <your-gitlab-repo-url>
   git push gitlab main
   ```

2. **Enable GitLab Pages:**
   - Go to your GitLab project → Settings → Pages
   - The site will be automatically deployed after the CI/CD pipeline runs
   - Your site will be available at: `https://<username>.gitlab.io/<project-name>`

3. **Custom Domain (Optional):**
   - In GitLab Pages settings, add your custom domain
   - Update DNS records as instructed by GitLab

### Pros:
- ✅ Completely free
- ✅ Integrated with GitLab CI/CD
- ✅ Automatic deployments on push
- ✅ Supports custom domains
- ✅ SSL certificates included

### Cons:
- ⚠️ URL format: `username.gitlab.io/project-name` (unless using custom domain)
- ⚠️ Build time limits (usually sufficient for static sites)

---

## 🌐 Alternative Options

### Option 2: Netlify (Free Tier)

**Best for:** Better URL structure and additional features.

#### Setup:

1. **Get Netlify API Token:**
   - Sign up at [netlify.com](https://netlify.com)
   - Go to User Settings → Applications → New access token
   - Copy the token

2. **Add GitLab CI/CD Variables:**
   - Go to GitLab project → Settings → CI/CD → Variables
   - Add variable: `NETLIFY_AUTH_TOKEN` (value: your token)
   - Add variable: `NETLIFY_SITE_ID` (value: your site ID from Netlify)

3. **Update `.gitlab-ci.yml`:**
   ```yaml
   deploy_netlify:
     stage: deploy
     image: node:20
     dependencies:
       - build
     script:
       - npm install -g netlify-cli
       - netlify deploy --prod --dir=build --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
     only:
       - main
   ```

#### Pros:
- ✅ Free tier with generous limits
- ✅ Better URL: `yourname.netlify.app`
- ✅ Preview deployments for PRs
- ✅ Analytics and forms available

---

### Option 3: Cloudflare Pages (Free Tier)

**Best for:** Fast global CDN and excellent performance.

#### Setup:

1. **Get Cloudflare API Token:**
   - Sign up at [cloudflare.com](https://cloudflare.com)
   - Go to My Profile → API Tokens → Create Token
   - Use "Edit Cloudflare Workers" template

2. **Add GitLab CI/CD Variables:**
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_PROJECT_NAME`

3. **Update `.gitlab-ci.yml`:**
   ```yaml
   deploy_cloudflare:
     stage: deploy
     image: node:20
     dependencies:
       - build
     script:
       - npm install -g wrangler
       - wrangler pages deploy build --project-name=$CLOUDFLARE_PROJECT_NAME
     only:
       - main
   ```

#### Pros:
- ✅ Fastest global CDN
- ✅ Unlimited bandwidth
- ✅ Custom domains with SSL
- ✅ Excellent performance

---

### Option 4: Vercel (Free Tier)

**Best for:** If you want to keep using Vercel adapter.

#### Setup:

1. **Get Vercel Token:**
   - Sign up at [vercel.com](https://vercel.com)
   - Go to Settings → Tokens → Create Token

2. **Add GitLab CI/CD Variables:**
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

3. **Update `.gitlab-ci.yml`:**
   ```yaml
   deploy_vercel:
     stage: deploy
     image: node:20
     dependencies:
       - build
     script:
       - npm install -g vercel
       - vercel --prod --token=$VERCEL_TOKEN
     only:
       - main
   ```

#### Pros:
- ✅ Excellent developer experience
- ✅ Automatic preview deployments
- ✅ Edge functions support
- ✅ Analytics available

---

## 📋 Current Configuration

The current `.gitlab-ci.yml` is configured for **GitLab Pages** deployment. It will:

1. **Build** your SvelteKit app on every push to `main` branch
2. **Deploy** the built files to GitLab Pages automatically

## 🔧 Switching Between Adapters

If you want to use different adapters for different deployments:

1. **For GitLab Pages:** Use `@sveltejs/adapter-static` (current setup)
2. **For Vercel:** Use `@sveltejs/adapter-vercel`
3. **For Netlify:** Use `@sveltejs/adapter-netlify`

You can create environment-specific configs or use environment variables to switch adapters.

## 🚀 Quick Start

1. Push your code to GitLab
2. The CI/CD pipeline will automatically:
   - Install dependencies
   - Build your SvelteKit app
   - Deploy to GitLab Pages
3. Your site will be live at: `https://<username>.gitlab.io/<project-name>`

## 📝 Notes

- The build output goes to the `build/` directory
- GitLab Pages serves from the `public/` directory (handled in CI/CD)
- Make sure all routes have `prerender = true` for static generation
- Custom 404 pages can be added in `src/routes/+error.svelte`

