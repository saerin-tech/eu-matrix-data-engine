import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ValueEditorProps } from 'react-querybuilder';
import { Loader } from 'lucide-react';

// Constants
const BLUR_DELAY = 200;
const NO_VALUE_OPERATORS = ['is null', 'is not null'];

export default function CustomValueEditor({
    value,
    handleOnChange,
    fieldData,
    operator,
    field,
}: ValueEditorProps) {
    // State
    const [searchTerm, setSearchTerm] = useState(value || '');
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);

    // Early return for operators that don't need values
    if (NO_VALUE_OPERATORS.includes(operator)) return null;

    // Helper: Extract table and column
    const { tableName, columnName } = useMemo(() => {
        const fieldStr = field || '';

        if (fieldStr.includes('.')) {
            const [table, column] = fieldStr.split('.');
            return { tableName: table, columnName: column };
        }

        return {
            tableName: fieldData?.tableName || '',
            columnName: fieldData?.name || fieldStr
        };
    }, [field, fieldData]);

    // Helper: Check if numeric field
    const isNumericField = useMemo(() => {
        const dataType = (fieldData?.dataType as string)?.toLowerCase() || '';
        return ['number', 'int', 'integer', 'float', 'decimal', 'numeric', 'bigint', 'double'].some(
            type => dataType.includes(type)
        );
    }, [fieldData]);

    // API call with useCallback to prevent unnecessary re-renders
    const fetchSuggestions = useCallback(async (term: string) => {
        if (!tableName || !columnName) return;

        setLoading(true);

        try {
            const response = await fetch('/api/column-values', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableName,
                    columnName,
                    searchTerm: term,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuggestions(data.values || []);
                setIsOpen(true);
            } else {
                console.error('API Error:', data);
                setSuggestions([]);
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setSuggestions([]);
            setIsOpen(true);
        } finally {
            setLoading(false);
        }
    }, [tableName, columnName]);

    // Auto-fetch on odd character counts
    useEffect(() => {
        const trimmedTerm = searchTerm.trim();

        if (trimmedTerm.length > 0 && trimmedTerm.length % 2 !== 0) {
            fetchSuggestions(trimmedTerm);
        } else if (trimmedTerm.length === 0) {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [searchTerm, fetchSuggestions]);

    // Event handlers
    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setTimeout(() => setIsOpen(false), BLUR_DELAY);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        // Validate numeric input
        if (isNumericField && newValue !== '' && newValue !== '-') {
            if (!/^-?\d*\.?\d*$/.test(newValue)) return;
        }

        setSearchTerm(newValue);
        handleOnChange(newValue);
        if (newValue.trim()) setIsOpen(true);
    };

    const handleInputFocus = () => {
        if (suggestions.length > 0) setIsOpen(true);
    };

    const handleOptionSelect = (val: string) => {
        setSearchTerm(val);
        handleOnChange(val);
        setIsOpen(false);
    };

    // Filtered suggestions with memoization
    const filteredSuggestions = useMemo(
        () => suggestions.filter(s =>
            String(s).toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [suggestions, searchTerm]
    );

    // Show dropdown condition
    const shouldShowDropdown = isOpen && (loading || suggestions.length >= 0);

    return (
        <div
            ref={containerRef}
            tabIndex={0}
            onBlur={handleBlur}
            className="relative min-w-[150px]"
        >
            <input
                type={isNumericField ? "number" : "text"}
                value={searchTerm || ''}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder={isNumericField ? "Enter number..." : "Type to search..."}
                className="w-full bg-slate-900 text-slate-200 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {shouldShowDropdown && (
                <div
                    className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded shadow-lg max-h-48 overflow-y-auto"
                    onMouseDown={e => e.stopPropagation()}
                >
                    {loading ? (
                        <div className="px-3 py-2 text-slate-400 text-sm flex items-center gap-2">
                            <Loader className="w-3 h-3 animate-spin" />
                            Searching...
                        </div>
                    ) : filteredSuggestions.length > 0 ? (
                        filteredSuggestions?.map((suggestion, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleOptionSelect(String(suggestion))}
                                className="px-3 py-1.5 cursor-pointer text-sm text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                {String(suggestion)}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-slate-400 text-sm">
                            No matching values found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}