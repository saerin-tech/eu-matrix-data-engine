import { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';
import { User, UpdateUserData, UserRole } from '../../types/user';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (userId: string, data: UpdateUserData) => Promise<void>;
}


export default function EditUserModal({ user, onClose, onUpdate }: EditUserModalProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    first_name: user.first_name,
    last_name: user.last_name,
    contact: user.contact || '',
    roles_and_rights: user.roles_and_rights
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle contact number validation (digits only, max 11)
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && value.length <= 11)) {
      setFormData({ ...formData, contact: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onUpdate(user.id, {
        ...formData,
        contact: formData.contact || null
      });
      onClose();
    } catch (err) {
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Role options for select dropdown
  const roleOptions = [
    { value: 'User', label: 'User' },
    { value: 'Admin', label: 'Admin' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Edit User</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* First Name Input */}
            <Input
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              placeholder="Enter first name"
            />

            {/* Last Name Input */}
            <Input
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
              placeholder="Enter last name"
            />

            {/* Contact Number Input */}
            <Input
              label="Contact"
              type="tel"
              value={formData.contact || ''}
              onChange={handleContactChange}
              placeholder="Enter contact number (optional)"
              maxLength={11}
              showCount
            />

            {/* Role Selector */}
            <Select
              label="Role"
              value={formData.roles_and_rights}
              onChange={(e) => setFormData({ ...formData, roles_and_rights: e.target.value as UserRole })}
              options={roleOptions}
              required
            />

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                variant="success" 
                loading={loading}
                icon={<Check className="w-4 h-4" />}
                fullWidth
              >
                Update User
              </Button>
              
              <Button 
                type="button"
                variant="secondary" 
                onClick={onClose}
                icon={<X className="w-4 h-4" />}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}