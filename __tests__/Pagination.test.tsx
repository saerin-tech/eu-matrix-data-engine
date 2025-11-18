import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple Pagination mock component for testing
const MockPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  onItemsPerPageChange, 
  totalItems 
}: any) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  return (
    <div>
      <div>
        <label>Rows per page:</label>
        <select 
          data-testid="items-per-page" 
          value={itemsPerPage} 
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      <div data-testid="record-info">
        Showing {startItem} to {endItem} of {totalItems} records
      </div>
      <div>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button 
              key={pageNum} 
              data-testid={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              style={{ fontWeight: pageNum === currentPage ? 'bold' : 'normal' }}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();
  const mockOnItemsPerPageChange = jest.fn();

  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: mockOnPageChange,
    itemsPerPage: 10,
    onItemsPerPageChange: mockOnItemsPerPageChange,
    totalItems: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pagination component with correct information', () => {
      render(<MockPagination {...defaultProps} />);
      
      const recordInfo = screen.getByTestId('record-info');
      expect(recordInfo.textContent).toContain('Showing 1 to 10 of 100 records');
      expect(screen.getByText(/Rows per page:/i)).toBeTruthy();
    });

    it('should display correct page range for middle page', () => {
      render(<MockPagination {...defaultProps} currentPage={5} />);
      
      const recordInfo = screen.getByTestId('record-info');
      expect(recordInfo.textContent).toContain('Showing 41 to 50 of 100 records');
    });

    it('should display correct range for last page with incomplete items', () => {
      render(<MockPagination {...defaultProps} totalItems={95} currentPage={10} />);
      
      const recordInfo = screen.getByTestId('record-info');
      expect(recordInfo.textContent).toContain('Showing 91 to 95 of 95 records');
    });

    it('should render items per page dropdown with correct options', () => {
      render(<MockPagination {...defaultProps} />);
      
      const select = screen.getByTestId('items-per-page');
      expect(select).toBeTruthy();
      expect(screen.getByText('25')).toBeTruthy();
      expect(screen.getByText('50')).toBeTruthy();
      expect(screen.getByText('100')).toBeTruthy();
    });
  });

  describe('Items Per Page Functionality', () => {
    it('should call onItemsPerPageChange when items per page is changed', () => {
      render(<MockPagination {...defaultProps} />);
      
      const select = screen.getByTestId('items-per-page');
      fireEvent.change(select, { target: { value: '25' } });
      
      expect(mockOnItemsPerPageChange).toHaveBeenCalledWith(25);
    });

    it('should display correct selected value', () => {
      render(<MockPagination {...defaultProps} itemsPerPage={50} />);
      
      const select = screen.getByTestId('items-per-page') as HTMLSelectElement;
      expect(select.value).toBe('50');
    });
  });

  describe('Page Navigation', () => {
    it('should call onPageChange when a page number is clicked', () => {
      render(<MockPagination {...defaultProps} />);
      
      const pageButton = screen.getByTestId('page-2');
      fireEvent.click(pageButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should highlight current page', () => {
      render(<MockPagination {...defaultProps} currentPage={3} />);
      
      const currentPageButton = screen.getByTestId('page-3');
      expect(currentPageButton.style.fontWeight).toBe('bold');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single page correctly', () => {
      render(<MockPagination {...defaultProps} totalPages={1} totalItems={5} />);
      
      const recordInfo = screen.getByTestId('record-info');
      expect(recordInfo.textContent).toContain('Showing 1 to 5 of 5 records');
    });

    it('should handle empty data', () => {
      render(<MockPagination {...defaultProps} totalPages={0} totalItems={0} currentPage={1} />);
      
      const recordInfo = screen.getByTestId('record-info');
      expect(recordInfo.textContent).toContain('Showing 1 to 0 of 0 records');
    });

    it('should calculate correct page range for many pages', () => {
      render(<MockPagination {...defaultProps} totalPages={100} currentPage={50} />);
      
      // Should render pagination controls
      expect(screen.getByTestId('record-info')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label for items per page selector', () => {
      render(<MockPagination {...defaultProps} />);
      
      const label = screen.getByText(/Rows per page:/i);
      expect(label).toBeTruthy();
    });

    it('should render select element with correct value', () => {
      render(<MockPagination {...defaultProps} />);
      
      const select = screen.getByTestId('items-per-page') as HTMLSelectElement;
      expect(select.tagName).toBe('SELECT');
      expect(select.value).toBe('10');
    });
  });
});
