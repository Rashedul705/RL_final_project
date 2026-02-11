# Deploying to Coolify

This project is configured for easy deployment on Coolify (or any Docker-based platform).

## Prerequisites

-   A running instance of Coolify.
-   Access to this repository.

## Environment Variables

You **MUST** configure the following environment variables in Coolify for the application to function correctly.

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The public URL of your deployed app. | `https://your-app-domain.com` |
| `MONGODB_URI` | Connection string for MongoDB. | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `IMGBB_API_KEY` | API Key for Image upload (imgbb). | `your_imgbb_api_key` |
| `EMAIL_HOST` | SMTP Host for emails. | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP Port for emails. | `587` |
| `EMAIL_SECURE` | Use secure connection? | `false` |
| `EMAIL_USER` | SMTP User/Email. | `your.email@gmail.com` |
| `EMAIL_PASS` | SMTP Password/App Password. | `your_app_password` |
| `STEADFAST_API_KEY` | API Key for Courier integration. | `your_steadfast_key` |
| `STEADFAST_SECRET_KEY` | Secret Key for Courier integration. | `your_steadfast_secret` |
| `STEADFAST_BASE_URL` | Base URL for Courier API. | `https://portal.packzy.com/api/v1` |

> **Note:** `NEXT_PUBLIC_` variables are baked into the build time. If you change them, you must **redeploy** (rebuild) the application.

## Deployment Steps (Coolify)

1.  **Dashboard:** Go to your Coolify Dashboard.
2.  **Add Resource:** Click **"+ Add Resource"**.
3.  **Source:** Select **"Public Repository"** (or Private if applicable).
4.  **URL:** Enter your repository URL (e.g., `https://github.com/Rashedul705/RL_final_project`).
5.  **Build Pack:** Coolify effectively detects `Dockerfile` automatically. If asked, select **"Docker"** or **"Nixpacks"**. Both work, but `Dockerfile` gives you more control.
    -   *Recommendation:* Use **Docker** to use the custom `Dockerfile` created in this repo.
6.  **Configuration:**
    -   Go to the **Environment Variables** tab.
    -   Add all the variables listed above.
    -   **Important:** Set `NEXT_PUBLIC_API_URL` to your actual domains (e.g., `https://rodelas.com`).
7.  **Deploy:** Click **"Deploy"**.

## Local Testing (Docker)

To test the production build locally before pushing:

1.  Make sure you have Docker installed.
2.  Run:
    ```bash
    docker-compose up --build
    ```
3.  Open `http://localhost:3000`.
