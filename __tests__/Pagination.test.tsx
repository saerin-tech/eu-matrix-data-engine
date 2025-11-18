import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from '../app/components/Pagination';

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
      render(<Pagination {...defaultProps} />);
      
      expect(screen.getByText(/Showing 1 to 10 of 100 records/i)).toBeInTheDocument();
      expect(screen.getByText(/Rows per page:/i)).toBeInTheDocument();
    });

    it('should display correct page range for middle page', () => {
      render(<Pagination {...defaultProps} currentPage={5} />);
      
      expect(screen.getByText(/Showing 41 to 50 of 100 records/i)).toBeInTheDocument();
    });

    it('should display correct range for last page with incomplete items', () => {
      render(<Pagination {...defaultProps} totalItems={95} currentPage={10} />);
      
      expect(screen.getByText(/Showing 91 to 95 of 95 records/i)).toBeInTheDocument();
    });

    it('should render items per page dropdown with correct options', () => {
      render(<Pagination {...defaultProps} />);
      
      const select = screen.getByDisplayValue('10');
      expect(select).toBeInTheDocument();
      
      fireEvent.mouseDown(select);
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Items Per Page Functionality', () => {
    it('should call onItemsPerPageChange when items per page is changed', () => {
      render(<Pagination {...defaultProps} />);
      
      const select = screen.getByDisplayValue('10');
      fireEvent.change(select, { target: { value: '25' } });
      
      expect(mockOnItemsPerPageChange).toHaveBeenCalledWith(25);
    });

    it('should display correct selected value', () => {
      render(<Pagination {...defaultProps} itemsPerPage={50} />);
      
      const select = screen.getByDisplayValue('50');
      expect(select).toBeInTheDocument();
    });
  });

  describe('Page Navigation', () => {
    it('should call onPageChange when a page number is clicked', () => {
      render(<Pagination {...defaultProps} />);
      
      const pageButton = screen.getByText('2');
      fireEvent.click(pageButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should highlight current page', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);
      
      const currentPageButton = screen.getByText('3');
      expect(currentPageButton).toHaveStyle({ fontWeight: 'bold' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle single page correctly', () => {
      render(<Pagination {...defaultProps} totalPages={1} totalItems={5} />);
      
      expect(screen.getByText(/Showing 1 to 5 of 5 records/i)).toBeInTheDocument();
    });

    it('should handle empty data', () => {
      render(<Pagination {...defaultProps} totalPages={0} totalItems={0} currentPage={1} />);
      
      expect(screen.getByText(/Showing 1 to 0 of 0 records/i)).toBeInTheDocument();
    });

    it('should calculate correct page range for many pages', () => {
      render(<Pagination {...defaultProps} totalPages={100} currentPage={50} />);
      
      // Should show pages around current page (maxVisiblePages = 5)
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label for items per page selector', () => {
      render(<Pagination {...defaultProps} />);
      
      const label = screen.getByText(/Rows per page:/i);
      expect(label).toBeInTheDocument();
    });

    it('should render select element with correct value', () => {
      render(<Pagination {...defaultProps} />);
      
      const select = screen.getByDisplayValue('10');
      expect(select.tagName).toBe('SELECT');
    });
  });
});
