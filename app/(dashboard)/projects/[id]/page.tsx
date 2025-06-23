'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SubProject {
  id: string;
  name: string;
  createdAt: string;
}

interface Milestone {
  id: number;
  title: string;
  dueDate: string;
  status: string;
}

interface Project {
  id: number;
  title: string;
  location: string;
  startDate: string;
  expectedEndDate: string;
  budget: number;
  image: string;
  subprojects: SubProject[];
  milestones: Milestone[];
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [subForm, setSubForm] = useState({ name: '', createdAt: '' });
  const [milestoneForm, setMilestoneForm] = useState({ title: '', dueDate: '', status: 'UPCOMING' });
  const [role, setRole] = useState('');
  const router = useRouter();


  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => setRole(data.role))
      .catch((err) => console.error('Failed to fetch user role:', err));
  }, []);



  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      setProject(data);
    } catch (err) {
      console.error('Failed to fetch project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const handleAddSubProject = async () => {
    const res = await fetch('/api/subprojects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...subForm, projectId: Number(id) }),
    });
    if (res.ok) {
      setShowSubModal(false);
      setSubForm({ name: '', createdAt: '' });
      fetchProject();
    }
  };

  const handleAddMilestone = async () => {
    const res = await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...milestoneForm, projectId: Number(id) }),
    });
    if (res.ok) {
      setShowMilestoneModal(false);
      setMilestoneForm({ title: '', dueDate: '', status: 'UPCOMING' });
      fetchProject();
    }
  };

  const updateMilestoneStatus = async (milestoneId: number, status: string) => {
    const res = await fetch(`/api/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchProject();
  };

  if (loading) return <div className="p-6 text-lg animate-pulse">Loading project details...</div>;
  if (!project) return <div className="p-6 text-red-500">Project not found</div>;

  return (
    <div className="p-6 space-y-10 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row gap-6"
      >
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{project.title}</h1>
          <p className="text-gray-600 mb-1">{project.location}</p>
          <p className="text-sm text-gray-500">
            {new Date(project.startDate).toLocaleDateString()} → {new Date(project.expectedEndDate).toLocaleDateString()}
          </p>
          <p className="text-xl font-semibold text-green-700 mt-4">Budget: ${project.budget.toLocaleString()}</p>
        </div>
        <div className="rounded-xl overflow-hidden w-full md:w-64 h-40">
          <img src={project.image} alt="Project" width={300} height={160} className="object-cover h-full w-full" />
        </div>
      </motion.div>

      {/* Subprojects */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-semibold text-gray-800">Subprojects</h2>
          <button onClick={() => setShowSubModal(true)} className="text-blue-600 hover:underline font-medium">
            + Add Subproject
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.subprojects.map((sub) => (
            <motion.div
              key={sub.id}
              whileHover={{ scale: 1.03 }}
              onClick={() => {
                if (role.toUpperCase() === 'ADMIN') {
                  router.push(`/costboard?project=${project.id}&subproject=${sub.id}`);
                } else {
                  alert('Create Material requirements and redirect'); // or open a modal, or do nothing
                }
              }}
              className="p-4 bg-white rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg"
            >
              <h3 className="font-bold text-lg text-gray-700">{sub.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Created: {new Date(sub.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))}

        </div>
      </motion.div>

      {/* Milestones */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-semibold text-gray-800">Milestones</h2>
          <button onClick={() => setShowMilestoneModal(true)} className="text-blue-600 hover:underline font-medium">
            + Add Milestone
          </button>
        </div>
        <div className="space-y-3">
          {project.milestones.map((m) => (
            <motion.div
              key={m.id}
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm"
            >
              <div>
                <p className="font-medium text-gray-700">{m.title}</p>
                <p className="text-sm text-gray-500">Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Status: {m.status}</p>
              </div>
              <select
                value={m.status}
                onChange={(e) => updateMilestoneStatus(m.id, e.target.value)}
                className="border rounded p-1 text-sm"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modals */}
      {showSubModal && (
        <Modal onClose={() => setShowSubModal(false)} title="Add Subproject">
          <input
            type="text"
            placeholder="Name"
            value={subForm.name}
            onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
            className="w-full border p-2 mb-2 rounded"
          />
          <input
            type="date"
            value={subForm.createdAt}
            onChange={(e) => setSubForm({ ...subForm, createdAt: e.target.value })}
            className="w-full border p-2 mb-2 rounded"
          />
          <ActionButtons onSubmit={handleAddSubProject} onCancel={() => setShowSubModal(false)} />
        </Modal>
      )}

      {showMilestoneModal && (
        <Modal onClose={() => setShowMilestoneModal(false)} title="Add Milestone">
          <input
            type="text"
            placeholder="Title"
            value={milestoneForm.title}
            onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
            className="w-full border p-2 mb-2 rounded"
          />
          <input
            type="date"
            value={milestoneForm.dueDate}
            onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
            className="w-full border p-2 mb-2 rounded"
          />
          <select
            value={milestoneForm.status}
            onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
            className="w-full border p-2 mb-2 rounded"
          >
            <option value="UPCOMING">Upcoming</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <ActionButtons onSubmit={handleAddMilestone} onCancel={() => setShowMilestoneModal(false)} />
        </Modal>
      )}
    </div>
  );
}

// Modal Component
function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        {children}
      </motion.div>
    </motion.div>
  );
}

// Buttons Component
function ActionButtons({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2 mt-4">
      <button onClick={onSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        Submit
      </button>
      <button onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition">
        Cancel
      </button>
    </div>
  );
}
