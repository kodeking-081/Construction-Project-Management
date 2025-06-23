// File: app/(dashboard)/projects/add/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProjectPage() {
  const [form, setForm] = useState({
    title: '',
    location: '',
    startDate: '',
    expectedEndDate: '',
    budget: '',
    image: '',
  });

  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        console.log(data)
        if (data.role !== 'ADMIN') {
          router.push('/');
        } else {
          setUserId(data.userId); // ✅ use userId directly from /api/me
        }
      } catch (error) {
        console.error('Failed to verify user:', error);
        router.push('/');
      }
    };

    fetchUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('User not verified');
      return;
    }

    const payload = {
      ...form,
      budget: parseFloat(form.budget),
      userId,
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newProject = await res.json();
        router.push(`/projects/${newProject.id}`);
      } else {
        alert('Failed to create project');
      }
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Error creating project');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="w-full border p-2" required />
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="w-full border p-2" required />
        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full border p-2" required />
        <input type="date" name="expectedEndDate" value={form.expectedEndDate} onChange={handleChange} className="w-full border p-2" required />
        <input name="budget" type="number" step="0.01" placeholder="Budget" value={form.budget} onChange={handleChange} className="w-full border p-2" required />
        <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} className="w-full border p-2" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
      </form>
    </div>
  );
}
