import { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './components/LoginForm.tsx';
import Dashboard from './components/Dashboard.tsx';
import { useAuthStore } from '../store/authStore.ts';



const App = () => {
  const [authLoading, setAuthLoading] = useState(true);

  const { isLoggedIn, login } = useAuthStore();

  // Get the API URL from the environment variable
  const API_URL = import.meta.env.VITE_API_URL;



  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/checkMe`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();

          login(result.user.user_id);
          console.log("Authentication successful, user ID is:", result.user.user_id);
        } else {
          const errorResult = await response.json();
          console.error('Check for authToken failed', errorResult);
        }
      } catch (error) {
        console.error('Network error during check for authToken', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthStatus();
  }, []); // Run only once

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-bg-light text-text-dark relative overflow-x-hidden">
        Checking authentication status...
      </div>
    );
  }



  return (
    // CHANGELOG: Replaced '.app' with Tailwind baseline layout utilities (min-h-screen, colors, flexbox).
    <div className="min-h-screen w-full flex flex-col items-center bg-bg-light text-text-dark relative overflow-x-hidden">
      {isLoggedIn ? <Dashboard /> : <LoginForm />}
    </div>
  );
}

export default App;
