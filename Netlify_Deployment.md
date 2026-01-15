# Netlify Deployment Guide

✅ **Project Build Status: PASSED**

Your project is ready for deployment! We have verified that the project builds successfully locally.

To deploy to Netlify, follow these steps:

## 1. Environment Variables (CRITICAL)

The most common cause of deployment failure or runtime errors (500 Internal Server Error) is missing environment variables.

Go to your Netlify Dashboard:
**Site configuration > Environment variables**

Add the following variables exactly as they appear in your local `.env` file:

| Key | Value Description |
| :--- | :--- |
| `MONGODB_URI` | **CRITICAL**. Copy your full MongoDB connection string. |
| `NEXT_PUBLIC_API_URL` | Set to your Netlify site URL (e.g., `https://your-site.netlify.app`) or `/` if connecting to same-origin APIs. Do NOT use localhost. |
| `IMGBB_API_KEY` | Required for image uploads. Copy from `.env`. |
| `EMAIL_USER` | Gmail address for notifications. |
| `EMAIL_PASS` | Gmail App Password. |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_SECURE` | `false` |

## 2. Deploy Configuration

We have configured `netlify.toml` for you. Netlify should automatically detect the settings:

- **Build command**: `npm run build`
- **Publish directory**: `.next`

## 3. Deployment Steps

1. Push your latest code to GitHub.
2. Link your repository in Netlify (if not already linked).
3. **Trigger a deploy**.
4. If you see a "Page Not Found" or 404 on assets, ensure your Build Settings in Netlify match the above.

> **Note**: If you encounter build errors related to "PageNotFoundError" or caching, try "Clear cache and deploy site" in the Netlify Deploys tab.
