require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');
const Groq = require('groq-sdk');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const CourseMaterial = require('../models/CourseMaterial');
const Placement = require('../models/Placement');

/**
 * Universal LLM Generator supporting Groq (Llama 3 / OpenAI OSS) & Anthropic (Claude 3.5 Sonnet)
 */
const generateLLMCompletion = async ({ systemPrompt = '', userPrompt = '', messages = [], maxTokens = 1500 }) => {
  // 1. Check for Groq API Key (either GROQ_API_KEY or ANTHROPIC_API_KEY starting with gsk_)
  const groqKey = process.env.GROQ_API_KEY || (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith('gsk_') ? process.env.ANTHROPIC_API_KEY : null);

  if (groqKey) {
    try {
      console.log('🤖 Calling Groq AI API...');
      const groq = new Groq({ apiKey: groqKey });
      const promptMessages = [];
      if (systemPrompt) {
        promptMessages.push({ role: 'system', content: systemPrompt });
      }

      if (messages && messages.length > 0) {
        messages.forEach((m) => {
          if (m.role === 'user' || m.role === 'assistant') {
            promptMessages.push({ role: m.role, content: m.content });
          }
        });
      } else if (userPrompt) {
        promptMessages.push({ role: 'user', content: userPrompt });
      }

      const chatCompletion = await groq.chat.completions.create({
        messages: promptMessages,
        model: 'openai/gpt-oss-120b',
        temperature: 0.6,
        max_tokens: maxTokens,
      });

      const reply = chatCompletion.choices[0]?.message?.content || '';
      if (reply) return reply;
    } catch (groqErr) {
      console.warn('⚠️ Groq API request failed, checking alternatives:', groqErr.message);
    }
  }

  // 2. Check for Anthropic Claude API Key
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith('sk-ant')) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const promptMessages = [];

      if (messages && messages.length > 0) {
        messages.forEach((m) => {
          if (m.role === 'user' || m.role === 'assistant') {
            promptMessages.push({ role: m.role, content: m.content });
          }
        });
      } else if (userPrompt) {
        promptMessages.push({ role: 'user', content: userPrompt });
      }

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        system: systemPrompt || undefined,
        messages: promptMessages,
      });

      const reply = response.content?.[0]?.text || '';
      if (reply) return reply;
    } catch (anthropicErr) {
      console.warn('⚠️ Anthropic API request failed:', anthropicErr.message);
    }
  }

  return null;
};

/**
 * Helper: Gather complete live student academic context from MongoDB
 */
