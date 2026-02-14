import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore.ts';
import '../App.css';
import AdminDashboard from './AdminDashboard.tsx'
import TeacherDashboard from './TeacherDashboard.tsx';
import ManagerDashboard from './ManagerDashboard.tsx';
import ProfileHeader from './ProfileHeader.tsx';

// Define a type for a user
//NEW Not necessary as the UserData and its type definition live in the zustand store CAN DELETE
// interface UserData {
//   user_id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   role_id: number;
// };

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    //New: Changed userData from local state to Zustand to make the full user profile 
    //acessible to the entire app 👇 commented out local state hook below
    // const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user, profile, setProfile, logout } = useAuthStore();



    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                logout();
                if (user) {
                    console.log(`User with ID ${user.user_id}, logged out successfully`);
                }
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error("Network error during logout:", error);
        }
    };

    const getCurrentUserData = async () => {
        if (!user || !user.user_id) {
            setError("Authentication error: User ID not found");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/users/${user.user_id}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const result = await response.json();
                setProfile(result);
                setError(null);
            } else if (response.status === 401 || response.status === 403) {
                logout();
                setError("Invalid session token. Please log in again.");
            } else {
                setError("Failed to load user data from the server.");
            }
        } catch (err) {
            console.error("Network error fetching dashboard data:", err);
            setError("Network error while loading dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile) {
            setLoading(false);
            return;
        }
        getCurrentUserData();
    }, [user, profile]);

    if (loading) {
        return <div className="dashboard-loading">Loading your dashboard...</div>;
    }

    if (error) {
        return <div className="dashboard-error">Error: {error}</div>;
    }

    if (!profile) {
        return <div className="dashboard-error">User data could not be loaded. Please try again.</div>;
    }

    const roleName = profile.role_id === 1
        ? "Admin"
        : profile.role_id === 2
            ? "Teacher"
            : profile.role_id === 3
                ? "Manager"
                : "Student";

    const getDashboardAccordingToRole = () => {
        switch (profile.role_id) {
            case 1:
                return <AdminDashboard />;
            case 2:
                return <TeacherDashboard />;
            case 3:
                return <ManagerDashboard />;
        }
    }

    return (
        <div>
            <ProfileHeader
                profile={profile}
                role={roleName}
                onLogout={handleLogout}
            />
            {getDashboardAccordingToRole()}<br></br>

            {/* Mobile Logout Button (Bottom) - Desktop has it in the header */}
            <div className="mobile-only-logout">
                <button className="btn-secondary" onClick={handleLogout} style={{ width: '100%', maxWidth: '200px', margin: '20px auto', display: 'block' }}>Log Out</button>
            </div>
        </div>
    );
}

export default Dashboard;