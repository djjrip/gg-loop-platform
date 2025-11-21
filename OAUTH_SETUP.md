# OAuth Login Setup Guide

**Your OAuth logins are currently broken because of missing environment variables and mismatched redirect URLs.**

## 1. Configure Environment Variables

You are missing critical credentials in your `.env` file.

1.  Open `.env` in your project root.
2.  Copy the contents from `.env.template` (I just created this for you) into `.env`.
3.  **You must fill in the `CLIENT_ID` and `CLIENT_SECRET` for each provider.**

## 2. Update Redirect URLs (Developer Portals)

Since you are running locally on Windows, your domain is `http://localhost:5000`.

### Discord OAuth Setup
1.  Go to [Discord Developer Portal](https://discord.com/developers/applications)
2.  Select your GG Loop application -> **OAuth2**
3.  Under "Redirects", add:
    `http://localhost:5000/api/auth/discord/callback`
4.  Copy **Client ID** and **Client Secret** to your `.env` file.

### Twitch OAuth Setup
1.  Go to [Twitch Console](https://dev.twitch.tv/console/apps)
2.  Select your GG Loop application
3.  Under "OAuth Redirect URLs", add:
    `http://localhost:5000/api/auth/twitch/callback`
4.  Copy **Client ID** and **Client Secret** to your `.env` file.

### Google OAuth Setup
1.  Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2.  Select your OAuth 2.0 Client
3.  Under "Authorized redirect URIs", add:
    `http://localhost:5000/api/auth/google/callback`
4.  Copy **Client ID** and **Client Secret** to your `.env` file.

---

## 3. Verify Base URL

Ensure your `.env` file has:
```env
BASE_URL=http://localhost:5000
```

---

## Troubleshooting

-   **"redirect_uri_mismatch"**: You didn't add `http://localhost:5000/...` to the developer portal.
-   **"invalid_client"**: Your Client ID/Secret in `.env` is wrong.
-   **Login loop**: Ensure `SESSION_SECRET` is set in `.env`.
