import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ClerkApp() {
  const { getToken, isSignedIn } = useAuth();
  return <App getAdminToken={getToken} isAdminSignedIn={Boolean(isSignedIn)} />;
}

const app = clerkPublishableKey ? (
  <ClerkProvider publishableKey={clerkPublishableKey}>
    <ClerkApp />
  </ClerkProvider>
) : (
  <App />
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {app}
  </StrictMode>,
);
