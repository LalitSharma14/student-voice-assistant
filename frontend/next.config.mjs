/** @type {import('next').NextConfig} */

const DEPLOYED_BACKEND_URL = "https://lalit00014-student-voice-assistant-backend.hf.space";
const LOCAL_BACKEND_URL = "http://127.0.0.1:8000";
const BACKEND_URL =
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "development" ? LOCAL_BACKEND_URL : DEPLOYED_BACKEND_URL);

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
        source: "/api/diagram-search",
        destination: `${BACKEND_URL}/diagram-search/`,
      },
      {
        source: "/api/audio/:path*",
        destination: `${BACKEND_URL}/audio/:path*`,
      },
    ];
  },
};

export default nextConfig;
