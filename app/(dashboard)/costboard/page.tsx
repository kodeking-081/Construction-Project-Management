// File: app/costboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Project {
  id: number;
  title: string;
}

interface SubProject {
  id: string;
  name: string;
}

interface CostItem {
  id: string;
  itemName: string;
  floorPhase?: string;
  estimatedCost: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'OnHold' | 'Cancelled';
  category: { name: string };
  contractor?: string;
  date?: string;
  project: { title: string };
  subproject?: { name: string } | null;
}

export default function CostBoardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const initialProjectId = searchParams.get('projectId') || searchParams.get('project') || '';
  const initialSubProjectId = searchParams.get('subprojectId') || searchParams.get('subproject') || '';
  const [selectedProject, setSelectedProject] = useState(initialProjectId);
  const [selectedSubProject, setSelectedSubProject] = useState(initialSubProjectId);
  const [costs, setCosts] = useState<CostItem[]>([]);
  const limit = 10;
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        console.log('🔎 /api/me response:', JSON.stringify(data, null, 2));
      })
      .catch(err => {
        console.error('❌ Failed to fetch user info:', err);
      });
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();

      if (Array.isArray(data.projects)) {
        setProjects(data.projects);
      } else {
        console.warn('Projects data is not an array:', data.projects);
        setProjects([]);
      }
    } catch (err) {
      console.error('Failed to load project list', err);
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const fetchCosts = useCallback(async (projectId: number, subprojectId: string) => {
    try {
      const url = `/api/costboard?projectId=${projectId}&subprojectId=${subprojectId}&page=1&limit=${limit}`;
      const res = await fetch(url);
      const data = await res.json();

      setCosts(data.items);
    } catch (err) {
      console.error('Failed to load cost data', err);
    }
  }, []);

  useEffect(() => {
    const projId = searchParams.get('projectId') || searchParams.get('project');
    const subId = searchParams.get('subprojectId') || searchParams.get('subproject');
    if (projId) setSelectedProject(projId);
    if (subId) setSelectedSubProject(subId);
  }, [searchParams]);

  useEffect(() => {
    if (selectedProject) {
      fetch(`/api/subprojects?projectId=${selectedProject}`)
        .then((res) => res.json())
        .then((data) => setSubProjects(data.subprojects || []));
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && selectedSubProject) {
      fetchCosts(Number(selectedProject), selectedSubProject);
    } else {
      setCosts([]);
    }
  }, [selectedProject, selectedSubProject, fetchCosts]);

  const selectedProjectData = Array.isArray(projects)
    ? projects.find((p) => p.id === Number(selectedProject))
    : null;

  const selectedSubProjectData = subProjects.find((s) => s.id === selectedSubProject);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setSelectedProject(String(value));
    setSelectedSubProject('');
    router.replace(`/costboard?projectId=${value}`);
  };

  const handleSubProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSubProject(value);
    router.replace(`/costboard?projectId=${selectedProject}&subprojectId=${value}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this cost entry?')) {
      try {
        const res = await fetch(`/api/costboard/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');

        setCosts((prev) => prev.filter((item) => item.id !== id));
        setSuccessMessage('✅ Cost entry deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 2000);
      } catch {
        alert('❌ Something went wrong while deleting.');
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-b from-white to-gray-100 text-gray-900 min-h-screen">

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Cost Board</h1>
        {successMessage && (
          <div className="mb-4 p-3 rounded text-green-800 bg-green-100 border border-green-300 transition-all duration-300">
            {successMessage}
          </div>
        )}
        <div className="flex flex-wrap justify-between gap-4 mb-6 items-end">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <select
              onChange={handleProjectChange}
              value={selectedProject ?? ''}
              className="px-4 py-2 border border-gray-300 rounded-md w-full sm:w-auto shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Project</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>{proj.title}</option>
              ))}
            </select>

            <select
              onChange={handleSubProjectChange}
              value={selectedSubProject ?? ''}
              className="px-4 py-2 border border-gray-300 rounded-md w-full sm:w-auto shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={!selectedProject}
            >
              <option value="">Select Subproject</option>
              {subProjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {selectedProject && selectedSubProject && (
              <Link
                href={`/costboard/add?projectId=${selectedProject}&subprojectId=${selectedSubProject ?? ''}`}
                className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-md hover:from-green-500 hover:to-green-700 w-full sm:w-auto text-center shadow-lg transition-all duration-200"
              >
                Add Cost Entry
              </Link>
            )}
          </div>
        </div>


        {selectedProjectData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-gray-200 p-4 rounded-lg shadow-md"
          >
            <p className="text-lg font-medium">
              Cost Breakdown for: <span className="text-yellow-500 font-semibold">{selectedProjectData.title}</span>
            </p>
            <p className="text-sm text-gray-500">Project ID: {selectedProjectData.id}</p>
            {selectedSubProjectData && (
              <p className="text-sm text-gray-500">Subproject: {selectedSubProjectData.name}</p>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Modern Stylish Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="overflow-x-auto rounded-lg shadow-md bg-white">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase bg-gray-200 text-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">S.N</th>
              <th scope="col" className="px-6 py-3">Floor/Phase</th>
              <th scope="col" className="px-6 py-3">Item Name</th>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3">Cost</th>
              <th scope="col" className="px-6 py-3">Contractor</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((cost, index) => (
              <tr key={cost.id} className="bg-white border-b hover:bg-gray-50 transition-all">
                <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                <td className="px-6 py-4">{cost.floorPhase ?? '—'}</td>
                <td className="px-6 py-4">{cost.itemName}</td>
                <td className="px-6 py-4">{cost.category.name}</td>
                <td className="px-6 py-4">{cost.estimatedCost.toFixed(2)}</td>
                <td className="px-6 py-4">{cost.contractor ?? '—'}</td>
                <td className="px-6 py-4">{cost.date ? new Date(cost.date).toLocaleDateString() : '—'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    cost.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    cost.status === 'Paid' ? 'bg-blue-100 text-blue-700' :
                    cost.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    cost.status === 'OnHold' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {cost.status}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button className="text-blue-600 hover:text-blue-800" onClick={() => router.push(`/costboard/edit/${cost.id}`)}>
                    <Pencil size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(cost.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
    );
}