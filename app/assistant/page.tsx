'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Loader } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome to your AI Travel Assistant! I can help you plan your perfect journey. Ask me about destinations, packages, travel tips, or anything related to travel.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.reply },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I could not connect to the AI service.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
            AI Travel <span className="text-amber-500">Assistant</span>
          </h1>
          <p className="text-xl text-stone-400">
            Get personalized travel recommendations powered by artificial intelligence
          </p>
        </div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden flex flex-col h-[600px]"
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-6 py-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-amber-600 text-black'
                      : 'bg-stone-800 text-stone-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-stone-800 px-6 py-4 rounded-2xl">
                  <Loader className="h-5 w-5 text-amber-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-stone-800 p-6">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about your dream trip..."
                disabled={loading}
                className="flex-1 px-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-amber-600 text-black font-bold rounded-xl hover:bg-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </motion.div>

        {/* Quick Suggestions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'What are the best Umrah packages?',
            'Tell me about Dubai tourism',
            'How to prepare for Hajj?',
            'Best travel season for Turkey',
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setInput(suggestion)}
              className="p-4 bg-stone-900 border border-stone-800 rounded-xl text-stone-400 hover:border-amber-600 hover:text-amber-500 transition-all text-sm text-left"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
