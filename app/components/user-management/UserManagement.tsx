import { useState, useEffect } from 'react';
import { Users, AlertCircle, ArrowLeft } from 'lucide-react';
import UserTable from './UserTable';
import EditUserModal from './EditUserModal';
import Button from '../shared/Button';
import { User, PaginationMeta, UsersResponse, UpdateUserData } from '../../types/user';

interface UserManagementProps {
  onBack?: () => void; 
}
export default function UserManagement({ onBack }: UserManagementProps) {
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
      const response = await fetch(`/api/users/list?page=${page}&limit=${limit}`);
      const result: UsersResponse = await response.json();
        
      if (result.success) {
        setUsers(result.users);
        setMeta(result.meta);
      } else {
        setError(result.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Fetch Users Error:', err);
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
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
        body: JSON.stringify({ userId, isEnabled: currentStatus })
      });

      const result = await response.json();
      
      if (result.success) {
        setUsers(prevUsers =>
            prevUsers?.map(user => 
            user.id === userId 
                ? { ...user, is_enabled: result.data.isEnabled }
                : user
            )
        );
        }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // User update
  const handleUpdateUser = async (userId: string, data: Partial<UpdateUserData>) => {
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
        <div className='flex justify-between'>
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          </div>
          <p className="text-gray-600">Manage user accounts, roles, and access</p>
        </div>
        {/*Back Button */}
        {onBack && (
          <div className="mb-4">
            <Button
              onClick={onBack}
              variant="primary"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Query Builder
            </Button>
          </div>
        )}

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