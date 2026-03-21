import React from 'react';
import { AuthProvider } from '@/contexts/auth-context';

const layout = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default layout;
