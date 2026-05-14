# google-oauth-token (Supabase Edge Function)

This function proxies Google OAuth token exchange/refresh so the desktop app does not ship `GOOGLE_OAUTH_CLIENT_SECRET`.

For the production desktop flow in this repo, use the project's legacy JWT-based `anon` key in the desktop app so the Edge gateway can enforce `verify_jwt = true`. The function also validates the `apikey` header against `SUPABASE_ANON_KEY` as a second gate.

## Required Supabase function secrets

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI` (must match desktop redirect URI)
- `GOOGLE_OAUTH_PROXY_API_KEY` (set to the same legacy JWT-based anon key the desktop app sends)

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
- `GOOGLE_OAUTH_TOKEN_PROXY_URL=https://<project-ref>.supabase.co/functions/v1/google-oauth-token`
- `GOOGLE_OAUTH_SCOPE=openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send`
- `SUPABASE_ANON_KEY=<legacy anon JWT key>`
