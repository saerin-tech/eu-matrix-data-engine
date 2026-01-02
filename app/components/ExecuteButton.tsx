import { Search, Loader } from 'lucide-react';
import Button from './shared/Button';

interface Props {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function ExecuteButton({ loading, disabled, onClick }: Props) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant='primary'
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
    </Button>
  );
}