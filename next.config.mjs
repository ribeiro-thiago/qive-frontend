/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: "/financeiro/contas-a-pagar",
        destination: "/financeiro/gestao-de-pagamentos",
        permanent: true,
      },
      {
        source: "/financeiro/contas-a-pagar/:path*",
        destination: "/financeiro/gestao-de-pagamentos/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