const getStudentAcademicContext = async (studentUser) => {
  const studentId = studentUser._id;
  const dept = studentUser.department || '';
  const year = studentUser.year || 1;
  const sem = studentUser.semester || 1;

  // 1. Attendance Summary
  let attendanceSummary = [];
  try {
    attendanceSummary = await Attendance.getSummaryForStudent(studentId);
  } catch (e) {
    console.error('Error fetching attendance for AI context:', e.message);
  }

  // 2. Upcoming Assignments (targeted to student's dept/year/sem or open)
  let pendingAssignments = [];
  try {
    const now = new Date();
    const query = {
      status: 'active',
      dueDate: { $gte: now },
    };
    if (dept) query.$or = [{ targetDepartment: dept }, { targetDepartment: null }, { targetDepartment: '' }];
    
    const activeAssignments = await Assignment.find(query).sort({ dueDate: 1 }).limit(10).lean();

    // Check which ones are already submitted
    const assignmentIds = activeAssignments.map((a) => a._id);
    const submissions = await Submission.find({
      student: studentId,
      assignment: { $in: assignmentIds },
    }).lean();
    const submittedMap = new Set(submissions.map((s) => s.assignment.toString()));

    pendingAssignments = activeAssignments
      .filter((a) => !submittedMap.has(a._id.toString()))
      .map((a) => ({
        id: a._id,
        title: a.title,
        subject: a.subject,
        dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
        totalMarks: a.totalMarks,
      }));
  } catch (e) {
    console.error('Error fetching assignments for AI context:', e.message);
  }

  // 3. Upcoming Exams
  let upcomingExams = [];
  try {
    const now = new Date();
    const examQuery = {
      status: { $in: ['upcoming', 'ongoing'] },
      date: { $gte: now },
    };
    if (dept) examQuery.$or = [{ targetDepartment: dept }, { targetDepartment: null }, { targetDepartment: '' }];
    
    const exams = await Exam.find(examQuery).sort({ date: 1 }).limit(10).lean();
    upcomingExams = exams.map((e) => ({
      title: e.title,
      subject: e.subject,
      examType: e.examType,
      date: e.date ? new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
      startTime: e.startTime || 'TBD',
      endTime: e.endTime || 'TBD',
      venue: e.venue || 'Campus Hall',
      totalMarks: e.totalMarks,
    }));
  } catch (e) {
    console.error('Error fetching exams for AI context:', e.message);
  }

  // 4. Open Placements
  let openPlacements = [];
  try {
    const placements = await Placement.find({ status: 'open', lastDateToApply: { $gte: new Date() } })
      .sort({ lastDateToApply: 1 })
      .limit(5)
      .lean();
    openPlacements = placements.map((p) => ({
      company: p.company,
      role: p.role,
      type: p.type,
      ctc: p.ctc,
      lastDateToApply: p.lastDateToApply ? new Date(p.lastDateToApply).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
    }));
  } catch (e) {
    console.error('Error fetching placements for AI context:', e.message);
  }

  return {
    student: {
      name: studentUser.name,
      email: studentUser.email,
      department: studentUser.department || 'General',
      year: studentUser.year || 1,
      semester: studentUser.semester || 1,
      enrollmentNumber: studentUser.rollNumber || studentUser.enrollmentNumber || 'N/A',
    },
    attendance: attendanceSummary,
    pendingAssignments,
    upcomingExams,
    openPlacements,
  };
};

/**
 * Fallback AI response generator grounded in real MongoDB student data
 */
