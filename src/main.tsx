/// <reference types="vite/client" />
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const Root = () => {
  if (!PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 font-sans p-8 flex items-center justify-center">
        <div className="max-w-md p-8 border border-zinc-800 rounded-xl bg-[#121213] text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">Authentication Missing</h1>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            Please add your <code className="font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> to the system secrets to enable user accounts.
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
