## Production Deployment (Firebase Hosting + Cloud Run)

This guide walks through deploying the unified IQsion app (frontend + API) to a single custom domain `app.iqsion.com` using Firebase Hosting rewrites to a Cloud Run service.

### 1. Prerequisites
- gcloud CLI installed and authenticated: `gcloud auth login`
- Firebase CLI installed: `npm i -g firebase-tools`
- A Firebase project created (note the Project ID, e.g. `iqsion-prod`).
- Billing enabled on the GCP project (required for Cloud Run + Artifact Registry).
- Domain `iqsion.com` DNS managed where you can add TXT + CNAME records.

### 2. Enable Required GCP APIs (once per project)
```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com firebase.googleapis.com
```

### 3. Artifact Registry (optional custom repo)
You can use Cloud Run source builds directly; for explicit Docker builds create a repo:
```bash
gcloud artifacts repositories create iq-backend --repository-format=docker --location=us-central1 --description="IQsion backend images"
```

### 4. Configure Project Files
- Copy `.firebaserc.sample` to `.firebaserc` and replace `REPLACE_WITH_FIREBASE_PROJECT_ID`.
- Create `firebase.json` from `firebase.json.sample` updating:
  - `serviceId`: a unique name like `iqsion-api`.
  - `region`: e.g. `us-central1` (match your Cloud Run deployment region).

### 5. Production Environment Variables
Create a `.env.production` inside `Maint/` (do NOT commit) with values:
```
DATABASE_URL=postgres://... (Neon prod)
GEMINI_API_KEY=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_SEARCH_CONSOLE_CLIENT_ID=...
GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET=...
GOOGLE_SEARCH_CONSOLE_REDIRECT_URI=https://app.iqsion.com/api/auth/searchconsole/callback
GOOGLE_AUTH_REDIRECT_URI=https://app.iqsion.com/api/auth/google/callback
META_REDIRECT_URI=https://app.iqsion.com/api/auth/meta/callback
TIKTOK_REDIRECT_URI=https://app.iqsion.com/api/auth/tiktok/callback
SHOPIFY_REDIRECT_URI=https://app.iqsion.com/api/auth/shopify/callback
CORS_ORIGINS=https://app.iqsion.com
SESSION_SECRET=change_this_long_random_secret
NODE_ENV=production
```
Update provider consoles (Google Cloud OAuth, Meta, TikTok, Shopify) with these new redirect URIs before testing.

### 6. Build & Deploy Cloud Run Service
From repo root (or `Maint/` if using relative Docker context):
```bash
cd Maint
gcloud run deploy iqsion-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "$(cat .env.production | grep -v '^#' | xargs)"
```
Notes:
- `--source .` uses Cloud Build to containerize via Dockerfile automatically.
- For secrets, consider using Secret Manager instead of inline env exporting later.

### 7. Create `firebase.json`
Example final file:
```json
{
  "hosting": {
    "public": "dist", 
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "/api/**", "run": { "serviceId": "iqsion-api", "region": "us-central1" } },
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```
Build frontend before deploy:
```bash
npm run build
```

### 8. Firebase Hosting Deploy
```bash
firebase deploy --only hosting
```
This will serve static frontend and rewrite `/api/**` to your Cloud Run service.

### 9. Custom Domain Setup (`app.iqsion.com`)
1. In Firebase Console > Hosting > Add custom domain.
2. Enter `app.iqsion.com`.
3. Firebase provides a TXT record for verification—add it where your DNS is hosted.
4. Add CNAME record:
   - Name: `app`
   - Value: `ghs.googlehosted.com`
5. Wait for propagation (can take from minutes up to 24h). Firebase will issue SSL automatically.

### 10. Post-Deployment Checklist
- Visit `https://app.iqsion.com` loads React app (no mixed content errors).
- Settings page loads; Search Console sites list works via rewrite.
- Test Google Ads connection button returns developer token approval error as expected (until approved).
- All OAuth login flows redirect back to `https://app.iqsion.com/api/auth/...` successfully (update any hard-coded localhost in code if missed).
- Console logs show no CORS errors.

### 11. Observability & Logging
- Use Cloud Run logs (`gcloud logs read --project <project> --service-name iqsion-api`).
- Optionally add structured logging JSON format for easier filtering.

