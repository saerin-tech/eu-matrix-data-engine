import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}) => {
  const pageNumbers = [];
  const maxVisiblePages = 5;
  
  // Calculate page range to display
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      padding: '20px',
      backgroundColor: '#fff',
      borderTop: '1px solid #ddd',
      borderRadius: '0 0 8px 8px'
    }}>
      {/* Items per page selector and info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ 
            fontSize: '14px', 
            color: '#666',
            fontWeight: '500'
          }}>
            Rows per page:
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              color: '#333',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div style={{ 
          fontSize: '14px', 
          color: '#666',
          fontWeight: '500'
        }}>
          Showing {startItem} to {endItem} of {totalItems} records
        </div>
      </div>

      {/* Pagination buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {/* First page button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '500',
            color: currentPage === 1 ? '#ccc' : '#007bff',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ««
        </button>

        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            color: currentPage === 1 ? '#ccc' : '#007bff',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          « Previous
        </button>

        {/* Page numbers */}
        {startPage > 1 && (
          <span style={{ color: '#999', padding: '0 5px' }}>...</span>
        )}

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              padding: '8px 14px',
              fontSize: '14px',
              fontWeight: currentPage === page ? 'bold' : '500',
              color: currentPage === page ? '#fff' : '#333',
              backgroundColor: currentPage === page ? '#007bff' : '#fff',
              border: `1px solid ${currentPage === page ? '#007bff' : '#ddd'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '40px'
            }}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <span style={{ color: '#999', padding: '0 5px' }}>...</span>
        )}

        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            color: currentPage === totalPages ? '#ccc' : '#007bff',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Next »
        </button>

        {/* Last page button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '500',
            color: currentPage === totalPages ? '#ccc' : '#007bff',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          »»
        </button>
      </div>
    </div>
  );
};

export default Pagination;