import React, { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService'; // authService에서 login 함수 가져오기
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('login');

        return () => {
            document.body.classList.remove('login');
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await login(username, password);

        if (response.success) {
            navigate('/Home'); // 로그인 성공 시 이동할 페이지
        } else {
            setError(response.message);
        }
    };

    return (
        <>
            <button onClick={() => navigate('/signup')} className="signup-button">
                Sign Up
            </button>
            <div className="login-container">
                <h2>ProStock</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        autoComplete="current-password"
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">Login</button>
                </form>
            </div>
        </>
    );
}

export default Login;