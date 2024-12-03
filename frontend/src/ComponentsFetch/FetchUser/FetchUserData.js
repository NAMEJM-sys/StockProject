

const FetchUserData = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/users_data/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error User Data:', error);
    }
};

export default FetchUserData;