import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userService } from '../../services/user.service';
import type { User, UserRole } from '../../types/user';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

const ROLES: { label: string; value: string }[] = [
  { label: 'All Roles', value: '' },
  { label: 'Student', value: 'student' },
  { label: 'Instructor', value: 'instructor' },
  { label: 'Administrator', value: 'admin' },
];

const roleBadge: Record<string, string> = {
  admin: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  instructor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
  student: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
};

const AdminUsers: React.FC = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // ── Selection State ──────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Modal & Drawer States ──────────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [drawerUser, setDrawerUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // ── Form States for Create/Edit ────────────────────────────────────────────
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('student');
  const [formIsActive, setFormIsActive] = useState(true);
  const [csvContent, setCsvContent] = useState('');

  // ── 1. Fetch Users Query ────────────────────────────────────────────────────
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'users-list', page, limit, search, roleFilter, statusFilter],
    queryFn: async () => {
      const res = await userService.listUsers({
        page,
        limit,
        search: search.trim() ? search.trim() : undefined,
        role: roleFilter.trim() ? roleFilter.trim() : undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'active',
      });
      return res.data;
    },
    retry: 1,
  });

  const rawUsers = (data?.data as any)?.users ?? (data as any)?.users;
  const users: User[] = Array.isArray(rawUsers) ? rawUsers : [];
  const meta = data?.meta ?? (data?.data as any)?.meta ?? { total: users.length, page: 1, totalPages: 1 };

  // ── 2. Mutations ────────────────────────────────────────────────────────────
  const toggleStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => userService.updateUserStatus(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await qc.cancelQueries({ queryKey: ['admin', 'users-list'] });
      const previous = qc.getQueryData(['admin', 'users-list', page, limit, search, roleFilter, statusFilter]);
      qc.setQueryData(['admin', 'users-list', page, limit, search, roleFilter, statusFilter], (old: any) => {
        if (!old) return old;
        const list = (old.data as any)?.users || old.users || [];
        const updated = list.map((u: User) => (u._id === id ? { ...u, isActive } : u));
        return { ...old, data: { ...old.data, users: updated } };
      });
      return { previous };
    },
    onSuccess: (_, vars) => {
      toast.success(`User status updated to ${vars.isActive ? 'Active' : 'Inactive'}`);
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        qc.setQueryData(['admin', 'users-list', page, limit, search, roleFilter, statusFilter], context.previous);
      }
      toast.error('Failed to update user status');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users-list'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted successfully');
      setDeletingUser(null);
      qc.invalidateQueries({ queryKey: ['admin', 'users-list'] });
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: any) => userService.createUser(payload),
    onSuccess: () => {
      toast.success('New user account created successfully');
      setIsCreateOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ['admin', 'users-list'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create user'),
  });

  const editUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => userService.updateUser(id, payload),
    onSuccess: () => {
      toast.success('User details updated successfully');
      setEditingUser(null);
      resetForm();
      qc.invalidateQueries({ queryKey: ['admin', 'users-list'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update user'),
  });

  const resetForm = () => {
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('student');
    setFormIsActive(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormFirstName(u.firstName);
    setFormLastName(u.lastName);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormIsActive(u.isActive);
  };

  // ── Selection Handlers ──────────────────────────────────────────────────────
  const isAllSelected = useMemo(() => users.length > 0 && users.every((u) => selectedIds.has(u._id)), [users, selectedIds]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u._id)));
    }
  };

  const toggleSelectUser = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // ── Bulk Actions ────────────────────────────────────────────────────────────
  const handleBulkStatus = async (isActive: boolean) => {
    let successCount = 0;
    for (const id of selectedIds) {
      try {
        await userService.updateUserStatus(id, isActive);
        successCount++;
      } catch {
        // Continue loop
      }
    }
    toast.success(`Updated ${successCount} user accounts to ${isActive ? 'Active' : 'Inactive'}`);
    setSelectedIds(new Set());
    qc.invalidateQueries({ queryKey: ['admin', 'users-list'] });
  };

  const handleBulkDelete = async () => {
    let deletedCount = 0;
    for (const id of selectedIds) {
      try {
        await userService.deleteUser(id);
        deletedCount++;
      } catch {
        // Continue loop
      }
    }
    toast.success(`Successfully deleted ${deletedCount} users`);
    setSelectedIds(new Set());
    setIsBulkDeleteOpen(false);
    qc.invalidateQueries({ queryKey: ['admin', 'users-list'] });
  };

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const handleExportCSV = (targetUsers?: User[]) => {
    const listToExport = targetUsers || (selectedIds.size > 0 ? users.filter((u) => selectedIds.has(u._id)) : users);
    if (listToExport.length === 0) {
      toast.error('No users available to export');
      return;
    }
    const headers = 'ID,First Name,Last Name,Email,Role,Status,Registered At\n';
    const rows = listToExport
      .map((u) => `"${u._id}","${u.firstName}","${u.lastName}","${u.email}","${u.role}","${u.isActive ? 'Active' : 'Inactive'}","${u.createdAt}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-export-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${listToExport.length} user records to CSV`);
  };

  // ── CSV Import Batch Process ───────────────────────────────────────────────
  const handleBatchImport = async () => {
    if (!csvContent.trim()) {
      toast.error('Please paste valid CSV content');
      return;
    }
    const lines = csvContent.trim().split('\n').filter(Boolean);
    let imported = 0;
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 4) {
        const [fn, ln, em, pass, rl] = parts;
        if (fn && em && (pass || 'Pass123!')) {
          try {
            await userService.createUser({
              firstName: fn,
              lastName: ln || 'User',
              email: em,
              password: pass || 'Pass123!',
              role: (rl as any) || 'student',
            });
            imported++;
          } catch {
            // Ignore errors for individual duplicate accounts
          }
        }
      }
    }
    toast.success(`Successfully imported ${imported} new users`);
    setIsImportOpen(false);
    setCsvContent('');
    qc.invalidateQueries({ queryKey: ['admin', 'users-list'] });
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1">
          <PageBreadcrumb pageTitle="User Directory & Management" />
        </div>
        <div className="flex items-center gap-2 -mt-6">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
            Import CSV
          </button>
          <button
            onClick={() => handleExportCSV()}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create User
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-wrap gap-3 shadow-sm items-center">
        <div className="flex-1 min-w-[220px] relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search by first name, last name, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
              ✕
            </button>
          )}
        </div>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium"
        >
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium"
        >
          <option value="">All Statuses</option>
          <option value="active">Active Accounts</option>
          <option value="inactive">Inactive Accounts</option>
        </select>
      </div>

      {/* Floating Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-indigo-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
              {selectedIds.size}
            </span>
            <span className="text-xs font-semibold">User Accounts Selected</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkStatus(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Bulk Activate
            </button>
            <button
              onClick={() => handleBulkStatus(false)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Bulk Deactivate
            </button>
            <button
              onClick={() => handleExportCSV()}
              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition"
            >
              Export Selected
            </button>
            <button
              onClick={() => setIsBulkDeleteOpen(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Bulk Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 bg-indigo-950 text-indigo-200 text-xs font-medium rounded-lg hover:text-white transition"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            <p className="text-xs text-gray-400 font-medium">Fetching registered users...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                    </th>
                    {['User Profile', 'Role', 'Status', 'Registered Date', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {users.map((user) => (
                    <tr key={user._id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition ${selectedIds.has(user._id) ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(user._id)}
                          onChange={() => toggleSelectUser(user._id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                          )}
                          <div>
                            <button
                              onClick={() => setDrawerUser(user)}
                              className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition"
                            >
                              {user.firstName} {user.lastName}
                            </button>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${roleBadge[user.role] || ''}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDrawerUser(user)}
                            className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStatus.mutate({ id: user._id, isActive: !user.isActive })}
                            disabled={toggleStatus.isPending}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                              user.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => setDeletingUser(user)}
                              className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 rounded-lg hover:bg-red-100 transition"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-gray-500 font-medium text-sm">No registered users found</p>
                        {isError && (
                          <p className="text-xs text-red-500 mt-1">{(error as any)?.response?.data?.message || (error as any)?.message || 'Permission denied or connection error'}</p>
                        )}
                        <button
                          onClick={() => refetch()}
                          className="mt-3 px-4 py-1.5 text-xs bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                        >
                          Refresh User List
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-wrap items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 gap-4">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>
                  Showing Page {meta.page} of {meta.totalPages || 1} ({meta.total} total users)
                </span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrevPage}
                  className="px-3.5 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.hasNextPage}
                  className="px-3.5 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── CREATE USER MODAL ────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Create New User Account</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createUserMutation.mutate({ firstName: formFirstName, lastName: formLastName, email: formEmail, password: formPassword, role: formRole }); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <input type="text" required value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <input type="text" required value={formLastName} onChange={(e) => setFormLastName(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                <input type="password" required minLength={8} value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned System Role *</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value as any)} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={createUserMutation.isPending} className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-60">{createUserMutation.isPending ? 'Creating...' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL ──────────────────────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Edit User Profile ({editingUser.email})</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); editUserMutation.mutate({ id: editingUser._id, payload: { firstName: formFirstName, lastName: formLastName, role: formRole, isActive: formIsActive } }); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input type="text" value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input type="text" value={formLastName} onChange={(e) => setFormLastName(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role Assignment</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value as any)} className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="editStatus" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} className="rounded border-gray-300 text-indigo-600" />
                <label htmlFor="editStatus" className="text-xs font-medium text-gray-700 dark:text-gray-300">Account Active & Enabled</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={editUserMutation.isPending} className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-60">{editUserMutation.isPending ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW DETAILS DRAWER ──────────────────────────────────────────────── */}
      {drawerUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between space-y-4 border-l border-gray-100 dark:border-gray-800">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">User Account Details</h3>
                <button onClick={() => setDrawerUser(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {drawerUser.firstName[0]}{drawerUser.lastName[0]}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{drawerUser.firstName} {drawerUser.lastName}</h4>
                  <p className="text-xs text-gray-500">{drawerUser.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs py-2 border-b border-gray-50 dark:border-gray-800">
                  <span className="text-gray-500 font-medium">User ID</span>
                  <span className="font-mono text-gray-900 dark:text-white">{drawerUser._id}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-2 border-b border-gray-50 dark:border-gray-800">
                  <span className="text-gray-500 font-medium">Role</span>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${roleBadge[drawerUser.role]}`}>{drawerUser.role}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-2 border-b border-gray-50 dark:border-gray-800">
                  <span className="text-gray-500 font-medium">Account Status</span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${drawerUser.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{drawerUser.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-2 border-b border-gray-50 dark:border-gray-800">
                  <span className="text-gray-500 font-medium">Registration Date</span>
                  <span className="text-gray-900 dark:text-white">{new Date(drawerUser.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
              <button onClick={() => setDrawerUser(null)} className="px-4 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl">Close Drawer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────────────────────── */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">⚠️</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete User Account</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to permanently delete account <strong className="text-gray-800 dark:text-gray-200">{deletingUser.firstName} {deletingUser.lastName}</strong> ({deletingUser.email})? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setDeletingUser(null)} className="px-4 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl">Cancel</button>
              <button onClick={() => deleteUserMutation.mutate(deletingUser._id)} disabled={deleteUserMutation.isPending} className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition disabled:opacity-60">
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BULK DELETE CONFIRMATION MODAL ───────────────────────────────────── */}
      {isBulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">🗑️</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bulk Delete {selectedIds.size} Users</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete all <strong className="text-rose-600 font-bold">{selectedIds.size} selected user accounts</strong>?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setIsBulkDeleteOpen(false)} className="px-4 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl">Cancel</button>
              <button onClick={handleBulkDelete} className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition">
                Confirm Bulk Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSV IMPORT MODAL ─────────────────────────────────────────────────── */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Batch Import Users from CSV</h3>
              <button onClick={() => setIsImportOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <p className="text-xs text-gray-500">
              Paste CSV records in the format: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-indigo-600">firstName, lastName, email, password, role</code>
            </p>
            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="John, Doe, john@example.com, Pass123!, student&#10;Jane, Smith, jane@example.com, Pass123!, instructor"
              className="w-full p-3 text-xs font-mono border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsImportOpen(false)} className="px-4 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl">Cancel</button>
              <button onClick={handleBatchImport} className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
                Import CSV Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
