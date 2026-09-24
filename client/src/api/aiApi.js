import api from './axios';

export const aiApi = {
  // Contextual Chat
  chat: (message, conversationHistory = []) =>
    api.post('/ai/chat', { message, conversationHistory }),

  // Document Summarizer (supports FormData for files or JSON for text/materialId)
  summarize: (data, isFormData = false) =>
    api.post('/ai/summarize', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),

  // Study Plan Generator
  generateStudyPlan: (params) =>
    api.post('/ai/study-plan', params),

  // Placement Prep Helper
  placementPrep: (params) =>
    api.post('/ai/placement-prep', params),
};

export default aiApi;