const generateLocalAcademicResponse = (userMessage, context) => {
  const { student, attendance, pendingAssignments, upcomingExams, openPlacements } = context;
  const msgLower = userMessage.toLowerCase();

  const lowAttendance = attendance.filter((a) => a.percentage < 75);
  const avgAttendance = attendance.length
    ? Math.round(attendance.reduce((acc, a) => acc + a.percentage, 0) / attendance.length)
    : 85;

  let response = `### 🎓 Academic Advisor Insights for ${student.name} (${student.department} - Year ${student.year}, Sem ${student.semester})\n\n`;

  if (msgLower.includes('focus') || msgLower.includes('week') || msgLower.includes('today') || msgLower.includes('priority')) {
    response += `Here is your prioritized academic action plan for this week based on your live records:\n\n`;
    
    if (lowAttendance.length > 0) {
      response += `🚨 **Attendance Alert (Critical Focus)**:\n`;
      lowAttendance.forEach((a) => {
        response += `- **${a.subject}**: Currently at **${a.percentage}%** (below the 75% mandatory threshold). Attend all upcoming lectures in this course to avoid exam debarment.\n`;
      });
      response += `\n`;
    }

    if (pendingAssignments.length > 0) {
      response += `📝 **Pending Assignment Deadlines**:\n`;
      pendingAssignments.forEach((a) => {
        response += `- **${a.title}** (${a.subject}) — Due: **${a.dueDate}** [${a.totalMarks} Marks]\n`;
      });
      response += `\n`;
    } else {
      response += `✅ **Assignments**: You're all caught up! No pending assignments due immediately.\n\n`;
    }

    if (upcomingExams.length > 0) {
      response += `📅 **Upcoming Examination Milestones**:\n`;
      upcomingExams.forEach((e) => {
        response += `- **${e.title}** (${e.subject}) on **${e.date}** at ${e.venue} (${e.startTime} - ${e.endTime})\n`;
      });
      response += `\n`;
    }

    response += `💡 **Recommended Weekly Strategy**:\n1. Dedicate the first 2 hours of your study block to finishing assignments due soonest.\n2. Create concise flashcards for your upcoming ${upcomingExams[0]?.subject || 'core subjects'} exam.\n3. Keep your attendance strictly above 75% across all modules.`;
  } else if (msgLower.includes('attendance') || msgLower.includes('shortage') || msgLower.includes('bunk') || msgLower.includes('classes')) {
    response += `📊 **Your Live Attendance Breakdown** (Overall Average: **${avgAttendance}%**):\n\n`;
    if (attendance.length === 0) {
      response += `No attendance records logged yet for your registered subjects.\n`;
    } else {
      attendance.forEach((a) => {
        const badge = a.percentage >= 75 ? '🟢 Good' : '🔴 At Risk (<75%)';
        response += `- **${a.subject}** (${a.subjectCode || 'N/A'}): **${a.percentage}%** (${a.present}/${a.total} classes attended) — ${badge}\n`;
      });
    }

    if (lowAttendance.length > 0) {
      response += `\n⚠️ **Action Required**: You have **${lowAttendance.length}** subject(s) with low attendance. Make sure to attend the next 3-4 consecutive lectures to restore your percentage above 75%.`;
    } else {
      response += `\n✨ Great job! You are maintaining healthy attendance across all enrolled courses.`;
    }
  } else if (msgLower.includes('exam') || msgLower.includes('test') || msgLower.includes('midterm') || msgLower.includes('marks')) {
    response += `📖 **Upcoming Exams Schedule**:\n\n`;
    if (upcomingExams.length === 0) {
      response += `There are no scheduled upcoming examinations for your department right now. Take this time to strengthen conceptual fundamentals!\n`;
    } else {
      upcomingExams.forEach((e) => {
        response += `### 📌 ${e.title} — ${e.subject}\n- **Date & Time:** ${e.date} (${e.startTime} - ${e.endTime})\n- **Venue:** ${e.venue}\n- **Format:** ${e.examType.toUpperCase()} (Total Marks: ${e.totalMarks})\n\n`;
      });
    }
  } else if (msgLower.includes('placement') || msgLower.includes('job') || msgLower.includes('internship') || msgLower.includes('career')) {
    response += `💼 **Active Placement Drives & Internships**:\n\n`;
    if (openPlacements.length === 0) {
      response += `No open placement drives currently accepting applications. Check the Placements tab for upcoming campus drives!\n`;
    } else {
      openPlacements.forEach((p) => {
        response += `- **${p.company}** — Role: **${p.role}** (${p.type}) | Package: **${p.ctc || 'Competitive'}** | Deadline: **${p.lastDateToApply}**\n`;
      });
      response += `\n🎯 **Preparation Tip**: Review core Data Structures & Algorithms, OOP principles, and revise your university project portfolios before upcoming screening rounds.`;
    }
  } else {
    response += `I analyzed your active university profile in **${student.department}** (Year ${student.year}, Semester ${student.semester}).\n\n`;
    response += `**Current Snapshot:**\n`;
    response += `- 📊 **Overall Attendance:** ${avgAttendance}% (${lowAttendance.length > 0 ? `${lowAttendance.length} subject(s) at risk` : 'All subjects safe'})\n`;
    response += `- 📝 **Pending Assignments:** ${pendingAssignments.length} task(s) to submit\n`;
    response += `- 📅 **Upcoming Exams:** ${upcomingExams.length} exam(s) scheduled\n`;
    response += `- 💼 **Open Placements:** ${openPlacements.length} active campus drives\n\n`;
    response += `Feel free to ask me:\n- *"What should I study for my upcoming ${upcomingExams[0]?.subject || 'exams'}?"*\n- *"How can I improve my attendance in ${lowAttendance[0]?.subject || 'low subjects'}?"*\n- *"Generate a 7-day study timetable for me"*\n- *"Help me prepare for campus placements"*`;
  }

  return response;
};

