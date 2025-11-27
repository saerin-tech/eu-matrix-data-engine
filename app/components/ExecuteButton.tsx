import { Search, Loader } from 'lucide-react';

interface Props {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function ExecuteButton({ loading, disabled, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white border-none rounded-md cursor-pointer text-sm sm:text-base font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-blue-600/30"
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <Search className="w-4 h-4" />
          <span>Execute Query</span>
        </>
      )}
    </button>
  );
}