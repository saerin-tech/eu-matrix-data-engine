import Button from './shared/Button';
import Select from './shared/Select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
}


export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}: PaginationProps) {

  const pageNumbers: number[] = [];
  const maxVisiblePages = 5;
  
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

  // Items per page options
  const itemsPerPageOptions = [
    { value: 10, label: '10' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' }
  ];

  return (
    <div className="flex flex-col gap-4 p-5 bg-white border-t border-gray-300 rounded-b-lg">
      {/* Top Section: Items per page selector and info */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        {/* Items Per Page Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Rows per page:
          </span>
          <Select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            options={itemsPerPageOptions}
          />
        </div>

        {/* Records Info */}
        <div className="text-sm text-gray-600 font-medium">
          Showing {startItem} to {endItem} of {totalItems} records
        </div>
      </div>

      {/* Bottom Section: Page Navigation Buttons */}
      <div className="flex justify-center items-center gap-2 flex-wrap">
        {/* First Page */}
        <Button 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1}
          variant="secondary"
          size="sm"
        >
          ««
        </Button>

        {/* Previous Page */}
        <Button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          variant="secondary"
          size="sm"
        >
          « Previous
        </Button>

        {/* Ellipsis before page numbers */}
        {startPage > 1 && (
          <span className="text-gray-400 px-2">...</span>
        )}

        {/* Page Number Buttons */}
        {pageNumbers?.map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            variant={currentPage === page ? 'primary' : 'secondary'}
            size="sm"
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <span className="text-gray-400 px-2">...</span>
        )}

        {/* Next Page */}
        <Button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          variant="secondary"
          size="sm"
        >
          Next »
        </Button>

        {/* Last Page */}
        <Button 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages}
          variant="secondary"
          size="sm"
        >
          »»
        </Button>
      </div>
    </div>
  );
}