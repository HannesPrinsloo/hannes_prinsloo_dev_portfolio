import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import '../App.css';
import logo from '../assets/swallow-15-logo.png';

const LoginForm = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const { login } = useAuthStore();


    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Submitted email:', email);
        console.log('Submitted password:', password);

        const loginData = {
            email: email,
            password_hash: password
        };

        const API_URL = import.meta.env.VITE_API_URL;
        console.log(API_URL, "API_URL");

        try {
            console.log("Checking what's getting sent -->", JSON.stringify(loginData))
            const response = await fetch(`${API_URL}/api/logins`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
                credentials: 'include',
            });

            if (response.ok) {
                const result = await response.json();

                //TODO: Redirect user or store a token
                login(result.user_id)
                console.log("RESULT", result.user_id);
            } else {
                //Login failed (e.g., status 401)
                const errorResult = await response.json();
                console.error('Login failed:', errorResult.error);
                //TODO: Display an error message to user
            }
        } catch (error) {
            console.error('Network error during login:', error);
            //TODO: Handle network-related errors (e.g., server is down)
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mt-10 md:mt-24 px-4">
            <div className="bg-[#f0f0f0] p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#ddd]">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
                    <div className="text-center mb-4">
                        <img src={logo} alt="Swallow 15 Logo" className="mx-auto mb-4 w-24 h-auto object-contain" />
                        <h1 className="text-2xl md:text-3xl font-bold text-text-dark mb-2 leading-tight">Swallow 15 Demo</h1>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-semibold text-[#444] tracking-wide">Email</label>
                        <input
                            className="w-full px-4 py-3 rounded-lg border border-[#ddd] bg-[#fdfdfd] text-[#333] focus:border-primary-red focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder-[#999]"
                            type="email"
                            id="email"
                            value={email}
                            name="username"
                            onChange={handleEmailChange}
                            autoComplete="username"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="flex flex-col gap-2 mb-2">
                        <label htmlFor="password" className="text-sm font-semibold text-[#444] tracking-wide">Password</label>
                        <input
                            className="w-full px-4 py-3 rounded-lg border border-[#ddd] bg-[#fdfdfd] text-[#333] focus:border-primary-red focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder-[#999]"
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={handlePasswordChange}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-red text-white py-3.5 rounded-lg font-semibold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(239,68,68,0.3)] mt-2"
                    >
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;