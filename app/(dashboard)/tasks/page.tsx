//File: app/(dashboard)/tasks/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import debounce from 'lodash.debounce';
import TaskDetailModal from '@/components/TaskDetailModal';

interface Project {
  id: number;
  title: string;
}

interface Subproject {
  id: string;
  name: string;
}

interface User {
  id: number;
  name: string;
}

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'ON_HOLD';
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  project?: { title: string };
  subproject?: { name: string };
  assignedTo?: { name: string };
  dueDate?: string | null;
  isUrgent: boolean;
  priority: Priority;
  creator?: { name: string };
}

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const projectId = searchParams.get('project');
  const subprojectId = searchParams.get('subproject');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [filteredSubprojects, setFilteredSubprojects] = useState<Subproject[]>([]);
  const [searchUserInput, setSearchUserInput] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredAssignedToUsers, setFilteredAssignedToUsers] = useState<User[]>([]);
  const [filteredCreatedByUsers, setFilteredCreatedByUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [subprojects, setSubprojects] = useState<Subproject[]>([]);
  const [projectQuery, setProjectQuery] = useState('');
  const [subprojectQuery, setSubprojectQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [assignedToQuery, setAssignedToQuery] = useState('');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState('');
  const [createdByQuery, setCreatedByQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [showCategory, setShowCategory] = useState<'COMPLETED' | 'ON_HOLD' | 'DELAYED' | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const tasksPerPage = 3;


    const debounceFetchProjects = useCallback(
    debounce((query: string) => {
      fetch(`/api/projects?search=${query}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.projects)) setFilteredProjects(data.projects);
          else setFilteredProjects([]);
        })
        .catch(() => setFilteredProjects([]));
    }, 300),
    []
  );

  const debounceFetchSubprojects = useCallback(
    debounce((query: string, pid: string) => {
      fetch(`/api/subprojects?projectId=${pid}&search=${query}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.subprojects)) setFilteredSubprojects(data.subprojects);
          else setFilteredSubprojects([]);
        })
        .catch(() => setFilteredSubprojects([]));
    }, 300),
    []
  );

  const debounceFetchUsers = useCallback(
    debounce((query: string) => {
      if (query.trim().length <= 1) {
        setFilteredUsers([]);
        return;
      }
      fetch(`/api/users?search=${query}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setFilteredUsers(data);
          else setFilteredUsers([]);
        })
        .catch(() => setFilteredUsers([]));
    }, 400),
    []
  );

  const debounceFetchAssignedToUsers = useCallback(
    debounce((query: string) => {
      if (query.trim().length <= 1) {
        setFilteredAssignedToUsers([]);
        return;
      }
      fetch(`/api/users?search=${query}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setFilteredAssignedToUsers(data);
          else setFilteredAssignedToUsers([]);
        })
        .catch(() => setFilteredAssignedToUsers([]));
    }, 400),
    []
  );

  const debounceFetchCreatedByUsers = useCallback(
    debounce((query: string) => {
      if (query.trim().length <= 1) {
        setFilteredCreatedByUsers([]);
        return;
      }
      fetch(`/api/users?search=${query}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setFilteredCreatedByUsers(data);
          else setFilteredCreatedByUsers([]);
        })
        .catch(() => setFilteredCreatedByUsers([]));
    }, 400),
    []
  );

  useEffect(() => {
    const pid = searchParams.get('project');
    const spid = searchParams.get('subproject');

    const project = projects.find(p => p.id.toString() === pid);
    const subproject = subprojects.find(sp => sp.id === spid);

    if (project) setProjectQuery(project.title);
    if (subproject) setSubprojectQuery(subproject.name);
  }, [searchParams, projects, subprojects]);

  useEffect(() => {
    if (assignedToQuery.trim() === '') setSelectedUser('');
  }, [assignedToQuery]);

  useEffect(() => {
    if (createdByQuery.trim() === '') setSelectedCreatedBy('');
  }, [createdByQuery]);

  useEffect(() => {
    setPage(1);
  }, [selectedUser, selectedCreatedBy, selectedPriority, selectedStatus, selectedDate, showCategory]);

  

  useEffect(() => {
    if (!projectId || !subprojectId) return;

    const query = new URLSearchParams({
      project: projectId,
      subproject: subprojectId,
      ...(selectedUser && { assignedTo: selectedUser }),
      ...(selectedCreatedBy && { createdBy: selectedCreatedBy }),
      ...(selectedPriority && { priority: selectedPriority }),
      ...(selectedStatus && { status: selectedStatus }),
      ...(selectedDate && { date: selectedDate }),
      ...(showCategory
        ? { viewCategory: showCategory }
        : { excludeCompleted: 'true' }),
      page: page.toString(),
      limit: tasksPerPage.toString(),
    });

    setLoading(true);

    fetch(`/api/tasks?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setTotalTasks(data.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching tasks:', err);
        setLoading(false);
      });
  }, [
    projectId,
    subprojectId,
    selectedUser,
    selectedCreatedBy,
    selectedPriority,
    selectedStatus,
    selectedDate,
    showCategory,
    page
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/me');
      const data = await res.json();
      if (!res.ok || !data.id) {
        router.push('/login');
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    fetch('/api/projects', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else {
          console.error('Unexpected project data:', data);
          setProjects([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching projects:', err);
      });
  }, []);




  useEffect(() => {
    if (projectId) {
      fetch(`/api/subprojects?projectId=${projectId}`)
        .then((res) => res.json())
        .then((data) => setSubprojects(Array.isArray(data.subprojects) ? data.subprojects : []));
    } else {
      setSubprojects([]);
    }
  }, [projectId]);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    router.push(`/tasks?project=${selected}`);
  };

  const handleSubprojectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    router.push(`/tasks?project=${projectId}&subproject=${selected}`);
  };

  const handleProjectSelect = (proj: Project) => {
    setProjectQuery(proj.title);
    router.push(`/tasks?project=${proj.id}`);
    setFilteredProjects([]);
  };

  const handleSubprojectSelect = (sub: Subproject) => {
    setSubprojectQuery(sub.name);
    if (projectId) router.push(`/tasks?project=${projectId}&subproject=${sub.id}`);
    setFilteredSubprojects([]);
  };

  const isDelayed = (task: Task) => {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date();
  };

  const totalPages = Math.ceil(totalTasks / tasksPerPage);

  const getPriorityBadge = (priority: Priority) => (
    {
      HIGH: 'bg-red-100 text-red-600',
      MEDIUM: 'bg-yellow-100 text-yellow-600',
      LOW: 'bg-green-100 text-green-600',
    }[priority]
  );

  const getStatusBadge = (status: TaskStatus) => (
    {
      PENDING: 'bg-gray-100 text-gray-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      DONE: 'bg-green-100 text-green-700',
      ON_HOLD: 'bg-yellow-100 text-yellow-800',
    }[status]
  );

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const confirm = window.confirm(`Mark task as ${status}?`);
    if (!confirm) return;

    await fetch(`/api/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  };

  const handleEdit = () => {
    if (selectedTask) router.push(`/tasks/edit/${selectedTask.id}?project=${projectId}&subproject=${subprojectId}&assignedTo=${selectedUser}&createdBy=${selectedCreatedBy}&priority=${selectedPriority}&status=${selectedStatus}&date=${selectedDate}`);
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    const confirm = window.confirm('Delete this task?');
    if (!confirm) return;

    await fetch(`/api/tasks/${selectedTask.id}`, { method: 'DELETE' });
    setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
    setSelectedTask(null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

          
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search Project..."
              value={projectQuery}
              onChange={(e) => {
                setProjectQuery(e.target.value);
                debounceFetchProjects(e.target.value);
              }}
              className="px-3 py-2 border rounded w-full"
            />
            {filteredProjects.length > 0 && (
              <div className="absolute z-50 bg-white border w-full max-h-48 overflow-y-auto shadow">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleProjectSelect(p)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {p.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🔍 Subproject input search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search Subproject..."
              value={subprojectQuery}
              onChange={(e) => {
                setSubprojectQuery(e.target.value);
                if (projectId) debounceFetchSubprojects(e.target.value, projectId);
              }}
              className="px-3 py-2 border rounded w-full"
              disabled={!projectId}
            />
            {filteredSubprojects.length > 0 && (
              <div className="absolute z-50 bg-white border w-full max-h-48 overflow-y-auto shadow">
                {filteredSubprojects.map((sp) => (
                  <div
                    key={sp.id}
                    onClick={() => handleSubprojectSelect(sp)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {sp.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>





        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative inline-block text-left">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded shadow-sm text-sm w-full sm:w-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 4h18M3 12h18M3 20h18" />
              </svg>
              Filters & Views
            </button>

            {showFilters && (
              <div className="absolute right-0 z-50 mt-2 w-72 bg-white p-4 rounded-xl shadow-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Filter Tasks</h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* Assigned To */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Assigned To</label>
                    <input
                      type="text"
                      value={assignedToQuery}
                      onChange={(e) => {
                        setAssignedToQuery(e.target.value);
                        debounceFetchAssignedToUsers(e.target.value);
                      }}
                      placeholder="Type to search..."
                      className="w-full px-3 py-1 border rounded text-sm"
                    />
                    {filteredAssignedToUsers.length > 0 && (
                      <div className="bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto text-sm">
                        {filteredAssignedToUsers.map((user) => (
                          <div
                            key={user.id}
                            className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedUser(user.id.toString());
                              setAssignedToQuery(user.name);
                              setFilteredAssignedToUsers([]);
                            }}
                          >
                            {user.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Created By */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Created By</label>
                    <input
                      type="text"
                      value={createdByQuery}
                      onChange={(e) => {
                        setCreatedByQuery(e.target.value);
                        debounceFetchCreatedByUsers(e.target.value);
                      }}
                      placeholder="Type name..."
                      className="w-full px-3 py-1 border rounded text-sm"
                    />
                    {filteredCreatedByUsers.length > 0 && (
                      <div className="bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto text-sm">
                        {filteredCreatedByUsers.map((user) => (
                          <div
                            key={user.id}
                            className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedCreatedBy(user.id.toString());
                              setCreatedByQuery(user.name);
                              setFilteredCreatedByUsers([]);
                            }}
                          >
                            {user.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Priority</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full px-3 py-1 border rounded text-sm"
                    >
                      <option value="">All</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-1 border rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={() =>
                projectId &&
                subprojectId &&
                router.push(`/tasks/create?project=${projectId}&subproject=${subprojectId}`)
              }
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
            >
              + Create New Task
            </button>
          </div>
        </div>
      </div>

      {/* View Category Filter */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mr-2">View Category:</label>
        <select
          value={showCategory || ''}
          onChange={(e) => {
            const val = e.target.value as 'COMPLETED' | 'ON_HOLD' | 'DELAYED' | '';
            setShowCategory(val === '' ? null : val);
          }}
          className="border px-3 py-1 rounded text-sm"
        >
          <option value="">All Tasks</option>
          <option value="COMPLETED">Completed Tasks</option>
          <option value="ON_HOLD">On Hold Tasks</option>
          <option value="DELAYED">Delayed Tasks</option>
        </select>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="flex justify-between items-center border-b-2 border-red-500 pb-2 mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Task List{showCategory ? `: ${showCategory.replace('_', ' ')}` : ''}
          </h2>
          <span className="w-6 h-6 bg-red-600 text-white text-sm flex items-center justify-center rounded-full">
            {totalTasks}
          </span>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading tasks...</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`p-4 border-l-4 rounded shadow-sm flex justify-between items-start flex-wrap cursor-pointer hover:shadow-md transition ${
                  task.priority === 'HIGH'
                    ? 'border-red-500 bg-red-50'
                    : task.priority === 'MEDIUM'
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-green-400 bg-green-50'
                }`}
              >
                <div className="flex-1 min-w-[200px] space-y-1">
                  <h3 className="font-semibold text-gray-800">{task.title}</h3>
                  <p className="text-sm text-gray-500">
                    {task.project?.title} | {task.subproject?.name}
                  </p>
                  <div className="text-sm text-gray-600">
                    <span>Assigned to: {task.assignedTo?.name || 'N/A'}</span>
                    <br />
                    <span>Created by: {task.creator?.name || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end min-w-[150px] space-y-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${getPriorityBadge(task.priority)}`}
                  >
                    {task.priority}
                  </span>
                  <select
                    className="text-sm text-gray-700 border rounded px-1 py-0.5"
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value as TaskStatus)
                    }
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                  <span className="text-sm">
                    Due:{' '}
                    <span
                      className={
                        isDelayed(task)
                          ? 'text-red-600 font-medium'
                          : 'text-blue-700 font-medium'
                      }
                    >
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </span>
                  {task.isUrgent && !isDelayed(task) && (
                    <p className="text-xs italic text-red-600 font-semibold">
                      Urgent!
                    </p>
                  )}
                  {isDelayed(task) && (
                    <p className="text-xs italic text-red-700 font-semibold">
                      Delayed!
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && totalTasks > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-l disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 border-t border-b">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-4 py-2 border rounded-r disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
);
}
