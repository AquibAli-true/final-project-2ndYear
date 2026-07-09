import { useState } from 'react';

export default function AiChat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: `This is a simulated AI response to: "${input}"`,
        isBot: true
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full h-full bg-(--off-white)">
      <div className="px-6 py-4 border-b border-gray-200 font-medium text-gray-700 bg-gray-50">
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-24 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                msg.isBot
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 bg-white px-6 py-4 md:px-12 lg:px-24 pb-6">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full pl-5 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}