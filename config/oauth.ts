export const OAuthConfig = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
    authUri: process.env.NEXT_PUBLIC_GOOGLE_AUTH_URI,
  },
  facebook: {
    clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI,
    authUri: process.env.NEXT_PUBLIC_FACEBOOK_AUTH_URI,
  },
}
