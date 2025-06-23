// File: app/costboard/edit/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
}

interface CostForm {
  itemName: string;
  floorPhase: string;
  categoryId: string;
  contractor: string;
  date: string;
  estimatedCost: string;
  actualCost: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'OnHold' | 'Cancelled';
  notes: string;
}

export default function EditCostEntryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CostForm>({
    itemName: '',
    floorPhase: '',
    categoryId: '',
    contractor: '',
    date: '',
    estimatedCost: '',
    actualCost: '',
    status: 'Pending',
    notes: '',
  });

  const [projectId, setProjectId] = useState<number | null>(null);
  const [subprojectId, setSubprojectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // ✅ Check if user is logged in
        const meRes = await fetch('/api/me');
        if (!meRes.ok) throw new Error('Unauthorized');
        const user = await meRes.json();

        // ✅ Fetch cost and categories using session (cookie-based auth)
        const [costRes, catRes] = await Promise.all([
          fetch(`/api/costboard/${id}`, { credentials: 'include' }),
          fetch('/api/categories', { credentials: 'include' }),
        ]);

        if (!costRes.ok) throw new Error('Failed to load cost item');
        if (!catRes.ok) throw new Error('Failed to load categories');

        const cost = await costRes.json();
        const cats = await catRes.json();

        setCategories(cats);
        setForm({
          itemName: cost.itemName ?? '',
          floorPhase: cost.floorPhase ?? '',
          categoryId: cost.categoryId ?? '',
          contractor: cost.contractor ?? '',
          date: cost.date ? cost.date.slice(0, 10) : '',
          estimatedCost: cost.estimatedCost?.toString() ?? '',
          actualCost: cost.actualCost?.toString() ?? '',
          status: cost.status ?? 'Pending',
          notes: cost.notes ?? '',
        });

        setProjectId(cost.projectId);
        setSubprojectId(cost.subprojectId);
      } catch (err) {
        console.error(err);
        alert('Could not load data. Please login again.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.estimatedCost || parseFloat(form.estimatedCost) <= 0) {
      alert('Estimated cost must be greater than 0');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        estimatedCost: parseFloat(form.estimatedCost),
        actualCost: form.actualCost ? parseFloat(form.actualCost) : null,
      };

      const res = await fetch(`/api/costboard/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Use cookie-based session
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }

      setSuccessMessage('✅ Cost entry updated successfully!');
      setTimeout(() => {
        if (projectId && subprojectId) {
          router.push(`/costboard?projectId=${projectId}&subprojectId=${subprojectId}`);
        } else {
          router.push('/costboard');
        }
      }, 1500);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading…</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Edit Cost Entry</h1>

      {successMessage && (
        <div className="mb-4 p-3 rounded text-green-800 bg-green-100 border border-green-300 transition-all duration-300">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="floorPhase"
          placeholder="Floor / Phase"
          value={form.floorPhase}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="itemName"
          placeholder="Item Name"
          value={form.itemName}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="contractor"
          placeholder="Contractor"
          value={form.contractor}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          name="estimatedCost"
          placeholder="Estimated Cost"
          min="0"
          step="0.01"
          value={form.estimatedCost}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          name="actualCost"
          placeholder="Actual Cost (optional)"
          min="0"
          step="0.01"
          value={form.actualCost}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option>Pending</option>
          <option>Approved</option>
          <option>Paid</option>
          <option>OnHold</option>
          <option>Cancelled</option>
        </select>

        <textarea
          name="notes"
          placeholder="Notes / Description"
          value={form.notes}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Updating…' : 'Update Entry'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
