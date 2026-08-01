import { Footer } from '@/common/footer';
import MegaMenu from '@/common/mega-menu';
import { AuthProvider } from '@/contexts/auth-context';
import React from 'react';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {/* <Navbar /> */}
      <MegaMenu logo='W' companyName='WealthAlgor' />
      {children}
      <Footer />
    </AuthProvider>
  );
};

export default layout;
