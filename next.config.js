/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Se você publicar em <user>.github.io/BetterMe descomente as duas linhas abaixo:
  // basePath: "/BetterMe",
  // assetPrefix: "/BetterMe/",
  trailingSlash: true,
};

module.exports = withPWA(nextConfig);
