/// <reference types="vite/client" />
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_bGl2aW5nLWVhcndpZy0xMC5jbGVyay5hY2NvdW50cy5kZXYk";

const Root = () => {
  if (!PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans p-8 flex items-center justify-center relative overflow-hidden">
        {/* Background blobs for auth screen */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>
        
        <div className="max-w-md p-8 border border-border/50 rounded-2xl bg-card/60 backdrop-blur-xl text-center relative z-10 shadow-2xl">
          <h1 className="text-2xl font-semibold text-foreground mb-4 tracking-tight">Authentication Missing</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Please add your <code className="font-mono text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">VITE_CLERK_PUBLISHABLE_KEY</code> to the system secrets to enable user accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
