//File: app/(dashboard)/tasks/edit/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import debounce from 'lodash.debounce';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'ON_HOLD';
  assignedTo?: { id: number; name: string } | null;
}

interface User {
  id: number;
  name: string;
}

// ✅ Debounced user search (no localStorage, no useCallback)
const debouncedSearchUsers = debounce(
  (query: string, callback: (users: User[]) => void) => {
    if (query.trim().length < 2) {
      callback([]);
      return;
    }

    fetch(`/api/users?search=${query}`)
      .then((res) => res.json())
      .then((data) => callback(Array.isArray(data) ? data : []))
      .catch(() => callback([]));
  },
  300
);

export default function EditTaskPage() {
  const id = useParams()?.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [userQuery, setUserQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM' as const,
    status: 'PENDING' as const,
    assignedToId: '' as string,
  });

  useEffect(() => {
    if (!id) return;

    fetch(`/api/tasks/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTask(data);
        setForm({
          title: data.title,
          description: data.description || '',
          dueDate: data.dueDate?.slice(0, 10) || '',
          priority: data.priority,
          status: data.status,
          assignedToId: data.assignedTo?.id?.toString() || '',
        });
        setUserQuery(data.assignedTo?.name || '');
        if (data.assignedTo) {
          setFilteredUsers([data.assignedTo]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);
  
  useEffect(() => {
    debouncedSearchUsers(userQuery, setFilteredUsers);
  }, [userQuery]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    router.push(`/tasks?${queryString}`);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!task) return <div className="p-6 text-red-600">Task not found.</div>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
      <div className="space-y-4">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Task Title"
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Task Description"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
          <option value="ON_HOLD">On Hold</option>
        </select>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <input
            type="text"
            placeholder="Search user..."
            value={userQuery}
            onChange={(e) => {
              const value = e.target.value;
              setUserQuery(value);
              if (value === '') {
                setForm({ ...form, assignedToId: '' });
              }
            }}
            className="w-full border px-3 py-2 rounded"
          />
          {filteredUsers.length > 0 && (
            <div className="bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto text-sm z-10 relative">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setForm({ ...form, assignedToId: user.id.toString() });
                    setUserQuery(user.name);
                    setFilteredUsers([]);
                  }}
                >
                  {user.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
          <button
            onClick={() => router.push(`/tasks?${queryString}`)}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
