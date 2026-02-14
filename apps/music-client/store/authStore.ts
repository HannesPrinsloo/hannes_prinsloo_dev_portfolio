import { create } from 'zustand';

interface UserData {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    role_id: number;
    is_active: boolean;
};

interface AuthState {
    isLoggedIn: boolean;
    //Minimal user info for initial auth check
    user: { user_id: number } | null;
    //Might need to add more here later, not sure yet
    //New: Holds full user profile details once fetched
    profile: UserData | null;
}

interface AuthActions {
    login: (userId: number) => void;
    //New: Action to save profile (userData)
    setProfile: (data: UserData) => void;
    logout: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
    isLoggedIn: false,
    user: null,
    //New
    profile: null,

    login: (userId) => set({
        isLoggedIn: true, 
        user: { user_id: userId} 
    }),
    //New
    setProfile: (data) => set({
        profile: data
    }),

    logout: () => set({
        isLoggedIn: false, 
        user: null,
        //New
        profile: null
     }),
}));