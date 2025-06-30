// context/AuthContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth'; // Rename the import to avoid name clash

// 1. Define the shape of the context value.
// We can get this automatically from the return type of our hook!
type AuthContextType = ReturnType<typeof useAuthHook>;

// 2. Create the context with a default value of null.
const AuthContext = createContext<AuthContextType | null>(null);

// 3. Create the Provider component.
// This component will wrap our app, call the hook once, and provide the value.
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook(); // The hook is called ONLY here
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. Create a custom hook to easily consume the context.
// This is the hook that our components will use.
export function useAuth() {
  const context = useContext(AuthContext);

  // This error is helpful for debugging. It will fire if you try to use
  // useAuth() in a component that isn't wrapped in <AuthProvider>.
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}