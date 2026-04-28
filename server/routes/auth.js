// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const NextAuth = require('next-auth').default;
const GoogleProvider = require('next-auth/providers/google').default;

// In‑memory store for OAuth state values (for demo only)
const stateStore = new Map();

// ---------- OAuth2 Callback Handler (generic) ----------
router.get('/callback', (req, res) => {
  const { state, code, redirect_uri } = req.query;

  // Validate state
  if (!state || !stateStore.has(state)) {
    return res.status(400).json({ error: 'Invalid or missing state parameter' });
  }
  // State is one‑time use – delete it
  stateStore.delete(state);

  // Validate redirect URI whitelist
  const allowedRedirect = 'https://example.com/callback';
  if (redirect_uri !== allowedRedirect) {
    return res.status(400).json({ error: 'Redirect URI not allowed' });
  }

  // At this point you would exchange `code` for tokens with the provider.
  // For this skeleton we just acknowledge success.
  res.json({ success: true, message: 'OAuth2 callback validated' });
});

// ---------- Helper to initiate OAuth flow (generates state) ----------
router.get('/login', (req, res) => {
  const state = uuidv4();
  // Store state with a short TTL (e.g., 10 min). For simplicity, we keep it forever here.
  stateStore.set(state, Date.now());
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', 'https://example.com/callback');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  res.redirect(authUrl.toString());
});

// ---------- NextAuth integration for Google login ----------
router.use('/next', (req, res) => {
  return NextAuth(req, res, {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: { params: { redirect_uri: 'https://example.com/callback' } }
      })
    ],
    secret: process.env.NEXTAUTH_SECRET || uuidv4(), // random secret if not provided
    cookies: {
      sessionToken: {
        name: `next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production'
        }
      }
    },
    callbacks: {
      async session({ session, token, user }) {
        // Attach any custom data if needed
        return session;
      }
    }
  });
});

module.exports = router;
