interface SelectInputProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export default function SelectInput({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder = "Select Option"
}: SelectInputProps) {
  return (
    <div>
      <label className="block mb-2 text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
      >
        <option value="" disabled>{placeholder}</option>

        {options?.map((o) => (
          <option key={o?.value} value={o?.value}>
            {o?.label}
          </option>
        ))}
      </select>
    </div>
  );
}
