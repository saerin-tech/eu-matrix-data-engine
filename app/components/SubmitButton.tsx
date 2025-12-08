import { Loader } from "lucide-react";

interface SubmitButtonProps {
  loading: boolean;
  disabled: boolean;
  text: string;
  icon?: React.ReactNode;
}

export default function SubmitButton({
  loading,
  disabled,
  text,
  icon
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`w-full px-6 py-3 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {loading ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {icon}
          {text}
        </>
      )}
    </button>
  );
}
