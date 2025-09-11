import React, { useCallback, useRef } from 'react';

interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

interface DebounceManagerProps {
  children: React.ReactNode;
}

export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const funcRef = useRef(func);
  
  // Update function reference
  funcRef.current = func;

  const debouncedFunc = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      funcRef.current(...args);
    }, delay);
  }, [delay]) as DebouncedFunction<T>;

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  debouncedFunc.cancel = cancel;

  return debouncedFunc;
}

export const DebounceManager: React.FC<DebounceManagerProps> = ({ children }) => {
  return <>{children}</>;
};