import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', rollNumber: '', department: '', batchYear: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      if (data.user.role === 'student') navigate('/student');
      else if (data.user.role === 'guide') navigate('/guide');
      else navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-primary-900/20 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <img src="/projecticon.png" alt="EduTrack" className="h-12 w-12 rounded-lg" />
            <h1 className="font-display text-4xl font-bold text-white tracking-tight">EduTrack</h1>
          </div>
          <p className="text-slate-400">Create your account</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-primary-500">
                <option value="student">Student</option>
                <option value="guide">Guide</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {(form.role === 'student' || form.role === 'guide') && (
              <>
                {form.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Roll Number</label>
                    <input name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="e.g. CSE23MCA001" required className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-primary-500" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                  <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. CSE" className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-primary-500" />
                </div>
                {form.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Batch Year</label>
                    <input name="batchYear" value={form.batchYear} onChange={handleChange} placeholder="e.g. 2023" className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-primary-500" />
                  </div>
                )}
              </>
            )}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition disabled:opacity-50">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          <p className="mt-6 text-center text-slate-400 text-sm">
            Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
