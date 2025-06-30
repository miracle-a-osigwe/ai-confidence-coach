import { useState, useCallback, useRef } from 'react';

export function useOptimizedState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const stateRef = useRef<T>(initialState);

  const setOptimizedState = useCallback((newState: T | ((prev: T) => T)) => {
    setState(prevState => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prevState)
        : newState;
      
      stateRef.current = nextState;
      return nextState;
    });
  }, []);

  const getCurrentState = useCallback(() => stateRef.current, []);

  return [state, setOptimizedState, getCurrentState] as const;
}