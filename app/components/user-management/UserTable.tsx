import { useState } from 'react';
import { Edit, Power, PowerOff, Loader } from 'lucide-react';
import Button from '../shared/Button';
import { Table, TableHeader, TableCell, TableRow, EmptyState } from '../shared/Table';
import BackendPagination from './BackendPagination';
import { User, PaginationMeta } from '../../types/user';

interface UserTableProps {
  users: User[];
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => Promise<void>;
  onEditUser: (user: User) => void;
  loading: boolean;
}

export default function UserTable({
  users,
  meta,
  onPageChange,
  onItemsPerPageChange,
  onToggleStatus,
  onEditUser,
  loading
}: UserTableProps) {

  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  // Handle user enable/disable toggle
  const handleToggle = async (userId: string, currentStatus: boolean) => {
    setToggleLoading(userId);
    try {
      await onToggleStatus(userId, currentStatus);
    } finally {
      setToggleLoading(null);
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
console.log(users[0].is_enabled, "userrrrsss [0] ");

  // Show empty state when no users found
  if (users.length === 0) {
    return (
      <Table>
        <tbody>
          <TableRow hoverable={false}>
            <EmptyState message="No users found" colSpan={7} />
          </TableRow>
        </tbody>
      </Table>
    );
  }

  return (
    <Table>
      {/* Table Header */}
      <thead>
        <TableRow hoverable={false}>
          <TableHeader>Name</TableHeader>
          <TableHeader>Username</TableHeader>
          <TableHeader>Contact</TableHeader>
          <TableHeader>Role</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Created By</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableRow>
      </thead>

      {/* Table Body */}
      <tbody>
        {users?.map((user) => (
          <TableRow key={user.id}>
            {/* Full Name */}
            <TableCell>
              {user.first_name} {user.last_name}
            </TableCell>

            {/* Username */}
            <TableCell>{user.user_name}</TableCell>

            {/* Contact Number */}
            <TableCell>{user.contact || 'N/A'}</TableCell>

            {/* Role Badge */}
            <TableCell>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.roles_and_rights === 'Admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user.roles_and_rights}
              </span>
            </TableCell>

            {/* Status Toggle Button */}
            <TableCell>
              <button
                onClick={() => handleToggle(user.id, user.is_enabled)}
                disabled={toggleLoading === user.id}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  user.is_enabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {toggleLoading === user.id ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : user.is_enabled ? (
                  <Power className="w-3 h-3" />
                ) : (
                  <PowerOff className="w-3 h-3" />
                )}
                {user.is_enabled ? 'Enabled' : 'Disabled'}
              </button>
            </TableCell>

            {/* Created By */}
            <TableCell>{user.created_by}</TableCell>

            {/* Edit Button */}
            <TableCell>
              <Button 
                onClick={() => onEditUser(user)}
                variant="primary"
                size="sm"
                icon={<Edit className="w-3 h-3" />}
              >
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </tbody>

      {/* Pagination Footer */}
      <tfoot>
        <tr>
          <td colSpan={7} className="p-0">
            <BackendPagination
              meta={meta}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          </td>
        </tr>
      </tfoot>
    </Table>
  );
}