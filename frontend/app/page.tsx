"use client";

import { AuthProvider } from '@/context/AuthContext';
import { App } from '@/App';

export default function Home() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