// @desc    Contextual Chat Assistant (Grounded in MongoDB student data)
// @route   POST /api/ai/chat
// @access  Private
exports.chatAssistant = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // 1. Fetch real student academic context from MongoDB
    const context = await getStudentAcademicContext(req.user);

    // 2. Prepare system prompt with injected context
    const systemPrompt = `You are UniSphere AI, the dedicated, intelligent academic mentor and university assistant for UniSphere Super-App.
You are assisting ${context.student.name}, enrolled in ${context.student.department}, Year ${context.student.year}, Semester ${context.student.semester} (Enrollment: ${context.student.enrollmentNumber}).

Here is the student's REAL-TIME, LIVE ACADEMIC RECORD directly from the university database:
==================================================
1. ATTENDANCE METRICS:
${context.attendance.length ? context.attendance.map((a) => `- ${a.subject} (${a.subjectCode || 'Code N/A'}): ${a.percentage}% (${a.present}/${a.total} attended). Alert: ${a.percentage < 75 ? 'BELOW 75% MINIMUM THRESHOLD - CRITICAL RISK' : 'Safe'}`).join('\n') : 'No attendance logged yet.'}

2. PENDING ASSIGNMENTS (Not yet submitted):
${context.pendingAssignments.length ? context.pendingAssignments.map((a) => `- ${a.title} [${a.subject}], Due: ${a.dueDate}, Total Marks: ${a.totalMarks}`).join('\n') : 'No pending assignments.'}

3. UPCOMING EXAMS:
${context.upcomingExams.length ? context.upcomingExams.map((e) => `- ${e.title} [${e.subject}], Date: ${e.date} (${e.startTime} - ${e.endTime}), Venue: ${e.venue}, Type: ${e.examType}`).join('\n') : 'No scheduled exams.'}

4. ACTIVE CAMPUS PLACEMENT DRIVES:
${context.openPlacements.length ? context.openPlacements.map((p) => `- ${p.company} (${p.role}, ${p.type}), Package: ${p.ctc || 'Competitive'}, Apply by: ${p.lastDateToApply}`).join('\n') : 'No open drives.'}
==================================================

INSTRUCTIONS:
1. Always ground your responses in this specific student's actual assignments, exams, and attendance numbers.
2. If they ask "What should I focus on this week?", refer specifically to their earliest due assignments, nearest exams, and any subjects where attendance is below 75%.
3. Use clean markdown (headings, bold text, bullet points) with an encouraging, professional academic tone.
4. Keep answers concise, actionable, and structured.`;

    const messages = [];
    if (Array.isArray(conversationHistory)) {
      conversationHistory.slice(-6).forEach((msg) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }
    messages.push({ role: 'user', content: message });

    // Call LLM (Groq or Claude)
    const llmReply = await generateLLMCompletion({
      systemPrompt,
      messages,
      maxTokens: 1200,
    });

    const finalReply = llmReply || generateLocalAcademicResponse(message, context);

    return res.json({
      reply: finalReply,
      groundedContext: {
        attendanceAverage: context.attendance.length
          ? Math.round(context.attendance.reduce((a, b) => a + b.percentage, 0) / context.attendance.length)
          : 85,
        pendingAssignmentsCount: context.pendingAssignments.length,
        upcomingExamsCount: context.upcomingExams.length,
      },
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Failed to process AI chat query', error: error.message });
  }
};

// @desc    Document Summarizer (PDF / Text file or raw text input)
// @route   POST /api/ai/summarize
// @access  Private
exports.summarizeDocument = async (req, res) => {
  try {
    let rawText = req.body.text || '';
    let documentTitle = req.body.title || 'Course Material';

    // 1. If file was uploaded
    if (req.file) {
      documentTitle = req.file.originalname;
      if (req.file.mimetype === 'application/pdf') {
        const fileBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(fileBuffer);
        rawText = pdfData.text;
      } else {
        rawText = fs.readFileSync(req.file.path, 'utf8');
      }

      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {}
    } else if (req.body.materialId) {
      const material = await CourseMaterial.findById(req.body.materialId);
      if (material) {
        documentTitle = material.title;
        rawText = material.description || '';
        if (material.fileUrl && fs.existsSync(material.fileUrl)) {
          if (material.fileType === 'pdf' || material.fileUrl.endsWith('.pdf')) {
            const buf = fs.readFileSync(material.fileUrl);
            const pdfData = await pdfParse(buf);
            rawText += '\n' + pdfData.text;
          }
        }
      }
    }

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({ message: 'Insufficient document text provided for summarization (minimum 20 characters required).' });
    }

    const truncatedText = rawText.slice(0, 30000);
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;

    const summaryPrompt = `Analyze the following academic study material / lecture note titled "${documentTitle}" and produce a high-yield, beautifully structured academic summary.

Output format should strictly include:
1. 📌 **Executive Overview** (2-3 concise sentences summarizing the core topic).
2. 🔑 **Key Concepts & Definitions** (Bullet points with bold terms and clear explanations).
3. 📐 **Core Principles, Formulas, or Algorithms** (Essential technical rules, theorems, or step-by-step mechanisms).
4. 🎯 **High-Yield Exam Takeaways & Probable Questions** (3-5 questions professors frequently ask from this topic).
5. ⚡ **Quick Revision Cheat Sheet** (3-4 bullet point key takeaways for fast review).

Material Content:
---
${truncatedText}
---`;

    let summaryResult = await generateLLMCompletion({
      userPrompt: summaryPrompt,
      maxTokens: 1500,
    });

    if (!summaryResult) {
      const previewLines = truncatedText.split('\n').filter((l) => l.trim().length > 10).slice(0, 8);
      summaryResult = `### 📌 Executive Overview
This document covers fundamental concepts of **${documentTitle}**, focusing on key structural principles, methodologies, and core academic theory.

### 🔑 Key Concepts & Definitions
${previewLines.slice(0, 4).map((line, idx) => `- **Concept ${idx + 1}**: ${line.trim().slice(0, 140)}...`).join('\n')}

### 📐 Core Principles & Methodologies
- **Systematic Implementation**: Follow standard protocols for problem analysis and execution.
- **Verification & Testing**: Validate edge cases and confirm expected theoretical outputs.
- **Optimization**: Prioritize time complexity, modularity, and maintainable design patterns.

### 🎯 High-Yield Exam Takeaways & Probable Questions
- *Q1: What are the fundamental trade-offs involved in this topic?*
- *Q2: Explain the primary architectural layers or mathematical definitions presented.*
- *Q3: How do you handle common error cases or boundary conditions?*

### ⚡ Quick Revision Cheat Sheet
- Understand the core terminology and standard definitions.
- Memorize key formulas and operational steps.
- Practice solving sample past-year exam problems on this topic.`;
    }

    return res.json({
      title: documentTitle,
      wordCount,
      summary: summaryResult,
    });
  } catch (error) {
    console.error('Document Summarizer Error:', error);
    res.status(500).json({ message: 'Failed to summarize document', error: error.message });
  }
};

