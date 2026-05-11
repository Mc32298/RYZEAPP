# google-oauth-token (Supabase Edge Function)

This function proxies Google OAuth token exchange/refresh so the desktop app does not ship `GOOGLE_OAUTH_CLIENT_SECRET`.

## Required Supabase function secrets

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI` (must match desktop redirect URI)

## Deploy

```bash
supabase functions deploy google-oauth-token
```

Set secrets first (or update them):

```bash
supabase secrets set GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... GOOGLE_OAUTH_REDIRECT_URI=http://127.0.0.1:53682
```

## Desktop app env

Set these in your app `.env`:

- `GOOGLE_OAUTH_CLIENT_ID=...`
- `GOOGLE_OAUTH_REDIRECT_URI=http://127.0.0.1:53682`
- `GOOGLE_OAUTH_TOKEN_PROXY_URL=https://<project-ref>.functions.supabase.co/google-oauth-token`
- `SUPABASE_ANON_KEY=...` (optional but recommended if function uses anon key checks)