### 12. Scaling & Cost
- Default Cloud Run (minInstances=0) -> cold start possible; set `--min-instances=1` for lower latency (adds small cost).
- Firebase Hosting is globally cached; API latency mostly depends on region selection + cold start.

### 13. Future Hardening
- Move secrets to Secret Manager: `gcloud secrets create DATABASE_URL --data-file=db.txt` then reference via `--set-secrets`.
- Add WAF / rate limiting (Cloud Armor or in-app limiter like `express-rate-limit`).
- Remove any development-only debug endpoints before enabling production traffic.

### 14. Rolling Updates
Subsequent deploys (code changes only):
```bash
cd Maint
gcloud run deploy iqsion-api --source . --region us-central1
npm run build
firebase deploy --only hosting
```

### 15. Troubleshooting
- 404 on API: Check rewrite `serviceId` matches Cloud Run service name.
- 403 / CORS error: Ensure CORS_ORIGINS includes exact https://app.iqsion.com.
- OAuth redirect mismatch: Update provider console redirect URIs.
- Cloud Run env not applied: Re-deploy with updated `--set-env-vars` or migrate to secrets.

### 16. Verification Script (Optional)
Simple endpoint test:
```bash
curl -I https://app.iqsion.com/api/health || curl -I https://app.iqsion.com/api/status
```
Replace with real health endpoint if exists.

---
If you need to rollback quickly: redeploy previous image (if using artifact registry) or disable Hosting rewrite temporarily.

### 17. Redirect URI Summary (Production)
- Search Console: https://app.iqsion.com/api/auth/searchconsole/callback
- Google Ads: https://app.iqsion.com/api/auth/googleads/callback (adjust if route differs)
- Google OAuth (Analytics etc): https://app.iqsion.com/api/auth/google/callback
- Meta: https://app.iqsion.com/api/auth/meta/callback
- TikTok: https://app.iqsion.com/api/auth/tiktok/callback
- Shopify: https://app.iqsion.com/api/auth/shopify/callback

Keep all in sync across env + provider consoles.

### 17b. Redirect URI Summary (Development / Localhost)
Use these during local testing; ensure they are added to each provider's console alongside production values (most consoles allow multiple).

- Search Console: http://localhost:5001/api/auth/searchconsole/callback
- Google Ads: http://localhost:5001/api/auth/googleads/callback
- Google OAuth (Analytics): http://localhost:5001/api/auth/google/callback
- Meta: http://localhost:5001/api/auth/meta/callback
- TikTok: http://localhost:5001/api/auth/tiktok/callback
- Shopify: http://localhost:5001/api/auth/shopify/callback

If you change local backend port (default 5001) update all URIs accordingly.

### 17c. Common Pitfalls
- client_id=undefined page: Usually Cloud Run revision missing the env var (e.g. GOOGLE_CLIENT_ID). Fix by redeploying with --set-env-vars or ensure .env.production file is present (server loads it automatically now).
- Redirect mismatch: Check exact protocol (http vs https), domain and path; Google is strict about trailing slashes.
- Mixed local/prod tokens: Don’t reuse a production refresh token locally; re-authorize locally to avoid accidental revocation.

### 18. CORS & Cookies (Expanded)
Add any additional origins that should call the API directly (e.g. marketing site at https://iqsion.com) to CORS_ORIGINS, comma separated.

Example:
```
CORS_ORIGINS=https://app.iqsion.com,https://iqsion.com
```

Cookie Domain Recommendation (future when introducing secure cookies): Use a shared parent domain so both app and marketing can read auth/session cookies if needed.

```
Set-Cookie: iq_session=...; Domain=.iqsion.com; Secure; HttpOnly; SameSite=Lax
```

For now authentication uses Firebase tokens in headers/body and not HTTP-only cookies, so this is optional.

### 18. Security Quick Wins
- Set secure session cookie flags in production (Secure, HttpOnly, SameSite=Lax).
- Enforce HTTPS by default (Hosting + Cloud Run already handle TLS).
- Rotate secrets quarterly.
- Add simple audit log of OAuth connection events.

### 19. Next Steps After Deployment
- Apply for Google Ads developer token approval if still pending.
- Integrate structured analytics events.
- Implement rate limiting and error alerting.

---
Deployment complete when all checklist items pass and domain resolves with valid SSL.
