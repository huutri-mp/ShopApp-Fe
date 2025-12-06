export const OAuthConfig = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    redirectUri:
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/authenticate`
        : ""),
    authUri:
      process.env.NEXT_PUBLIC_GOOGLE_AUTH_URI ||
      "https://accounts.google.com/o/oauth2/auth",
  },
  facebook: {
    clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
    redirectUri:
      process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/authenticate`
        : ""),
    authUri:
      process.env.NEXT_PUBLIC_FACEBOOK_AUTH_URI ||
      "https://www.facebook.com/v19.0/dialog/oauth",
  },
};
