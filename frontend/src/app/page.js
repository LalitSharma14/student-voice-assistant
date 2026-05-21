export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          <h1 className="text-2xl font-bold">
            Student Voice Assistant
          </h1>

          <div className="flex gap-4">

            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold">
              Login
            </button>

            <button className="bg-green-500 px-4 py-2 rounded-lg font-semibold">
              Get Started
            </button>

          </div>
        </div>
      </nav>

      {/* Main Section */}
      <div className="flex flex-col items-center justify-center py-16 px-4">

        <h1 className="text-5xl font-bold text-blue-600 mb-4 text-center">
          Welcome Student 👋
        </h1>

        <p className="text-gray-700 text-lg mb-8 text-center">
          Ask anything using voice or text
        </p>

        <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-lg">

          {/* Chat Box */}
          <div className="h-64 border rounded-lg p-4 overflow-y-auto mb-4 bg-gray-50">
            <p className="text-gray-500">
              Chat messages will appear here...
            </p>
          </div>

          {/* Input Section */}
          <div className="flex gap-3">

            <input
              type="text"
              placeholder="Ask your question..."
              className="flex-1 border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-lg font-semibold">
              Send
            </button>

            <button className="bg-green-500 hover:bg-green-600 transition text-white px-5 py-3 rounded-lg text-2xl">
              🎤
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}