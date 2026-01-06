import { AlertTriangle, X, Loader } from 'lucide-react';
import { useState } from 'react';

interface DeleteConfirmationModalProps {
  title?: string;
  description?: string;
  itemName?: string;
  itemDetails?: Array<{ label: string; value: string | number }>;
  warningMessage?: string;
  confirmButtonText?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmationModal({
  title = 'Delete Item',
  description = 'Are you sure you want to delete this item?',
  itemName,
  itemDetails = [],
  warningMessage = 'This action will permanently remove this item from the system.',
  confirmButtonText = 'Yes, Delete',
  onClose,
  onConfirm
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">{description}</p>
          
          {(itemName || itemDetails.length > 0) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {itemName && (
                    <p className="font-semibold text-red-800 mb-2">
                      {itemName}
                    </p>
                  )}
                  {itemDetails.length > 0 && (
                    <div className="text-sm text-red-700 space-y-1">
                      {itemDetails.map((detail, index) => (
                        <p key={index}>
                          <span className="font-medium">{detail.label}:</span> {detail.value}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">{warningMessage}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                {confirmButtonText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}