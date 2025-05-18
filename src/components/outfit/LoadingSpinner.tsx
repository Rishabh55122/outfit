import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export default function LoadingSpinner({ size = 48, text = "Processing..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 py-8">
      <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} />
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
}