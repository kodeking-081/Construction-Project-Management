//File: app/costboard/add/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';


interface Category {
  id: string;
  name: string;
}

export default function AddCostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialProjectId = searchParams.get('projectId') || '';
  const initialSubProjectId = searchParams.get('subprojectId') || '';
  const [successMessage, setSuccessMessage] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    projectId: initialProjectId,
    subprojectId: initialSubProjectId,
    itemName: '',
    categoryId: '',
    contractor: '',
    date: '',
    estimatedCost: '',
    actualCost: '',
    status: 'Pending',
    floorPhase: '',
    notes: '',
  });

  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetch('/api/categories');

      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        alert('Failed to load categories');
      }
    };

    loadCategories();
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      estimatedCost: parseFloat(form.estimatedCost),
      actualCost: form.actualCost ? parseFloat(form.actualCost) : null,
    };

    const res = await fetch('/api/cost-entry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok && form.projectId && form.subprojectId) {
      setSuccessMessage('✅ Cost entry added successfully!');
      setTimeout(() => {
        router.push(`/costboard?projectId=${form.projectId}&subprojectId=${form.subprojectId}`);
      },2000);
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to save cost entry');
    }
  };


  return (
    
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Add New Cost Entry</h1>
        {successMessage && (
          <div className="mb-4 p-3 rounded text-green-800 bg-green-100 border border-green-300 transition-all duration-300">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="projectId" value={form.projectId} />
          <input type="hidden" name="subprojectId" value={form.subprojectId} />

          <input type="text" name="floorPhase" placeholder="Floor / Phase" value={form.floorPhase} onChange={handleChange} className="w-full border p-2 rounded" />
          <input type="text" name="itemName" placeholder="Item Name" value={form.itemName} onChange={handleChange} required className="w-full border p-2 rounded" />

          <select name="categoryId" value={form.categoryId} onChange={handleChange} required className="w-full border p-2 rounded">
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>

          <input type="text" name="contractor" placeholder="Contractor" value={form.contractor} onChange={handleChange} className="w-full border p-2 rounded" />
          <input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full border p-2 rounded" />
          <input type="number" name="estimatedCost" placeholder="Estimated Cost" value={form.estimatedCost} onChange={handleChange} required className="w-full border p-2 rounded" />
          <input type="number" name="actualCost" placeholder="Actual Cost (optional)" value={form.actualCost} onChange={handleChange} className="w-full border p-2 rounded" />

          <select name="status" value={form.status} onChange={handleChange} className="w-full border p-2 rounded">
            <option>Pending</option>
            <option>Approved</option>
            <option>Paid</option>
            <option>OnHold</option>
            <option>Cancelled</option>
          </select>

          <textarea name="notes" placeholder="Notes/Description" value={form.notes} onChange={handleChange} className="w-full border p-2 rounded" />

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Save Entry
          </button>
        </form>
      </div>
    
  );
}
