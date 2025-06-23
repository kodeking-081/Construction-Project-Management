// File: app/(dashboard)/projects/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Project {
  id: number;
  title: string;
  location: string;
  startDate: string;
  expectedEndDate: string;
  budget: number;
  image: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  const fetchProjects = async (pageNumber: number = 1) => {
    try {
      const res = await fetch(`/api/projects?page=${pageNumber}`);
      const data = await res.json();

      setProjects(data.projects);
      if (data.totalPages) setTotalPages(data.totalPages);
      if (page !== pageNumber) setPage(pageNumber); // ✅ only set if changed
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRole = async () => {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      setRole(data.role);
    } catch (err) {
      console.error('Failed to fetch user role:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const res = await fetch(`/api/projects?page=1`);
        const data = await res.json();
        if (isMounted) {
          setProjects(data.projects);
          setTotalPages(data.totalPages || 1);
          setPage(1);
        }
      } catch (err) {
        console.error('Initial fetch failed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const getUserRole = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (isMounted) setRole(data.role);
      } catch (err) {
        console.error('Failed to fetch role:', err);
      }
    };

    initialize();
    getUserRole();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-white">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">All Projects</h1>
          <p className="text-sm text-gray-600">List of registered projects</p>
        </div>
        {role === 'ADMIN' && (
          <button
            onClick={() => router.push('/projects/add')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
          >
            ➕ Add New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading projects...</div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white shadow-md rounded-lg p-5 border border-gray-200 hover:shadow-lg transition"
              >
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{project.title}</h2>
                <p className="text-sm text-gray-600 mb-1">📍 {project.location}</p>
                <p className="text-sm text-gray-600 mb-1">
                  📅 {new Date(project.startDate).toLocaleDateString()} →{' '}
                  {new Date(project.expectedEndDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  💰 Budget: ${project.budget.toLocaleString()}
                </p>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  disabled={page === i + 1}
                  className={`px-4 py-2 rounded border ${
                    page === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => fetchProjects(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}