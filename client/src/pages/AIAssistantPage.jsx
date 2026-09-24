import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Calendar,
  Briefcase,
  Upload,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  Trash2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import aiApi from '../api/aiApi';
import { useAuthStore } from '../store/authStore';

export default function AIAssistantPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'summarize' | 'study-plan' | 'placement'

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello **${user?.name || 'Student'}**! I am your **UniSphere AI University Advisor**.\n\nI am connected directly to your university records for **${user?.department || 'your department'}** (Year ${user?.year || 1}, Sem ${user?.semester || 1}).\n\nAsk me anything about your courses, assignments, attendance warnings, or upcoming exams!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [groundedStats, setGroundedStats] = useState(null);
  const chatBottomRef = useRef(null);

  // Document Summarizer State
  const [docFile, setDocFile] = useState(null);
  const [docText, setDocText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [summaryResult, setSummaryResult] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Study Plan State
  const [planDays, setPlanDays] = useState(7);
  const [planHours, setPlanHours] = useState(4);
  const [targetSubject, setTargetSubject] = useState('');
  const [studyPlanResult, setStudyPlanResult] = useState(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  // Placement Prep State
  const [placementCompany, setPlacementCompany] = useState('');
  const [placementRole, setPlacementRole] = useState('Software Engineer / Developer');
  const [placementSkills, setPlacementSkills] = useState('Data Structures, Algorithms, System Design, SQL, React, Node.js');
  const [placementResult, setPlacementResult] = useState(null);
  const [isPlacementLoading, setIsPlacementLoading] = useState(false);

  const [copiedId, setCopiedId] = useState(null);

  // Scroll to chat bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading, activeTab]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Send Chat Message
  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const userMessageId = Date.now().toString();
    const newUserMsg = {
      id: userMessageId,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!customText) setChatInput('');
    setIsChatLoading(true);

    try {
      // Build conversation history format for API
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await aiApi.chat(textToSend, history);
      
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (res.data.groundedContext) {
        setGroundedStats(res.data.groundedContext);
      }
    } catch (err) {
      console.error('Chat error:', err);
      toast.error(err.response?.data?.message || 'Failed to get response from AI');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ I encountered an error retrieving your academic data. Please check your connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 2. Handle Summarizer
  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!docFile && !docText.trim()) {
      toast.error('Please upload a file or paste document text');
      return;
    }

    setIsSummarizing(true);
    setSummaryResult(null);

    try {
      let res;
      if (docFile) {
        const formData = new FormData();
        formData.append('file', docFile);
        if (docTitle) formData.append('title', docTitle);
        res = await aiApi.summarize(formData, true);
      } else {
        res = await aiApi.summarize({ text: docText, title: docTitle || 'Course Notes' }, false);
      }

      setSummaryResult(res.data);
      toast.success('Document summarized successfully!');
    } catch (err) {
      console.error('Summarize error:', err);
      toast.error(err.response?.data?.message || 'Failed to summarize document');
    } finally {
      setIsSummarizing(false);
    }
  };

  // 3. Handle Study Plan
  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setIsPlanLoading(true);
    setStudyPlanResult(null);

    try {
      const res = await aiApi.generateStudyPlan({
        days: Number(planDays),
        dailyHours: Number(planHours),
        targetSubject: targetSubject.trim() || undefined,
      });

      setStudyPlanResult(res.data);
      toast.success('Study plan generated!');
    } catch (err) {
      console.error('Study plan error:', err);
      toast.error(err.response?.data?.message || 'Failed to generate study plan');
    } finally {
      setIsPlanLoading(false);
    }
  };

  // 4. Handle Placement Prep
  const handlePlacementPrep = async (e) => {
    e.preventDefault();
    if (!placementCompany.trim()) {
      toast.error('Please enter the target company name');
      return;
    }

    setIsPlacementLoading(true);
    setPlacementResult(null);

    try {
      const res = await aiApi.placementPrep({
        company: placementCompany.trim(),
        role: placementRole.trim(),
        skills: placementSkills.split(',').map((s) => s.trim()).filter(Boolean),
      });

      setPlacementResult(res.data);
      toast.success('Placement preparation guide ready!');
    } catch (err) {
      console.error('Placement prep error:', err);
      toast.error(err.response?.data?.message || 'Failed to generate placement prep');
    } finally {
      setIsPlacementLoading(false);
    }
  };

  const quickPrompts = [
    { label: '🎯 What should I focus on this week?', prompt: 'What should I focus on this week based on my assignments and exams?' },
    { label: '📊 Analyze my attendance risk', prompt: 'Analyze my current attendance across all subjects. Are any below 75%?' },
    { label: '📝 List pending assignments', prompt: 'What pending assignments do I have left to submit and what are their due dates?' },
    { label: '📅 Upcoming exam schedule', prompt: 'When are my upcoming exams and what subjects are scheduled?' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Bot className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI University Assistant</h1>
            <span className="badge-info">Grounded AI</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalized academic mentorship, document summarization, custom study schedules, and interview prep.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl max-w-fit">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Academic Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('summarize')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'summarize'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Doc Summarizer</span>
          </button>
          <button
            onClick={() => setActiveTab('study-plan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'study-plan'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Study Planner</span>
          </button>
          <button
            onClick={() => setActiveTab('placement')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'placement'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Placement Prep</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: CONTEXTUAL CHAT ASSISTANT (Glassmorphism Surface)
         ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Window (Glass Panel) */}
          <div className="lg:col-span-3 flex flex-col h-[650px] glass-panel p-4 md:p-6 overflow-hidden">
            {/* Chat Header Status */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    UniSphere AI Advisor
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Grounded in live database for {user?.name || 'Student'} ({user?.department || 'Academics'})
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMessages([messages[0]]);
                  toast.success('Chat history cleared');
                }}
                className="btn-icon text-xs flex items-center gap-1 text-slate-400 hover:text-rose-500"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800/40">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Prompts:
              </span>
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={isChatLoading}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 whitespace-nowrap transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm relative group ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                      : 'bg-white/80 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700/60 shadow-sm'
                  }`}>
                    {/* Markdown rendering formatting */}
                    <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                      {msg.content}
                    </div>

                    <div className={`flex items-center justify-between gap-4 mt-2 pt-1.5 border-t ${
                      msg.role === 'user' ? 'border-white/20 text-indigo-100' : 'border-slate-100 dark:border-slate-700 text-slate-400'
                    } text-[10px]`}>
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:opacity-100 opacity-70 transition-opacity flex items-center gap-1"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-1 text-xs font-bold">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking / Loading indicator */}
              {isChatLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/90 rounded-2xl rounded-bl-none p-4 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse delay-300"></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                      Analyzing live database records...
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about attendance, upcoming deadlines, study strategy..."
                className="flex-1 input-field bg-white/90 dark:bg-slate-900/90 text-sm"
                disabled={isChatLoading}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="btn-primary px-4 py-2.5 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>

          {/* Right Side Context Card (Minimalist flat card) */}
          <div className="space-y-4">
            <div className="flat-card p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Live Academic Grounding
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                UniSphere queries the MongoDB cluster in real-time before responding to ensure accurate advice.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="text-slate-500 dark:text-slate-400">Department & Major</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                    {user?.department || 'Computer Science'} (Yr {user?.year || 1})
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="text-slate-500 dark:text-slate-400">Context Sources</div>
                  <ul className="mt-1 space-y-1 text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Attendance logs per course
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Unsubmitted assignment deadlines
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Scheduled upcoming examinations
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Open placement & internship drives
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-300">
                  <div className="font-semibold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Pro-Tip
                  </div>
                  <div className="mt-1 leading-relaxed">
                    Try asking: <em>"Generate a 3-day revision timetable for my nearest exam."</em>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DOCUMENT SUMMARIZER (Flat Minimalist Layout)
         ========================================================================= */}
      {activeTab === 'summarize' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upload & Input Form */}
          <div className="lg:col-span-5 flat-card p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Document Summarizer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Upload PDF lecture slides or paste lecture notes to extract structured key concepts, formulas, and exam takeaways.
            </p>

            <form onSubmit={handleSummarize} className="space-y-4">
              <div>
                <label className="label">Material Title (Optional)</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems - Unit 3"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Upload PDF or Text Document</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                  <input
                    type="file"
                    id="docFileInput"
                    accept=".pdf,.txt"
                    onChange={(e) => setDocFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="docFileInput" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {docFile ? docFile.name : 'Click to select PDF or TXT file'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">Maximum file size: 20MB</span>
                  </label>
                  {docFile && (
                    <button
                      type="button"
                      onClick={() => setDocFile(null)}
                      className="mt-2 text-xs text-rose-500 hover:underline"
                    >
                      Remove selected file
                    </button>
                  )}
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase">Or Paste Text</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              </div>

              <div>
                <label className="label">Paste Course Content</label>
                <textarea
                  rows={5}
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  placeholder="Paste lecture notes, book chapters, or syllabus text here..."
                  className="input-field resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSummarizing || (!docFile && !docText.trim())}
                className="btn-primary w-full py-2.5"
              >
                {isSummarizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting & Summarizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Structured Summary</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Summary Output Area */}
          <div className="lg:col-span-7 flat-card p-6 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {summaryResult?.title || 'Summary Output'}
                </h3>
                {summaryResult && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Extracted from ~{summaryResult.wordCount} words
                  </p>
                )}
              </div>

              {summaryResult && (
                <button
                  onClick={() => handleCopy(summaryResult.summary, 'summary')}
                  className="btn-secondary text-xs"
                >
                  {copiedId === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'summary' ? 'Copied' : 'Copy Summary'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 py-4 overflow-y-auto">
              {isSummarizing ? (
                <div className="space-y-4 py-8">
                  <div className="skeleton h-6 w-1/3"></div>
                  <div className="skeleton h-20 w-full"></div>
                  <div className="skeleton h-6 w-1/4"></div>
                  <div className="skeleton h-24 w-full"></div>
                  <div className="skeleton h-6 w-1/2"></div>
                  <div className="skeleton h-16 w-full"></div>
                </div>
              ) : summaryResult ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {summaryResult.summary}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <FileText className="w-12 h-12 stroke-1 mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No Document Summarized Yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Upload a lecture PDF or paste notes on the left to generate key takeaways, formula cheat sheets, and exam tips.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STUDY PLAN GENERATOR (Flat Minimalist Layout)
         ========================================================================= */}
      {activeTab === 'study-plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Planner Controls */}
          <div className="lg:col-span-4 flat-card p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Smart Study Planner
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Generates a personalized daily study timetable prioritized by your upcoming exam dates and assignments.
            </p>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div>
                <label className="label">Timeframe (Days)</label>
                <select
                  value={planDays}
                  onChange={(e) => setPlanDays(e.target.value)}
                  className="input-field"
                >
                  <option value={3}>3 Days (Crash Revision)</option>
                  <option value={7}>7 Days (1 Week Sprint)</option>
                  <option value={14}>14 Days (2 Weeks Comprehensive)</option>
                  <option value={30}>30 Days (Full Exam Month)</option>
                </select>
              </div>

              <div>
                <label className="label">Daily Study Commitment (Hours/Day)</label>
                <select
                  value={planHours}
                  onChange={(e) => setPlanHours(e.target.value)}
                  className="input-field"
                >
                  <option value={2}>2 Hours / day (Light)</option>
                  <option value={4}>4 Hours / day (Standard)</option>
                  <option value={6}>6 Hours / day (Intensive)</option>
                  <option value={8}>8 Hours / day (Full Focus)</option>
                </select>
              </div>

              <div>
                <label className="label">Target Subject / Focus (Optional)</label>
                <input
                  type="text"
                  value={targetSubject}
                  onChange={(e) => setTargetSubject(e.target.value)}
                  placeholder="e.g. Operating Systems or All Subjects"
                  className="input-field"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">Auto-Synced Factors:</div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Upcoming exams prioritized by nearest date
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Low-attendance subjects allocated revision blocks
                </div>
              </div>

              <button
                type="submit"
                disabled={isPlanLoading}
                className="btn-primary w-full py-2.5"
              >
                {isPlanLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Building Custom Schedule...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Day-by-Day Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Plan Output */}
          <div className="lg:col-span-8 flat-card p-6 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {studyPlanResult ? `${studyPlanResult.days}-Day Personalized Revision Plan` : 'Your Study Schedule'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customized timetable with session breakdowns and milestones
                </p>
              </div>

              {studyPlanResult && (
                <button
                  onClick={() => handleCopy(studyPlanResult.studyPlan, 'plan')}
                  className="btn-secondary text-xs"
                >
                  {copiedId === 'plan' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'plan' ? 'Copied' : 'Copy Plan'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 py-4 overflow-y-auto">
              {isPlanLoading ? (
                <div className="space-y-4 py-8">
                  <div className="skeleton h-8 w-1/2"></div>
                  <div className="skeleton h-24 w-full"></div>
                  <div className="skeleton h-24 w-full"></div>
                  <div className="skeleton h-24 w-full"></div>
                </div>
              ) : studyPlanResult ? (
                <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed space-y-3">
                  {studyPlanResult.studyPlan}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <Calendar className="w-12 h-12 stroke-1 mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No Study Plan Active</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Select your timeframe and daily study hours on the left to generate an actionable day-by-day revision roadmap.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PLACEMENT & INTERVIEW PREP (Flat Minimalist Layout)
         ========================================================================= */}
      {activeTab === 'placement' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Prep Inputs */}
          <div className="lg:col-span-4 flat-card p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Placement & Career Prep
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Generate company-specific technical topics, top 5 interview questions with model answer frameworks, and STAR behavioral prep.
            </p>

            <form onSubmit={handlePlacementPrep} className="space-y-4">
              <div>
                <label className="label">Target Company</label>
                <input
                  type="text"
                  required
                  value={placementCompany}
                  onChange={(e) => setPlacementCompany(e.target.value)}
                  placeholder="e.g. Google, Microsoft, Amazon, Infosys"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Role / Designation</label>
                <input
                  type="text"
                  value={placementRole}
                  onChange={(e) => setPlacementRole(e.target.value)}
                  placeholder="e.g. SDE-1, Cloud Engineer, Data Analyst"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Required Skills / Tech Stack</label>
                <textarea
                  rows={3}
                  value={placementSkills}
                  onChange={(e) => setPlacementSkills(e.target.value)}
                  placeholder="e.g. Java, Python, SQL, DSA, System Design"
                  className="input-field resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isPlacementLoading || !placementCompany.trim()}
                className="btn-primary w-full py-2.5"
              >
                {isPlacementLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Crafting Prep Guide...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Interview Roadmap</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Prep Guide Output */}
          <div className="lg:col-span-8 flat-card p-6 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {placementResult ? `${placementResult.company} — ${placementResult.role} Prep Guide` : 'Interview Roadmap'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Role breakdown, high-probability questions, and 7-day checklist
                </p>
              </div>

              {placementResult && (
                <button
                  onClick={() => handleCopy(placementResult.prepGuide, 'prep')}
                  className="btn-secondary text-xs"
                >
                  {copiedId === 'prep' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'prep' ? 'Copied' : 'Copy Guide'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 py-4 overflow-y-auto">
              {isPlacementLoading ? (
                <div className="space-y-4 py-8">
                  <div className="skeleton h-8 w-1/2"></div>
                  <div className="skeleton h-28 w-full"></div>
                  <div className="skeleton h-28 w-full"></div>
                  <div className="skeleton h-28 w-full"></div>
                </div>
              ) : placementResult ? (
                <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed space-y-3">
                  {placementResult.prepGuide}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <Briefcase className="w-12 h-12 stroke-1 mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Ready for Interview Prep</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Enter your target company and role on the left to receive customized interview questions and a 7-day preparation sprint.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
