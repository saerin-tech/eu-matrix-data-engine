import { useState, useEffect } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import UserTable from './UserTable';
import EditUserModal from './EditUserModal';
import { User, PaginationMeta, UsersResponse, UpdateUserData } from '../../types/user';

export default function UserManagement() {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Backend se users fetch 
  const fetchUsers = async (page: number, limit: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/List?page=${page}&limit=${limit}`);
      const result: UsersResponse = await response.json();
        
      if (result.success) {
        setUsers(result.users);
        setMeta(result.meta);
      } else {
        setError(result.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(meta.currentPage, meta.itemsPerPage);
  }, []);


  const handlePageChange = (page: number) => {
    fetchUsers(page, meta.itemsPerPage);
  };


  const handleItemsPerPageChange = (items: number) => {
    fetchUsers(1, items); // Page 1 start
  };

  // User enable/disable 
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/users/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          isEnabled: currentStatus ?? false 
        })
      });

      const result = await response.json();
      
      if (result.success && result.user) {
        setUsers(prev =>
            prev.map(u =>
            u.id === userId
                ? { ...u, is_enabled: result.user.is_enabled }
                : u
            )
        );
        }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // User update
  const handleUpdateUser = async (userId: string, data: UpdateUserData) => {
    const response = await fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data })
    });

    const result = await response.json();

    if (result.success) {
      // Data refresh
      fetchUsers(meta.currentPage, meta.itemsPerPage);
    } else {
      throw new Error(result.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          </div>
          <p className="text-gray-600">Manage user accounts, roles, and access</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* User Table */}
        <UserTable
          users={users}
          meta={meta}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          onToggleStatus={handleToggleStatus}
          onEditUser={setEditingUser}
          loading={loading}
        />

        {/* Edit Modal */}
        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onUpdate={handleUpdateUser}
          />
        )}
      </div>
    </div>
  );
}