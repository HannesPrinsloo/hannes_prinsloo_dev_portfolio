import { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './components/LoginForm.tsx';
import Dashboard from './components/Dashboard.tsx';
import { useAuthStore } from '../store/authStore.ts';

// Define a type for a user
interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
};

const App = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn, user, login, logout } = useAuthStore();

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
    return <div className="app">
      Checking authentication status...
    </div>;
  }

  if (error) {
    return <div className="app">
      Error: {error}.<br/>Make sure the backend server is running and accessible at {API_URL}!
    </div>;
  }

  return (
    <div className="app">
      {isLoggedIn ? <Dashboard/> : <LoginForm/>}
    </div>
  );
}

export default App;
