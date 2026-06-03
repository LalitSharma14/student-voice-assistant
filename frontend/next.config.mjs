/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api",
        destination: "https://lalit00014-student-voice-assistant-backend.hf.space/",
      },
      {
        source: "/api/ask-text",
        destination: "https://lalit00014-student-voice-assistant-backend.hf.space/ask-text/",
      },
      {
        source: "/api/tts",
        destination: "https://lalit00014-student-voice-assistant-backend.hf.space/tts/",
      },
      {
        source: "/api/ask",
        destination: "https://lalit00014-student-voice-assistant-backend.hf.space/ask/",
      },
      {
        source: "/api/audio/:path*",
        destination: "https://lalit00014-student-voice-assistant-backend.hf.space/audio/:path*",
      },
      {
        source: "/api/generate-test",
        destination: "https://lalit00014-student-voice-assistant-backend.hf.space/generate-test/",
      },

    ];
  },
};

export default nextConfig;