// @desc    Generate Personalized Study Plan (Based on upcoming exams & assignments)
// @route   POST /api/ai/study-plan
// @access  Private
exports.generateStudyPlan = async (req, res) => {
  try {
    const { days = 7, dailyHours = 4, targetSubject } = req.body;
    const context = await getStudentAcademicContext(req.user);

    const studyPrompt = `Create an actionable, day-by-day, ${days}-day academic study schedule for a university student in ${context.student.department}, Year ${context.student.year}, Semester ${context.student.semester}.
Daily target study time: ${dailyHours} hours/day.

Student Academic Data:
- Upcoming Exams: ${context.upcomingExams.length ? JSON.stringify(context.upcomingExams) : 'Regular semester review'}
- Pending Assignments: ${context.pendingAssignments.length ? JSON.stringify(context.pendingAssignments) : 'All assignments submitted'}
- Low Attendance Subjects requiring revision: ${context.attendance.filter((a) => a.percentage < 75).map((a) => a.subject).join(', ') || 'None'}
${targetSubject ? `- Primary Target Subject requested by student: ${targetSubject}` : ''}

Generate a comprehensive, day-by-day timetable structured as:
For each day (Day 1 to Day ${days}):
- **Subject & Focus Topic**
- **Time Allocation** (e.g. 2 hrs theory + 1 hr problem practice + 1 hr revision)
- **Key Learning Objective**
- **Self-Assessment Checkpoint / Milestone**

End with 3 high-impact study tips (e.g. Pomodoro intervals, active recall, spaced repetition).`;

    let planContent = await generateLLMCompletion({
      userPrompt: studyPrompt,
      maxTokens: 1500,
    });

    if (!planContent) {
      const targetSub = targetSubject || context.upcomingExams[0]?.subject || 'Core Engineering / Computer Science';
      planContent = `### 📅 ${days}-Day High-Performance Study Plan (${dailyHours} Hours / Day)
**Student:** ${context.student.name} | **Major:** ${context.student.department}

---

${Array.from({ length: days }).map((_, i) => {
  const dayNum = i + 1;
  const examFocus = context.upcomingExams[i % (context.upcomingExams.length || 1)]?.subject || targetSub;
  const assignFocus = context.pendingAssignments[i % (context.pendingAssignments.length || 1)]?.title || 'Lecture Revision';
  
  return `#### 🗓️ Day ${dayNum}: ${examFocus} & Core Fundamentals
- **Session 1 (${Math.round(dailyHours * 0.5)} hrs)**: Deep conceptual review of ${examFocus} key modules.
- **Session 2 (${Math.round(dailyHours * 0.3)} hrs)**: Assignment work: *${assignFocus}* & numerical practice.
- **Session 3 (${Math.round(dailyHours * 0.2)} hrs)**: Active recall flashcards & previous-year question paper review.
- 🎯 **Daily Milestone**: Complete 15 practice questions and summarize key definitions in your notes.`;
}).join('\n\n')}

---

### 💡 High-Yield Productivity Guidelines:
1. **50/10 Pomodoro Technique**: 50 minutes of deep, uninterrupted focus followed by a 10-minute movement break.
2. **Active Recall**: Test yourself with closed-book quizzes rather than passive re-reading.
3. **Daily Reflection**: Spend the last 15 minutes reviewing today's formula sheet before sleeping.`;
    }

    return res.json({
      days,
      dailyHours,
      studyPlan: planContent,
    });
  } catch (error) {
    console.error('Study Plan Error:', error);
    res.status(500).json({ message: 'Failed to generate study plan', error: error.message });
  }
};

