# Netlify Deployment Guide

Your site was likely seeing a `500 Internal Server Error` because the database connection code was crashing immediately when environment variables were missing.

**We have fixed the code** to be more resilient, but you **MUST** still configure your Netlify environment for the live site to actually work.

## 1. Required Environment Variables

Go to your Netlify Dashboard:
**Site configuration > Environment variables**

Add the following variables (copy values from your local `.env` file):

| Key | Description |
| :--- | :--- |
| `MONGODB_URI` | **CRITICAL**. Your MongoDB connection string. |
| `NEXT_PUBLIC_API_URL` | Set this to your live site URL (e.g., `https://your-site-name.netlify.app`) or leave as `/` if using relative paths. |
| `IMGBB_API_KEY` | Required for image uploads. |
| `EMAIL_USER` | Gmail address for sending emails. |
| `EMAIL_PASS` | Gmail App Password (not your login password). |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_SECURE` | `false` |

## 2. Verify Build Settings

Ensure your **Build settings** in Netlify are correct:

- **Base directory**: `.` (root)
- **Build command**: `npm run build`
- **Publish directory**: `.next`

## 3. Redeploy

Once you added the variables:
1. Go to the **Deploys** tab.
2. Click **Trigger deploy** > **Clear cache and deploy site**.

This should resolve the 500 error and make your site fully functional!
