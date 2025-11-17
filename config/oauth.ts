export const OAuthConfig = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || (typeof window !== 'undefined' ? `${window.location.origin}/authenticate` : ''),
    authUri: process.env.NEXT_PUBLIC_GOOGLE_AUTH_URI || "https://accounts.google.com/o/oauth2/v2/auth",
  },
  facebook: {
    clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI || (typeof window !== 'undefined' ? `${window.location.origin}/authenticate` : ''),
    authUri: process.env.NEXT_PUBLIC_FACEBOOK_AUTH_URI || "https://www.facebook.com/v19.0/dialog/oauth",
  },
}

// Helper to check if OAuth is properly configured
export const isOAuthConfigured = {
  google: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== 'your_google_client_id_here',
  facebook: !!process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID && process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID !== 'your_facebook_app_id_here',
}
