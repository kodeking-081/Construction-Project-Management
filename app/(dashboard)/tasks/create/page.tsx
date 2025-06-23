//File app/(dashboard)/tasks/create/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import debounce from 'lodash.debounce';

interface User {
  id: number;
  name: string;
}

type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export default function CreateTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const subprojectId = searchParams.get('subproject');

  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM' as Priority,
    isUrgent: false,
    assignedToId: '',
    status: 'PENDING' as TaskStatus,
  });

  const [searchUserInput, setSearchUserInput] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

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

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      projectId: Number(projectId),
      subprojectId,
      assignedToId: form.assignedToId ? Number(form.assignedToId) : null,
    };

    const res = await fetch('/api/tasks/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // ✅ cookies are sent automatically — no need to manually add token
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/tasks?project=${projectId}&subproject=${subprojectId}`);
    } else {
      alert('Failed to create task');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Task</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label className="block font-medium">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Due Date</label>
            <input
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Priority</label>
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
          </div>
        </div>

        <div className="relative">
          <label className="block font-medium mb-1">Assign To</label>
          <input
            type="text"
            placeholder="Search user..."
            value={searchUserInput}
            onChange={(e) => {
              const val = e.target.value;
              setSearchUserInput(val);
              debounceFetchUsers(val);
            }}
            className="w-full border px-3 py-2 rounded"
          />
          {filteredUsers.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border mt-1 rounded shadow-md max-h-48 overflow-y-auto">
              {filteredUsers.map((user) => (
                <li
                  key={user.id}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, assignedToId: user.id.toString() }));
                    setSearchUserInput(user.name);
                    setFilteredUsers([]);
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {user.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            name="isUrgent"
            type="checkbox"
            checked={form.isUrgent}
            onChange={handleChange}
            className="accent-red-500"
          />
          <label className="text-sm">Mark as urgent</label>
        </div>

        <div>
          <label className="block font-medium">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="border border-gray-400 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
            onClick={() => {
              if (projectId && subprojectId) {
                router.push(`/tasks?project=${projectId}&subproject=${subprojectId}`);
              } else {
                router.push('/tasks');
              }
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            Create Task
          </button>
        </div>

      </form>
    </div>
  );
}
