import Pagination from './Pagination';
import { Info } from 'lucide-react';

interface Props {
  data: any[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  queryExecuted: boolean; 
}

export default function ResultsTable({
  data,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  queryExecuted
}: Props) {
  // Don't show anything if query hasn't been executed yet
  if (!queryExecuted) return null;
  
  if (data.length === 0) {
    return (
      <div className="border border-blue-200 rounded-lg mb-5 bg-blue-50 p-8">
        <div className="flex items-center justify-center gap-3 text-blue-700">
          <Info className="w-6 h-6" />
          <div>
            <p className="font-semibold text-lg">No Results Found</p>
            <p className="text-sm text-blue-600 mt-1">
              Your query executed successfully but returned no matching records. Try adjusting your filters.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const columns = Object.keys(data[0]);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="border border-gray-300 rounded-lg mb-5 bg-white overflow-hidden">
      <div className="p-5 border-b border-gray-300 bg-gray-50">
        <h2 className="m-0 text-xl font-semibold text-gray-800">
          Results ({data.length} total records)
        </h2>
      </div>

      <div className="overflow-x-auto max-w-full">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className="px-4 py-3 text-left border-b-2 border-gray-300 text-gray-700 font-semibold text-sm whitespace-nowrap sticky top-0 bg-gray-50 z-10"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={`transition-colors ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-200`}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex}
                    className="px-4 py-3 border-b border-gray-300 text-gray-800 text-sm max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {typeof row[column] === 'object' 
                      ? JSON.stringify(row[column]) 
                      : String(row[column] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        totalItems={data.length}
      />
    </div>
  );
}