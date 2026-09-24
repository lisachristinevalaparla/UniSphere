import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Download, Search, Trash2 } from 'lucide-react';
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

const typeColors = {
  lecture_notes: 'badge-indigo', assignment_doc: 'badge-yellow', reference: 'badge-cyan',
  lab_manual: 'badge-green', previous_paper: 'badge-blue', other: 'badge-gray',
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
      setMaterials(res.data.materials);
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
      toast.success('Material uploaded!');
      setUploadOpen(false);
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setSubmitting(false);
  };

  const downloadMaterial = async (m) => {
    try {
      const res = await api.get(`/materials/${m._id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = m.file?.originalName || m.title;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  const deleteMaterial = async (id) => {
    if (!confirm('Delete this material?')) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success('Deleted');
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const fileIcon = (mime) => {
    if (mime?.includes('pdf')) return '📄';
    if (mime?.includes('presentation') || mime?.includes('powerpoint')) return '📊';
    if (mime?.includes('word') || mime?.includes('document')) return '📝';
    if (mime?.includes('image')) return '🖼️';
    return '📁';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="page-title">Course Materials</h1>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                className="input-field pl-9 py-2 w-52"
                placeholder="Search subject…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
          {user?.role !== 'student' && (
            <button onClick={() => setUploadOpen(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload
            </button>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((m) => (
          <motion.div
            key={m._id}
            className="glass-card p-5 flex flex-col gap-3 group"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl flex-shrink-0">{fileIcon(m.file?.mimetype)}</div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-sm truncate">{m.title}</h3>
                <p className="text-xs text-slate-400">{m.subject} {m.subjectCode ? `· ${m.subjectCode}` : ''}</p>
              </div>
            </div>
            {m.description && <p className="text-xs text-slate-400 line-clamp-2">{m.description}</p>}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${typeColors[m.type] || 'badge-gray'}`}>
                {m.type?.replace('_', ' ')}
              </span>
              {m.tags?.map((t) => <span key={t} className="badge badge-gray">{t}</span>)}
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
              <div className="text-[10px] text-slate-500">
                {formatSize(m.file?.size)} · {m.downloadCount} downloads
              </div>
              <div className="flex gap-2">
                {user?.role !== 'student' && (
                  <button
                    onClick={() => deleteMaterial(m._id)}
                    className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => downloadMaterial(m)}
                  className="flex items-center gap-1.5 btn-primary text-xs px-3 py-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {materials.length === 0 && (
          <div className="glass-card p-12 text-center col-span-3">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No materials found</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Material" size="md">
        <form onSubmit={uploadMaterial} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <input className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['lecture_notes','assignment_doc','reference','lab_manual','previous_paper','other'].map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input-field" placeholder="unit1, important" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div>
            <label className="label">File</label>
            <input
              type="file"
              className="input-field py-2 text-slate-300 cursor-pointer"
              accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.png,.jpg"
              onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setUploadOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialsPage;