// @desc    Placement & Internship Prep Helper
// @route   POST /api/ai/placement-prep
// @access  Private
exports.placementPrep = async (req, res) => {
  try {
    const { placementId, company, role, skills = [] } = req.body;

    let targetCompany = company || 'Top Tech Company';
    let targetRole = role || 'Software Development Engineer / Analyst';
    let targetSkills = Array.isArray(skills) ? skills.join(', ') : skills || 'Data Structures, Algorithms, System Design, SQL, OOP';
    let ctc = '';
    let jobDescription = '';

    if (placementId) {
      const placement = await Placement.findById(placementId);
      if (placement) {
        targetCompany = placement.company;
        targetRole = placement.role;
        ctc = placement.ctc || '';
        jobDescription = placement.description || '';
        if (placement.tags && placement.tags.length) {
          targetSkills = placement.tags.join(', ');
        }
      }
    }

    const prepPrompt = `You are an elite campus placement coach. Create a comprehensive, role-specific interview preparation roadmap for:
- Company: ${targetCompany}
- Target Role: ${targetRole}
- Required Skills / Stack: ${targetSkills}
${ctc ? `- Compensation: ${ctc}` : ''}
${jobDescription ? `- Job Description / Criteria: ${jobDescription}` : ''}

Generate a clear, high-value guide with:
1. 🏢 **Company & Role Analysis** (What recruiters look for in this role).
2. 💻 **Core Technical Topics to Master** (Data structures, system architecture, core domain algorithms).
3. ❓ **Top 5 High-Probability Interview Questions** with bulleted sample answering frameworks.
4. 🤝 **Behavioral & HR Round Questions** (Using the STAR method: Situation, Task, Action, Result).
5. 📋 **7-Day Sprint Checklist** (Day-by-day action items leading up to the interview).
6. 🔗 **Recommended Practice Resources & Mock Strategies**.`;

    let prepGuide = await generateLLMCompletion({
      userPrompt: prepPrompt,
      maxTokens: 1600,
    });

    if (!prepGuide) {
      prepGuide = `### 🏢 Preparation Guide for ${targetCompany} — ${targetRole}
${ctc ? `**Package:** ${ctc} | ` : ''}**Key Focus Skills:** ${targetSkills}

---

### 💻 Core Technical Competencies to Master:
1. **Data Structures & Algorithms**:
   - Arrays, HashMaps, Sliding Window, Two Pointers
   - Trees & Graphs (BFS/DFS, Topological Sort, Shortest Path)
   - Dynamic Programming (Knapsack, Subsequence problems)
2. **Core CS Fundamentals**:
   - **DBMS / SQL**: Normalization, Indexing (B-Trees), ACID properties, Complex JOIN queries.
   - **Operating Systems**: Processes vs Threads, Deadlocks, Virtual Memory, CPU Scheduling.
   - **OOP & System Design**: Solid Principles, Design Patterns (Factory, Singleton), REST API design.

---

### ❓ Top 5 High-Probability Interview Questions:
1. **Technical Problem Solving**: *"How would you design an efficient caching mechanism with LRU eviction?"*
   - *Framework:* Explain HashMap + Doubly Linked List approach ($O(1)$ get & put).
2. **System Scalability**: *"Explain how database indexing speeds up queries and what the write penalty is."*
   - *Framework:* Discuss B+ Tree index traversal vs disk I/O cost during INSERT/UPDATE.
3. **Debugging & Architecture**: *"Walk us through the architectural flow of how an HTTP request travels from browser to database in a full-stack MERN app."*
4. **Behavioral (STAR)**: *"Tell me about a challenging technical project you built, an unexpected bug you encountered, and how you solved it."*
5. **Role Motivation**: *"Why do you want to join ${targetCompany} as a ${targetRole}?"*

---

### 📋 7-Day Sprint Checklist:
- [ ] **Day 1-2**: Solve 10 LeetCode Medium problems (Arrays, Trees, Graphs).
- [ ] **Day 3**: Revise DBMS SQL queries and Operating Systems core concepts.
- [ ] **Day 4**: Prepare in-depth walkthroughs of your top 2 university projects.
- [ ] **Day 5**: Practice 3 mock interviews with peer feedback.
- [ ] **Day 6**: Revise company profile, recent news, and values of ${targetCompany}.
- [ ] **Day 7**: Light revision of formulas, take adequate rest, and test audio/video/setup.`;
    }

    return res.json({
      company: targetCompany,
      role: targetRole,
      skills: targetSkills,
      prepGuide,
    });
  } catch (error) {
    console.error('Placement Prep Error:', error);
    res.status(500).json({ message: 'Failed to generate placement prep guide', error: error.message });
  }
};
