# GitHub Pages Deployment Guide

## Overview

This guide explains how to deploy the ResAlign AI frontend to GitHub Pages using the automated GitHub Actions workflow.

## Prerequisites

- GitHub repository with the ResAlign AI code
- Supabase project with URL and anon key
- GitHub account with repository admin access

## Quick Start

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar under "Code and automation")
4. Under **"Source"**, select **"GitHub Actions"**
5. Click **Save** (if prompted)

### 2. Add GitHub Secrets

Your Supabase credentials need to be stored as GitHub secrets so they can be used during the build process.

1. In your repository, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add the first secret:
   - **Name**: `VITE_SUPABASE_URL`
   - **Secret**: Your Supabase project URL (e.g., `https://abcdefg.supabase.co`)
   - Click **"Add secret"**
4. Click **"New repository secret"** again
5. Add the second secret:
   - **Name**: `VITE_SUPABASE_KEY`
   - **Secret**: Your Supabase anon/public key
   - Click **"Add secret"**

**Where to find your Supabase credentials:**
- Go to [app.supabase.com](https://app.supabase.com)
- Select your project
- Click **Settings** (gear icon)
- Click **API** in the left sidebar
- Copy **Project URL** for `VITE_SUPABASE_URL`
- Copy **anon/public** key for `VITE_SUPABASE_KEY`

### 3. Configure Workflow Permissions (If Needed)

If the deployment fails with permission errors:

1. Go to **Settings** → **Actions** → **General**
2. Scroll to **"Workflow permissions"**
3. Select **"Read and write permissions"**
4. Check ✅ **"Allow GitHub Actions to create and approve pull requests"**
5. Click **"Save"**

### 4. Deploy!

There are two ways to trigger a deployment:

**Option A: Automatic (Recommended)**
- Push any commit to the `main` branch
- The workflow runs automatically
- Watch progress in the **Actions** tab

**Option B: Manual**
1. Go to the **Actions** tab
2. Click **"Deploy Frontend to GitHub Pages"** (left sidebar)
3. Click **"Run workflow"** button (right side)
4. Select branch: `main`
5. Click **"Run workflow"**

### 5. Access Your Deployed Site

After a successful deployment (usually 2-5 minutes):

1. Go to **Settings** → **Pages**
2. You'll see: **"Your site is live at [URL]"**
3. The URL will be: `https://[your-username].github.io/align-ai/`
4. Click the URL to visit your deployed site!

## Monitoring Deployments

### View Build Status

1. Go to the **Actions** tab in your repository
2. Click on the latest workflow run
3. You'll see two jobs:
   - **build** - Installs dependencies and builds the frontend
   - **deploy** - Deploys the built files to GitHub Pages

### View Logs

Click on any job name to see detailed logs:
- Green ✅ = Success
- Red ❌ = Failed (click to see error details)
- Yellow ⏸️ = In progress

## Troubleshooting

### Build Fails: "Missing environment variables"

**Problem:** The build can't find `VITE_SUPABASE_URL` or `VITE_SUPABASE_KEY`

**Solution:**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Verify both secrets exist and names match exactly
3. If missing, add them (see Step 2 above)
4. Re-run the workflow

### Build Fails: "npm ERR! code ELIFECYCLE"

**Problem:** TypeScript compilation errors or build failures

**Solution:**
1. Test the build locally: `cd frontend && npm run build`
2. Fix any TypeScript errors
3. Commit and push the fixes
4. The workflow will run again automatically

### Deployment Succeeds But Site Shows 404

**Problem:** GitHub Pages isn't properly configured

**Solution:**
1. Go to **Settings** → **Pages**
2. Ensure **Source** is set to **"GitHub Actions"** (not "Deploy from a branch")
3. Wait 2-5 minutes and try again
4. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Assets Not Loading (CSS/JS 404 errors)

**Problem:** The base path is incorrect

**Solution:**
1. Check `frontend/vite.config.ts` has: `base: '/align-ai/'`
2. The repository name must match (if your repo is named differently, update the base path)
3. Rebuild and redeploy

### Authentication Not Working After Deployment

**Problem:** Supabase doesn't recognize your GitHub Pages URL

**Solution:**
1. Go to your Supabase dashboard: [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your GitHub Pages URL to **"Redirect URLs"**:
   - `https://[your-username].github.io/align-ai/`
   - `https://[your-username].github.io/align-ai/**` (with wildcard for all routes)
5. Set **"Site URL"** to: `https://[your-username].github.io`
6. Click **"Save"**

### Permission Denied Errors

**Problem:** GitHub Actions doesn't have permission to deploy

**Solution:**
1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select **"Read and write permissions"**
3. Check ✅ **"Allow GitHub Actions to create and approve pull requests"**
4. Click **"Save"**
5. Re-run the workflow

## Workflow Details

### What Happens During Deployment?

1. **Trigger**: Push to `main` branch detected
2. **Checkout**: Downloads your code
3. **Setup Node.js**: Installs Node.js 18 with npm caching
4. **Install Dependencies**: Runs `npm ci` in the `frontend` directory
5. **Build**: Runs `npm run build` with environment variables from secrets
6. **Upload**: Packages the `frontend/dist` folder
7. **Deploy**: Publishes to GitHub Pages
8. **Done**: Your site is live!

### Files Involved

- **`.github/workflows/deploy-frontend.yml`** - GitHub Actions workflow definition
- **`frontend/vite.config.ts`** - Build configuration (includes base path)
- **`frontend/.env.example`** - Environment variable documentation
- **`frontend/package.json`** - Build scripts and dependencies

## Updating Your Deployment

### After Code Changes

Simply push to `main` branch:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```

The workflow runs automatically and deploys the changes.

### After Changing Environment Variables

If you need to update Supabase credentials:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click the secret name (e.g., `VITE_SUPABASE_URL`)
3. Click **"Update secret"**
4. Enter the new value
5. Click **"Update secret"**
6. Re-run the workflow or push a new commit

## Testing Before Deployment

Always test locally before pushing to `main`:

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Preview the production build
npm run preview
```

Visit `http://localhost:4173` to test the production build locally.

## Custom Domain (Optional)

To use a custom domain (e.g., `resalign.ai`):

1. Go to **Settings** → **Pages**
2. Under **"Custom domain"**, enter your domain
3. Click **"Save"**
4. Add DNS records at your domain registrar:
   - Type: `A` or `CNAME`
   - See GitHub's instructions after clicking "Save"
5. Wait for DNS propagation (can take up to 48 hours)
6. Update `base: '/'` in `vite.config.ts` (remove `/align-ai/`)
7. Update Supabase redirect URLs to use your custom domain

## Cost

GitHub Pages is **100% FREE** for public repositories:
- 1 GB storage
- 100 GB bandwidth per month
- Unlimited builds

For private repositories, you need a paid GitHub plan.

## Support

- **GitHub Actions Documentation**: [docs.github.com/actions](https://docs.github.com/actions)
- **GitHub Pages Documentation**: [docs.github.com/pages](https://docs.github.com/pages)
- **Vite Deployment Guide**: [vitejs.dev/guide/static-deploy](https://vitejs.dev/guide/static-deploy)
- **Supabase URL Configuration**: [supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)

## Quick Checklist

- [ ] GitHub Pages enabled (Settings → Pages → Source: GitHub Actions)
- [ ] `VITE_SUPABASE_URL` secret added
- [ ] `VITE_SUPABASE_KEY` secret added
- [ ] Workflow permissions configured (if needed)
- [ ] Code pushed to `main` branch
- [ ] Workflow completed successfully (Actions tab)
- [ ] Site accessible at GitHub Pages URL
- [ ] Supabase redirect URLs updated with GitHub Pages URL

---

**Need help?** Check the [Actions tab](../../actions) for detailed logs, or review the [frontend README](../../frontend/README.md) for more information.

