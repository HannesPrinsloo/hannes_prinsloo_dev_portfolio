import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    const { user, profile, setProfile, logout } = useAuthStore();
    const queryClient = useQueryClient();



    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                queryClient.clear(); // Clear all cached React Query data across the app
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

    const { data: userData, isLoading, isError, error: queryError } = useQuery({
        queryKey: ['currentUser', user?.user_id],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/api/users/${user?.user_id}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    queryClient.clear();
                    logout();
                    throw new Error("Invalid session token. Please log in again.");
                }
                throw new Error("Failed to load user data from the server.");
            }
            return response.json();
        },
        enabled: !!user?.user_id,
        refetchInterval: 60000 // Poll every 1 minute for role changes
    });

    // Bridge React Query state with Zustand for child components
    useEffect(() => {
        if (userData) {
            setProfile(userData);
        }
    }, [userData, setProfile]);

    if (isLoading && !profile) {
        return <div className="dashboard-loading">Loading your dashboard...</div>;
    }

    if (isError) {
        return <div className="dashboard-error">Error: {queryError?.message || 'Failed to load user data'}</div>;
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
        /* CHANGELOG: Refactored Dashboard container and mobile logout button to use Tailwind layout and spacing utilities instead of inline styles and App.css classes. */
        <div className="w-full max-w-7xl mx-auto md:p-5 box-border pb-20 md:pb-5">
            <ProfileHeader
                profile={profile}
                role={roleName}
                onLogout={handleLogout}
            />
            {getDashboardAccordingToRole()}<br></br>

            {/* Mobile Logout Button (Bottom) - Desktop has it in the header */}
            <div className="block md:hidden pb-5">
                <button
                    className="bg-transparent text-[#666] border border-[#ccc] px-4 py-2 rounded mt-5 mx-auto block w-full max-w-[200px]"
                    onClick={handleLogout}
                >
                    Log Out
                </button>
            </div>
        </div>
    );
}

export default Dashboard;