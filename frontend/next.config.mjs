/** @type {import('next').NextConfig} */

const BACKEND_URL = "https://lalit00014-student-voice-assistant-backend.hf.space";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api",
        destination: `${BACKEND_URL}/`,
      },
      {
        source: "/api/ask-text",
        destination: `${BACKEND_URL}/ask-text/`,
      },
      {
        source: "/api/tts",
        destination: `${BACKEND_URL}/tts/`,
      },
      {
        source: "/api/ask",
        destination: `${BACKEND_URL}/ask/`,
      },
      {
        source: "/api/generate-test",
        destination: `${BACKEND_URL}/generate-test/`,
      },
      {
        source: "/api/audio/:path*",
        destination: `${BACKEND_URL}/audio/:path*`,
      },
    ];
  },
};

export default nextConfig;