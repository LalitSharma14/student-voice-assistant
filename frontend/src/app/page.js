"use client";

import { useState } from "react";
export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const handleSend = () => {

    if (message.trim() === "") return;

    setMessages([...messages, message]);

    setMessage("");
  };
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
            <div className="space-y-3">
              {messages.length === 0 ? (
              <p className="text-gray-500">Chat messages will appear here...</p>
              ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-gray-800 p-3 rounded-lg w-fit max-w-[80%]"
                >
                <p>
                  <span className="font-bold">You: </span>
                  {msg}
                </p>
                </div>
              ))
              )}
            </div>
          </div>

          {/* Input Section */}
          <div className="flex gap-3">
            

            <input
              type="text"
              placeholder="Ask your question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
  className="flex-1 border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
/>

            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-lg font-semibold"
            >
              Send
            </button>

            <button className="bg-green-500 hover:bg-green-600 transition text-white px-5 py-3 rounded-lg text-2xl">
              🎤
            </button>

          </div>
          <p className="mt-4 text-lg text-blue-600">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}