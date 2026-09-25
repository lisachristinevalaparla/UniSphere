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
  CheckCircle2,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import aiApi from '../api/aiApi';
import { useAuthStore } from '../store/authStore';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function AIAssistantPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'summarize' | 'study-plan' | 'placement'

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello **${user?.name || 'Student'}**! I am your **UniSphere AI Academic Copilot**.\n\nI am connected directly to your university database for **${user?.department || 'your department'}** (Year ${user?.year || 1}, Sem ${user?.semester || 1}).\n\nAsk me anything about your syllabus, pending assignments, low-attendance thresholds, or upcoming exams!`,
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
          content: '⚠️ I encountered an error retrieving your academic data. Please try again.',
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
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Top Header & Mode Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6e9f6] dark:bg-[#1e2027] text-slate-700 dark:text-slate-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Academic Copilot</span>
          </div>
          <h1 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">AI University Advisor</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalized academic mentorship, document summarization, custom revision plans, and placement roadmaps.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="segmented-pill-container max-w-fit self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`segmented-pill-item flex items-center gap-1.5 ${
              activeTab === 'chat' ? 'segmented-pill-item-active' : ''
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Academic Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('summarize')}
            className={`segmented-pill-item flex items-center gap-1.5 ${
              activeTab === 'summarize' ? 'segmented-pill-item-active' : ''
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Doc Summarizer</span>
          </button>
          <button
            onClick={() => setActiveTab('study-plan')}
            className={`segmented-pill-item flex items-center gap-1.5 ${
              activeTab === 'study-plan' ? 'segmented-pill-item-active' : ''
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Study Planner</span>
          </button>
          <button
            onClick={() => setActiveTab('placement')}
            className={`segmented-pill-item flex items-center gap-1.5 ${
              activeTab === 'placement' ? 'segmented-pill-item-active' : ''
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Placement Prep</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ACADEMIC CHAT */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Window */}
          <div className="lg:col-span-8 flex flex-col h-[650px] bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e5f0] dark:border-[#22242a]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#111827] dark:bg-white flex items-center justify-center text-white dark:text-[#111827] shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#111827] dark:text-white flex items-center gap-2">
                    UniSphere Copilot
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live MongoDB grounding for {user?.name || 'Student'} ({user?.department || 'Engineering'})
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMessages([messages[0]]);
                  toast.success('Chat history cleared');
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#e2e5f0] dark:border-[#22242a]">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
                <Zap className="w-3.5 h-3.5 text-purple-600" /> Prompts:
              </span>
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={isChatLoading}
                  className="btn-pill-outline-sm whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#e6e9f6] dark:bg-[#252831] text-[#111827] dark:text-white flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm relative leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#111827] text-white dark:bg-white dark:text-[#111827] rounded-br-sm shadow-sm'
                      : 'bg-[#f8f9fd] dark:bg-[#141518] text-[#111827] dark:text-[#f3f4f6] rounded-bl-sm border border-[#e2e5f0] dark:border-[#26282e]'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed space-y-2 font-medium">
                        {msg.content}
                      </div>
                    )}

                    <div className={`flex items-center justify-between gap-4 mt-2.5 pt-2 border-t ${
                      msg.role === 'user' ? 'border-white/20 text-slate-300 dark:text-slate-600' : 'border-[#e2e5f0] dark:border-[#26282e] text-slate-400'
                    } text-[10px]`}>
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:opacity-100 opacity-70 transition-opacity flex items-center gap-1 font-semibold"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-[#e6e9f6] dark:bg-[#252831] text-[#111827] dark:text-white flex items-center justify-center shrink-0 mt-1 text-[10px] font-bold">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
                    </div>
                  )}
                </div>
              ))}

              {isChatLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-7 h-7 rounded-full bg-[#e6e9f6] dark:bg-[#252831] text-[#111827] dark:text-white flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 animate-bounce" />
                  </div>
                  <div className="bg-[#f8f9fd] dark:bg-[#141518] rounded-2xl rounded-bl-none p-3.5 border border-[#e2e5f0] dark:border-[#26282e] flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#111827] dark:bg-white animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#111827] dark:bg-white animate-pulse delay-150" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#111827] dark:bg-white animate-pulse delay-300" />
                    <span className="font-medium ml-1">Analyzing university records...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="pt-3 border-t border-[#e2e5f0] dark:border-[#22242a] flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about attendance, upcoming deadlines, exam strategy..."
                className="flex-1 input-field py-2.5 text-xs sm:text-sm"
                disabled={isChatLoading}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="btn-pill-primary px-5 py-2.5 shrink-0 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Right Side Context Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 shadow-sm text-left">
              <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Live Academic Grounding
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                UniSphere queries your course database in real time before responding.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Department & Term</div>
                  <div className="font-bold text-[#111827] dark:text-white text-xs mt-0.5">
                    {user?.department || 'Computer Science'} (Yr {user?.year || 1}, Sem {user?.semester || 1})
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                  <div className="text-slate-500 text-[10px] font-bold uppercase mb-1.5">Context Sources</div>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-medium">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Live attendance per course
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOC SUMMARIZER */}
      {activeTab === 'summarize' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#111827] dark:text-white flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5" />
              Document Summarizer
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Upload PDF lecture slides or paste lecture notes to extract key concepts, formulas, and exam takeaways.
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
                <div className="border-2 border-dashed border-[#e2e5f0] dark:border-[#2b2e38] rounded-2xl p-4 text-center hover:border-black dark:hover:border-white transition-colors bg-[#f8f9fd] dark:bg-[#141518]">
                  <input
                    type="file"
                    id="docFileInput"
                    accept=".pdf,.txt"
                    onChange={(e) => setDocFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="docFileInput" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-7 h-7 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-[#111827] dark:text-white">
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
                      Remove file
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Or Paste Course Notes</label>
                <textarea
                  rows={4}
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  placeholder="Paste lecture notes or chapter text here..."
                  className="input-field min-h-[90px] resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSummarizing || (!docFile && !docText.trim())}
                className="btn-pill-primary w-full py-3 text-xs"
              >
                {isSummarizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting & Summarizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    <span>Generate Structured Summary</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e5f0] dark:border-[#22242a]">
              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-white">
                  {summaryResult?.title || 'Summary Output'}
                </h3>
                {summaryResult && (
                  <p className="text-xs text-slate-500">
                    Extracted from ~{summaryResult.wordCount} words
                  </p>
                )}
              </div>

              {summaryResult && (
                <button
                  onClick={() => handleCopy(summaryResult.summary, 'summary')}
                  className="btn-pill-secondary text-xs"
                >
                  {copiedId === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'summary' ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 py-4 overflow-y-auto">
              {isSummarizing ? (
                <div className="space-y-4 py-8">
                  <div className="skeleton h-6 w-1/3 rounded-full" />
                  <div className="skeleton h-20 w-full rounded-2xl" />
                  <div className="skeleton h-24 w-full rounded-2xl" />
                </div>
              ) : summaryResult ? (
                <MarkdownRenderer content={summaryResult.summary} className="text-xs sm:text-sm" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <FileText className="w-12 h-12 stroke-1 mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-bold text-[#111827] dark:text-white">No Document Summarized Yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Upload a lecture PDF or paste notes on the left to extract key takeaways, formulas, and exam tips.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STUDY PLANNER */}
      {activeTab === 'study-plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#111827] dark:text-white flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5" />
              Smart Study Planner
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Generates a personalized daily timetable prioritized by your upcoming exam dates and assignments.
            </p>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div>
                <label className="label">Timeframe (Days)</label>
                <select value={planDays} onChange={(e) => setPlanDays(e.target.value)} className="input-field">
                  <option value={3}>3 Days (Crash Revision)</option>
                  <option value={7}>7 Days (1 Week Sprint)</option>
                  <option value={14}>14 Days (2 Weeks Comprehensive)</option>
                  <option value={30}>30 Days (Full Exam Month)</option>
                </select>
              </div>

              <div>
                <label className="label">Daily Commitment (Hours/Day)</label>
                <select value={planHours} onChange={(e) => setPlanHours(e.target.value)} className="input-field">
                  <option value={2}>2 Hours / day (Light)</option>
                  <option value={4}>4 Hours / day (Standard)</option>
                  <option value={6}>6 Hours / day (Intensive)</option>
                </select>
              </div>

              <div>
                <label className="label">Target Subject (Optional)</label>
                <input
                  type="text"
                  value={targetSubject}
                  onChange={(e) => setTargetSubject(e.target.value)}
                  placeholder="e.g. Operating Systems or All Subjects"
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={isPlanLoading} className="btn-pill-primary w-full py-3 text-xs">
                {isPlanLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Building Custom Schedule...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    <span>Generate Revision Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e5f0] dark:border-[#22242a]">
              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-white">
                  {studyPlanResult ? `${studyPlanResult.days}-Day Revision Plan` : 'Your Study Schedule'}
                </h3>
              </div>
              {studyPlanResult && (
                <button onClick={() => handleCopy(studyPlanResult.studyPlan, 'plan')} className="btn-pill-secondary text-xs">
                  {copiedId === 'plan' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              )}
            </div>

            <div className="flex-1 py-4 overflow-y-auto">
              {isPlanLoading ? (
                <div className="space-y-4 py-8">
                  <div className="skeleton h-8 w-1/2 rounded-full" />
                  <div className="skeleton h-24 w-full rounded-2xl" />
                </div>
              ) : studyPlanResult ? (
                <MarkdownRenderer content={studyPlanResult.studyPlan} className="text-xs sm:text-sm" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <Calendar className="w-12 h-12 stroke-1 mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-bold text-[#111827] dark:text-white">No Study Plan Active</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Select your timeframe on the left to generate an actionable day-by-day revision roadmap.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PLACEMENT PREP */}
      {activeTab === 'placement' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#111827] dark:text-white flex items-center gap-2 mb-1">
              <Briefcase className="w-5 h-5" />
              Placement & Interview Prep
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Generate company-specific technical topics, top 5 interview questions with model answers, and a 7-day checklist.
            </p>

            <form onSubmit={handlePlacementPrep} className="space-y-4">
              <div>
                <label className="label">Target Company</label>
                <input
                  type="text"
                  required
                  value={placementCompany}
                  onChange={(e) => setPlacementCompany(e.target.value)}
                  placeholder="e.g. Google, Microsoft, Amazon"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Role / Designation</label>
                <input
                  type="text"
                  value={placementRole}
                  onChange={(e) => setPlacementRole(e.target.value)}
                  placeholder="e.g. SDE-1, Cloud Engineer"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Tech Stack / Skills</label>
                <textarea
                  rows={2}
                  value={placementSkills}
                  onChange={(e) => setPlacementSkills(e.target.value)}
                  placeholder="e.g. Java, Python, SQL, DSA, System Design"
                  className="input-field min-h-[60px] resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isPlacementLoading || !placementCompany.trim()}
                className="btn-pill-primary w-full py-3 text-xs"
              >
                {isPlacementLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Crafting Prep Guide...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    <span>Generate Interview Roadmap</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e5f0] dark:border-[#22242a]">
              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-white">
                  {placementResult ? `${placementResult.company} Prep Guide` : 'Interview Roadmap'}
                </h3>
              </div>
              {placementResult && (
                <button onClick={() => handleCopy(placementResult.prepGuide, 'prep')} className="btn-pill-secondary text-xs">
                  {copiedId === 'prep' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              )}
            </div>

            <div className="flex-1 py-4 overflow-y-auto">
              {isPlacementLoading ? (
                <div className="space-y-4 py-8">
                  <div className="skeleton h-8 w-1/2 rounded-full" />
                  <div className="skeleton h-24 w-full rounded-2xl" />
                </div>
              ) : placementResult ? (
                <MarkdownRenderer content={placementResult.prepGuide} className="text-xs sm:text-sm" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <Briefcase className="w-12 h-12 stroke-1 mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-bold text-[#111827] dark:text-white">Ready for Interview Prep</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Enter your target company on the left to receive customized questions and a 7-day preparation sprint.
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
