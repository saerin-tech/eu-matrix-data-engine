import { useState, useRef, useEffect } from 'react';
import { FieldSelectorProps, Option } from 'react-querybuilder';

export default function CustomFieldSelector({
    options,
    value,
    handleOnChange,
}: FieldSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const flattenedOptions: Option[] = options.flatMap((option) => {
        if ('options' in option) {
            return option.options as Option[];
        }
        return [option as Option];
    });

    const filteredOptions = flattenedOptions.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedLabel = flattenedOptions.find((opt) => opt.name === value)?.label || 'Select field';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        handleOnChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div ref={dropdownRef} className="relative w-60 bg-white border-1 border-gray-300 p-[3px] rounded ">

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left flex items-center justify-between cursor-pointer 
             bg-white hover:bg-white active:bg-white select-none"
            >
                <span>{selectedLabel}</span>

                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""} ml-2`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>



            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search columns..."
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
                            autoFocus
                        />
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.name}
                                    onClick={() => handleSelect(option.name)}
                                    className={`px-2 py-1.5 cursor-pointer text-sm ${value === option.name ? 'bg-gray-100' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-2 py-1.5 text-gray-500 text-sm">No columns found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}