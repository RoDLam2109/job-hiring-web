# Session recovery on Vercel + Render

Deploy both the backend and frontend for this fix. Old browser access tokens are
handled automatically: the client attempts one shared refresh, then clears an
invalid session. Public GET requests can continue without the stale token;
protected pages require login. Network/5xx failures do not delete the saved token.

On Render (`RENDER=true`) or with `NODE_ENV=production`, refresh cookies use
`HttpOnly; Secure; SameSite=None; Path=/` so HTTPS Vercel can send them to Render.
Local development uses `SameSite=Lax` and supports HTTP.

The backend CORS allowlist defaults to:

- `https://job-hiring-web.vercel.app`
- `http://localhost:3000`
- `http://localhost:5173`

If the frontend domain changes or you use Vercel previews, set `FRONTEND_URLS` on
Render to a comma-separated list of exact trusted origins, including the main
site. Do not include URL paths or trailing slashes. This replaces the defaults.

After deployment, log in once to receive the corrected refresh cookie. No manual
localStorage cleanup should be needed. Verify both an expired access token with
a valid refresh cookie and an invalid/missing refresh cookie. The former should
refresh; the latter should clear the login and still permit public job browsing.

Browsers that block third-party cookies entirely may still require another login
after access-token expiry. The site should recover as a guest instead of getting
stuck. Same-site custom domains or a same-origin API proxy are options if longer
sessions are needed in those browsers.

Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
