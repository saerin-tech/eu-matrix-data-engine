'use client';

import { useState, useEffect } from 'react';
import { Trash2, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import { Database } from '../../types/index';
import DeleteConfirmationModal from '../user-management/DeleteConfirmationModal';
import Button from '../shared/Button';

interface DatabaseManagementProps {
  onBack?: () => void;
}

export default function DatabaseManagement({ onBack }: DatabaseManagementProps) {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch databases from API
  const fetchDatabases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/databases');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch databases`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch databases');
      }

      setDatabases(data.databases || []);
    } catch (err) {
      console.error('Error fetching databases:', err);
      setError(err instanceof Error ? err.message : 'Failed to load databases');
    } finally {
      setLoading(false);
    }
  };

  // Load databases on component mount
  useEffect(() => {
    fetchDatabases();
  }, []);

  // Handle delete confirmation
  const handleDeleteClick = (database: Database) => {
    if (database.is_default) {
      alert('Cannot delete default database');
      return;
    }
    
    setSelectedDatabase(database);
    setShowDeleteModal(true);
  };

  // Handle delete API call
  const handleDeleteConfirm = async (databaseId: string | number) => {
    try {
      const response = await fetch('/api/databases/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ databaseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete database');
      }

      await fetchDatabases();
      
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading databases...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Error Loading Databases</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchDatabases}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Database Management</h1>
          <p className="text-gray-300 mt-1">Manage your database connections</p>
        </div>
        
        {onBack && (
          <Button
            onClick={onBack}
            variant="primary"
            size="md"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Query Builder
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connection Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supabase URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {databases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No databases found
                  </td>
                </tr>
              ) : (
                databases.map((database, index) => (
                  <tr key={database.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {database.name}
                        </span>
                        {database.is_default && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {database.supabase_url}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        database.is_default 
                          ? 'text-green-700 bg-green-100' 
                          : 'text-gray-700 bg-gray-100'
                      }`}>
                        {database.is_default ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {database.created_at 
                        ? new Date(database.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteClick(database)}
                        disabled={database.is_default}
                        className={`p-2 rounded-lg transition-colors ${
                          database.is_default
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50 cursor-pointer'
                        }`}
                        title={database.is_default ? 'Cannot delete default database' : 'Delete database'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDatabase && (
        <DeleteConfirmationModal
          title="Delete Database"
          description="Are you sure you want to delete this database connection?"
          itemName="Database Details:"
          itemDetails={[
            { label: 'Connection Name', value: selectedDatabase.name },
            { label: 'Supabase URL', value: selectedDatabase.supabase_url },
            { label: 'Default Database', value: selectedDatabase.is_default ? 'Yes' : 'No' }
          ]}
          warningMessage="This action will permanently remove this database connection from the system. All associated data will be lost."
          confirmButtonText="Yes, Delete Database"
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedDatabase(null);
          }}
          onConfirm={() => handleDeleteConfirm(selectedDatabase.id)}
        />
      )}
    </div>
  );
}