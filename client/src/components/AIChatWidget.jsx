import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Maximize2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import aiApi from '../api/aiApi';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import MarkdownRenderer from './MarkdownRenderer';

export default function AIChatWidget() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! Need help with your courses, assignments, attendance, or exam timetable? Ask me!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  if (!isAuthenticated) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const newMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await aiApi.chat(userText, history);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      toast.error('AI response failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-20 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-pill-primary px-4 py-2.5 shadow-lg flex items-center gap-2 hover:scale-105 transition-all text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Ask Copilot</span>
        </button>
      )}

      {/* Floating Chat Popup */}
      {isOpen && (
        <div className="w-[350px] sm:w-[390px] h-[520px] bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 text-left">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[#e2e5f0] dark:border-[#22242a] flex items-center justify-between bg-[#f8f9fd] dark:bg-[#141518]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#111827] dark:bg-white flex items-center justify-center text-white dark:text-[#111827] shadow-sm">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#111827] dark:text-white flex items-center gap-1.5">
                  UniSphere Copilot
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-[10px] text-slate-500">Academic Study Advisor</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/ai-assistant');
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-black dark:hover:text-white hover:bg-[#e6e9f6] dark:hover:bg-[#252831] transition-colors"
                title="Full Screen Assistant"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#e6e9f6] dark:bg-[#252831] text-[#111827] dark:text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3 h-3" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#111827] text-white dark:bg-white dark:text-[#111827] rounded-br-none font-medium whitespace-pre-wrap'
                      : 'bg-[#f8f9fd] dark:bg-[#141518] text-slate-800 dark:text-slate-100 rounded-bl-none border border-[#e2e5f0] dark:border-[#26282e]'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <MarkdownRenderer content={m.content} />
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-slate-500">
                <Bot className="w-4 h-4 animate-spin text-[#111827] dark:text-white" />
                <span className="text-[11px]">Analyzing course records...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-[#e2e5f0] dark:border-[#22242a] flex items-center gap-2 bg-[#f8f9fd] dark:bg-[#141518]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 input-field py-2 text-xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-pill-primary py-2 px-3 text-xs"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
