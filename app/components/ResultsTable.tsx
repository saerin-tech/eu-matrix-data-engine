import { Info, Download } from 'lucide-react';
import { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Button from './shared/Button';
import { Table, TableHeader, TableCell, TableRow } from './shared/Table';
import Pagination from './Pagination';

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
  const [isExporting, setIsExporting] = useState(false);

  // Excel export function
  const exportToExcel = async () => {
    if (data.length === 0) return;
    
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Results');
      
      const columns = Object.keys(data[0]);
      
      worksheet.columns = columns?.map(col => ({
        header: col,
        key: col,
        width: 20
      }));
      
      // Style header row
      worksheet.getRow(1).font = { 
        bold: true, 
        size: 12,
        color: { argb: 'FFFFFFFF' }
      };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      worksheet.getRow(1).alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
      };
      worksheet.getRow(1).height = 25;
      
      // Add all data rows (complete data, no pagination)
      data.forEach((row) => {
        const rowData: any = {};
        columns.forEach(col => {
          if (typeof row[col] === 'object' && row[col] !== null) {
            rowData[col] = JSON.stringify(row[col]);
          } else {
            rowData[col] = row[col] ?? '';
          }
        });
        worksheet.addRow(rowData);
      });
      
      // Style data rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { 
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } }
            };
          });
          
          // Alternate row colors
          if (rowNumber % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF5F5F5' }
            };
          }
        }
      });
      
      // Add filters to header row
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: columns.length }
      };
      
      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      saveAs(blob, `query-results-${timestamp}.xlsx`);
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

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
    <div className="border border-gray-300 rounded-lg mb-5 bg-white overflow-hidden px-5">
      <div className="p-8 border-b border-gray-300 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
        <h2 className="m-0 text-xl font-semibold text-gray-800">
          Results ({data.length} total records)
        </h2>
        
        <Button
          onClick={exportToExcel}
          disabled={isExporting}
          variant="success"
          icon={<Download className="w-4 h-4" />}
          loading={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export to Excel'}
        </Button>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto max-w-full">
        <table className="w-full border-collapse min-w-[600px] border-2">
          <thead>
            <TableRow hoverable={false}>
              {columns?.map((column, index) => (
                <TableHeader key={index}>
                  {column}
                </TableHeader>
              ))}
            </TableRow>
          </thead>
          <tbody>
            {currentData?.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns?.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {typeof row[column] === 'object' 
                      ? JSON.stringify(row[column]) 
                      : String(row[column] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
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