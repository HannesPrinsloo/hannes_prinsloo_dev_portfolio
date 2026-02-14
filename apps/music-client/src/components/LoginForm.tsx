import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import '../App.css';

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
        <form onSubmit={handleSubmit}>
            <h1>Vinnige Swallow 15 Demo App</h1>
            <h3>Vir Kobus, en ander mense wat hy dalk wil wys 😉</h3>
            <label htmlFor="email">Email</label><br />
            <input
                type="email"
                id="email"
                value={email}
                name="username"
                onChange={handleEmailChange}
                autoComplete="username"
            /><br /><br />
            <label htmlFor="password">Password</label><br />
            <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
            /><br /><br />
            <button type="submit">Submit</button>
        </form>
    );
}

export default LoginForm;