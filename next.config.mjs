import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const apiProxyTarget = process.env.API_PROXY_TARGET;

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (!apiProxyTarget) {
      return [];
    }

    const normalizedTarget = apiProxyTarget.replace(/\/$/, "");

    return [
      {
        source: "/api/v1/:path*",
        destination: `${normalizedTarget}/api/v1/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
