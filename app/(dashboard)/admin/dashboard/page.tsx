// File: app/(dashboard)/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import {FileText} from 'lucide-react';



interface User {
  id: string;
  name: string;
  email: string;
  contact?: string;
  role: 'USER' | 'ADMIN';
}

interface DashboardStats {
  totalProjects: number;
  totalUsers: number;
  totalTasks: number;
  CostReports: any; // TODO: Replace 'any' with the correct type if known
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSettingTab, setActiveSettingTab] = useState<'profile' | 'categories' | 'password' | 'users' | null>(null);
  const [editProfile, setEditProfile] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: '', email: '', contact: '', password: '', confirmPassword: '', role: 'USER' as 'USER' | 'ADMIN' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const totalUserPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const totalCategoryPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const paginatedCategories = categories.slice(
    (categoryPage - 1) * ITEMS_PER_PAGE,
    categoryPage * ITEMS_PER_PAGE
  );

  const paginatedUsers = users.slice(
    (userPage - 1) * ITEMS_PER_PAGE,
    userPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    fetch('/api/me').then(res => {
      if (!res.ok) return router.push('/login');
      return res.json();
    }).then(data => setUser(data));
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetch('/api/users').then(res => res.json()).then(setUsers);
      fetch('/api/categories').then(res => res.json()).then(setCategories);
    }
  }, [user]);

  useEffect(() => {
    setCategoryPage(1);
    setUserPage(1);
  }, [activeSettingTab]);


  const handleUpdateProfile = async () => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ this ensures cookies are sent
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const updatedUser = await res.json();
      setUser(updatedUser);
      setEditProfile(false);
    } else {
      alert('Failed to update profile');
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryInput.trim()) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryInput.trim() }),
    });
    if (res.ok) {
      const newCat = await res.json();
      setCategories((prev) => [...prev, newCat]);
      setCategoryInput('');
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editName.trim()) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ⬅️ This is crucial to send cookies
        body: JSON.stringify({ name: editName }),
      });

      if (!res.ok) {
        console.error('Failed to update category');
        return;
      }

      const updated = await res.json();
      setCategories(prev =>
        prev.map(cat => (cat.id === id ? { ...cat, name: updated.name } : cat))
      );
      setEditCategoryId(null);
      setEditName('');
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };



  const handleDeleteCategory = async (id: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this category?');
    if (!confirmDelete) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) setUsers(prev => prev.filter(user => user.id !== id));
  };

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/admin-dashboard/');
      if (res.ok) setStats(await res.json());
      setLoading(false);
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        contact: user.contact || '',
        password: '',
        confirmPassword: '',
        role: user.role,
      });
    }
  }, [user]);


  return (
      <div className="p-6 min-h-screen bg-white text-gray-900">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {showSuccess && <div className="mb-4 p-4 bg-green-100 text-green-800 border border-green-300">✅ Update successful!</div>}

        {loading ? <div className="text-center py-12 text-gray-600">Loading stats...</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card><CardContent><h2 className="text-xl ">Total Projects</h2><p className="text-3xl font-semibold mt-2">{stats?.totalProjects}</p></CardContent></Card>
            <Card><CardContent><h2 className="text-xl ">Total Users</h2><p className="text-3xl font-semibold mt-2">{stats?.totalUsers}</p></CardContent></Card>
            <Card><CardContent><h2 className="text-xl ">Total Tasks</h2><p className="text-3xl font-semibold mt-2">{stats?.totalTasks}</p></CardContent></Card>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Quick Settings</h2>
          <div className="border-b mb-6">
            <nav className="grid grid-cols-2 gap-3 text-sm font-medium sm:flex sm:gap-6">
              {['users', 'profile', 'categories', 'password'].map(tab => (
                <button
                  key={tab}
                  className={`py-2 px-4 border-b-2 font-bold ${activeSettingTab === tab ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveSettingTab(tab as any)}
                >
                  {tab === 'users' ? 'User Management' : tab === 'profile' ? 'My Profile' : tab === 'categories' ? 'Manage Category' : 'Privacy & Security'}
                </button>
              ))}
            </nav>
          </div>

          {activeSettingTab === 'profile' && user && (
            <div className="flex justify-center">
              <div className="border p-6 rounded bg-gray-50 space-y-6 max-w-xl w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">My Profile</h3>
                  <button
                    onClick={() => {
                      if (!editProfile) {
                        setForm({
                          name: user.name,
                          email: user.email,
                          contact: user.contact || '',
                          password: '',
                          confirmPassword: '',
                          role: user.role,
                        });
                      }
                      setEditProfile(!editProfile);
                    }}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title={editProfile ? 'Cancel Edit' : 'Edit Profile'}
                  >
                    {editProfile ? <X size={18} /> : <Pencil size={18} />}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editProfile ? form.name : user.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    readOnly={!editProfile}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${editProfile ? 'bg-white' : 'bg-gray-100'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editProfile ? form.email : user.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    readOnly={!editProfile}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${editProfile ? 'bg-white' : 'bg-gray-100'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    type="text"
                    value={editProfile ? form.contact : user.contact || ''}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    readOnly={!editProfile}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${editProfile ? 'bg-white' : 'bg-gray-100'}`}
                  />
                </div>

                {editProfile && (
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-sm transition"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          )}



          {activeSettingTab === 'password' && (
            <div className="flex justify-center items-center min-h-[60vh] px-4">
              <div className="border p-6 rounded bg-gray-50 space-y-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>

                {/* New Password Field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Confirm Password Field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword || ''}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button
                  onClick={handleUpdateProfile}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-sm transition w-full"
                >
                  Update Password
                </button>
              </div>
            </div>
          )}




          {activeSettingTab === 'categories' && (
            <div className="flex justify-center">
              <div className="bg-gray-50 p-6 rounded shadow-md w-full max-w-lg space-y-6 border">
                <h3 className="text-xl font-semibold text-gray-800">Manage Categories</h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="New Category"
                    className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  />
                  <button
                    onClick={handleCreateCategory}
                    className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                  >
                    Add
                  </button>
                </div>


                <div className="space-y-3">
                  {paginatedCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center px-4 py-2 border rounded-lg bg-white shadow-sm mb-2 hover:bg-gray-50"
                    >
                      {editCategoryId === cat.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-3 py-1 mr-2 border border-gray-300 rounded"
                          />
                        ) : (
                          <span className="flex-1 text-gray-800">{cat.name}</span>
                      )}

                      <div className="flex space-x-2">
                        {editCategoryId === cat.id ? (
                          <button
                            onClick={() => handleEditCategory(cat.id)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditCategoryId(cat.id);
                              setEditName(cat.name);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm pt-4">
                  <button
                    onClick={() => setCategoryPage((prev) => Math.max(prev - 1, 1))}
                    disabled={categoryPage === 1}
                    className="px-2 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalCategoryPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setCategoryPage(num)}
                      className={`px-3 py-1 rounded border ${
                        num === categoryPage
                          ? 'bg-yellow-500 text-white border-yellow-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() => setCategoryPage((prev) => Math.min(prev + 1, totalCategoryPages))}
                    disabled={categoryPage === totalCategoryPages}
                    className="px-2 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

              </div>
            </div>
          )}


          {activeSettingTab === 'users' && (
            <div className="border p-4 rounded bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full text-sm text-left bg-white">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 whitespace-nowrap">Name</th>
                      <th className="px-4 py-2 whitespace-nowrap">Email</th>
                      <th className="px-4 py-2 whitespace-nowrap">Role</th>
                      <th className="px-4 py-2 whitespace-nowrap">Contact</th>
                      <th className="px-4 py-2 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap">{u.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{u.email}</td>
                        <td className="px-4 py-2 capitalize whitespace-nowrap">{u.role}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{u.contact}</td>
                        <td className="px-4 py-2 whitespace-nowrap flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800"><Pencil size={18} /></button>
                          <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-center pt-4">
                <div className="flex items-center space-x-2 text-sm">

                  <button
                    onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
                    disabled={userPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalUserPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setUserPage(num)}
                      className={`px-3 py-1 rounded border transition-all duration-150 ${
                        num === userPage
                          ? 'bg-yellow-500 text-white border-yellow-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() => setUserPage((prev) => Math.min(prev + 1, totalUserPages))}
                    disabled={userPage === totalUserPages}
                    className="px-3 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
