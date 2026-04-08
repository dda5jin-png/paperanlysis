/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
    // 대용량 PDF 업로드 허용 (기본 4MB → 100MB)
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
