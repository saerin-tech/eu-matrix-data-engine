'use client';

import { useState } from 'react';
import { X, Database} from 'lucide-react';
import Button from './shared/Button';
import Input from './shared/Input';

interface AddDatabaseModalProps {
  show: boolean;
  onClose: () => void;
  onDatabaseAdded: () => void;
}

export default function AddDatabaseModal({ show, onClose, onDatabaseAdded }: AddDatabaseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    supabase_url: '',
    supabase_anon_key: '',
    database_url: '',
    service_role_key: '',
  });

  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTestPassed(false);
    setError(null);
  };

  const handleTestConnection = async () => {
    setError(null);
    setTesting(true);
    setTestPassed(false);

    try {
      const response = await fetch('/api/databases/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ database_url: formData.database_url }),
      });

      const result = await response.json();
      console.log(result, "result from test");

      if (result.success) {
        setTestPassed(true);
      } else {
        setError(result.message || 'Connection failed');
      }
    } catch (err: any) {
      setError('Network error: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!testPassed) {
      setError('Please test connection first');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const response = await fetch('/api/databases/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onDatabaseAdded();
        handleClose();
      } else {
        setError(result.error || 'Failed to add database');
        
        if (result.error?.includes('table not found') || result.error?.includes('PGRST204')) {
          setError(result.error + ' - Click "Setup Database Table" button below.');
        }
      }
    } catch (err: any) {
      setError('Network error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      supabase_url: '',
      supabase_anon_key: '',
      database_url: '',
      service_role_key: '',
    });
    setTestPassed(false);
    setError(null);
    onClose();
  };

  if (!show) return null;

  // Test button ke liye sirf database_url zaroori hai
  const isTestButtonEnabled = formData.database_url.trim() !== '';
  
  const isSaveButtonEnabled = 
    formData.name.trim() !== '' && 
    formData.supabase_url.trim() !== '' && 
    formData.supabase_anon_key.trim() !== '' && 
    formData.service_role_key.trim() !== '' &&
    formData.database_url.trim() !== '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Add New Database</h2>
          </div>
          <Button
            onClick={handleClose}
            variant="info"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-4">
            <Input
              label="Database Name"
              placeholder="My Production DB"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />

            <Input
              label="Supabase URL"
              placeholder="https://xxx.supabase.co"
              value={formData.supabase_url}
              onChange={(e) => handleChange('supabase_url', e.target.value)}
              required
            />

            <Input
              label="Supabase Anon Key"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={formData.supabase_anon_key}
              onChange={(e) => handleChange('supabase_anon_key', e.target.value)}
              required
            />

            <Input
              label="Database URL"
              placeholder="postgresql://user:pass@host:5432/dbname"
              value={formData.database_url}
              onChange={(e) => handleChange('database_url', e.target.value)}
              required
              helperText="Use port 5432 for direct connection. Password will be automatically encoded."
            />

            <Input
              label="Service Role Key"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={formData.service_role_key}
              onChange={(e) => handleChange('service_role_key', e.target.value)}
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {testPassed && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">✓ Connection successful! You can now save.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            variant="info"
            onClick={handleTestConnection}
            disabled={!isTestButtonEnabled || testing}
            loading={testing}
          >
            Test Connection
          </Button>

          <Button
            variant="success"
            onClick={handleSave}
            disabled={!testPassed || !isSaveButtonEnabled || saving}
            loading={saving}
          >
            Save & Connect
          </Button>
        </div>
      </div>
    </div>
  );
}