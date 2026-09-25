import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Download, Search, Trash2, ArrowUpRight } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const MaterialsPage = () => {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', subject: '', subjectCode: '',
    type: 'lecture_notes', tags: '', file: null,
  });

  const fetchMaterials = async (subjectQ = '') => {
    try {
      const url = subjectQ ? `/materials?subject=${encodeURIComponent(subjectQ)}&limit=40` : '/materials?limit=40';
      const res = await api.get(url);
      setMaterials(res.data.materials || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials(search);
  };

  const uploadMaterial = async (e) => {
    e.preventDefault();
    if (!form.file) return toast.error('Please select a file');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'file' && v) fd.append(k, v); });
      fd.append('file', form.file);
      await api.post('/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Course material uploaded & student notifications dispatched!');
      setUploadOpen(false);
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading material');
    }
    setSubmitting(false);
  };

  const deleteMaterial = async (id) => {
    if (!confirm('Are you sure you want to remove this resource?')) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success('Resource removed');
      fetchMaterials();
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6e9f6] dark:bg-[#1e2027] text-slate-700 dark:text-slate-300 mb-2">
            <span>Academic Resource Library</span>
          </div>
          <h1 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">Course Materials</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Download verified lecture notes, question banks, lab manuals, and syllabus roadmaps.
          </p>
        </div>
        {user?.role !== 'student' && (
          <button onClick={() => setUploadOpen(true)} className="btn-pill-primary text-xs">
            <Plus className="w-4 h-4" />
            <span>Upload Resource</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <button type="submit" className="btn-pill-secondary text-xs px-5">
          Filter
        </button>
      </form>

      {/* Materials Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((m) => (
          <motion.div
            key={m._id}
            className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 flex flex-col justify-between"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <span className="badge-chip capitalize text-[10px]">{m.type?.replace('_', ' ') || 'Notes'}</span>
                <span className="text-[11px] text-slate-400">{formatSize(m.file?.size)}</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-[#111827] dark:text-white line-clamp-1">{m.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{m.subject} {m.subjectCode ? `&bull; ${m.subjectCode}` : ''}</p>
              {m.description && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{m.description}</p>}
            </div>

            <div className="mt-5 pt-4 border-t border-[#e2e5f0] dark:border-[#22242a] flex items-center justify-between">
              <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                By {m.uploadedBy?.name || 'Faculty'}
              </span>
              <div className="flex items-center gap-2">
                {user?.role !== 'student' && (
                  <button
                    onClick={() => deleteMaterial(m._id)}
                    className="p-1.5 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {m.file?.path ? (
                  <a
                    href={`http://localhost:5000/${m.file.path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-pill-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400">Preview</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {materials.length === 0 && (
          <div className="bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-12 text-center col-span-3">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-[#111827] dark:text-white">No course materials found</p>
            <p className="text-xs text-slate-500 mt-1">Try another search filter or ask your department professor.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Course Material" size="md">
        <form onSubmit={uploadMaterial} className="space-y-4 text-left">
          <div>
            <label className="label">Resource Title</label>
            <input className="input-field" placeholder="Unit 4 Concurrency & Deadlocks Notes" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description / Summary</label>
            <textarea className="input-field min-h-[70px] resize-none" placeholder="Covers semaphores, mutex locks, and previous exam questions..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <input className="input-field" placeholder="Operating Systems" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="label">Resource Type</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['lecture_notes', 'assignment_doc', 'reference', 'lab_manual', 'previous_paper', 'other'].map((t) => (
                  <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Select File (PDF, DOCX, ZIP)</label>
            <input
              type="file"
              onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#111827] file:text-white dark:file:bg-white dark:file:text-black cursor-pointer"
              required
            />
          </div>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={() => setUploadOpen(false)} className="btn-pill-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-pill-primary flex-1" disabled={submitting}>
              {submitting ? 'Uploading...' : 'Upload & Notify ↗'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialsPage;
