export const login = async (username, password) => {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/login/', {  // Django 서버의 로그인 엔드포인트 URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error('Failed to login');
        }

        const data = await response.json();

        if (data.success) {
            return { success: true, message: data.message };
        } else {
            return { success: false, message: data.message || 'Login failed' };
        }
    } catch (error) {
        console.error('Error during login:', error);
        return { success: false, message: 'Login failed' };
    }
};