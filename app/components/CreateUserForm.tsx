import { useState, FormEvent, useEffect } from 'react';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import TextInput from "./TextInput";
import SelectInput from "./SelectInput";
import SubmitButton from "./SubmitButton";

type UserRole = 'Admin' | 'User' | "";

interface CreateUserFormProps {
  creatorRole: UserRole;
  creatorUserName: string;
  onSuccess?: () => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  user_name: string;
  contact: string;
  roles_and_rights: UserRole;
  user_password: string;
  confirm_password: string;
}

export default function CreateUserForm({ 
  creatorRole, 
  creatorUserName,
  onSuccess 
}: CreateUserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    user_name: '',
    contact: '',
    roles_and_rights: '',
    user_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // NEW: Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const { first_name, last_name, user_name, user_password, confirm_password, roles_and_rights } = formData;
    const isValid = 
      first_name.trim().length > 0 &&
      last_name.trim().length > 0 &&
      user_name.trim().length >= 3 &&
      user_password.length >= 6 &&
      confirm_password.length >= 6 &&
      user_password === confirm_password &&
      (roles_and_rights === 'Admin' || roles_and_rights === 'User');
    
    setIsFormValid(isValid);
  }, [formData]);

  // NEW: Handle contact input with max 11 digits
  function handleContactChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    if (value === '' || (/^\d+$/.test(value) && value.length <= 11)) {
      updateField('contact', value);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Frontend validation
    if (formData.user_password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.user_name.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    if (formData.user_password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          user_name: formData.user_name.trim(),
          contact: formData.contact.trim() || null, 
          roles_and_rights: formData.roles_and_rights,
          user_password: formData.user_password,
          creator_role: creatorRole,
          created_by: creatorUserName 
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message || 'User created successfully!');
        setFormData({
          first_name: '',
          last_name: '',
          user_name: '',
          contact: '',
          roles_and_rights: '',
          user_password: '',
          confirm_password: ''
        });
        onSuccess?.();
      } else {
        setError(result.message || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput
        label="First Name"
        required
          value={formData.first_name}
          onChange={(e) => updateField('first_name', e.target.value)}
          placeholder="Enter first name"
        />

      <TextInput
        label="Last Name"
        required
          value={formData.last_name}
          onChange={(e) => updateField('last_name', e.target.value)}
          placeholder="Enter last name"
        />

      <TextInput
        label="User Name"
          required
          minLength={3}
        value={formData.user_name}
        onChange={(e) => updateField('user_name', e.target.value)}
          placeholder="Enter username (min 3 characters)"
        />

      <TextInput
        label="Contact"
          type="text"
        showCount
        maxLength={11}
          value={formData.contact}
          onChange={handleContactChange}
          placeholder="Enter contact number (optional)"
        />

      <SelectInput
        label="Role"
        required
          value={formData.roles_and_rights}
          onChange={(e) => updateField('roles_and_rights', e.target.value as UserRole)}
        options={[
          { label: "User", value: "User" },
          { label: "Admin", value: "Admin" }
        ]}
      />

      <TextInput
        label="Password"
          required
            value={formData.user_password}
        placeholder="Enter password (min 6 characters)"
            minLength={6}
        onChange={(e) => updateField('user_password', e.target.value)}
        showPasswordToggle
        isPasswordVisible={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
      />

      <TextInput
        label="Confirm Password"
        required
            value={formData.confirm_password}
        placeholder="Confirm password"
            minLength={6}
        onChange={(e) => updateField('confirm_password', e.target.value)}
        showPasswordToggle
        isPasswordVisible={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
        )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <SubmitButton
        loading={loading}
        disabled={!isFormValid}
        text="Create User"
        icon={<UserPlus className="w-5 h-5" />}
      />
    </form>
  );
}