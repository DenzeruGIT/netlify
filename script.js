// --- COMPLETE LOGIN FORM SUBMISSION HANDLER ---

loginForm.addEventListener('submit', async (e) => {
    // 1. Stop the page from refreshing
    e.preventDefault(); 

    // Get the credentials the user typed
    // IMPORTANT: These IDs must match your HTML input fields
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    try {
        // 2. SEND DATA TO YOUR NETLIFY SERVERLESS FUNCTION
        // This is the CRITICAL line that connects the button to the backend security code!
        const response = await fetch('/.netlify/functions/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Send the credentials as JSON data
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        // 3. HANDLE THE RESPONSE FROM THE SERVER
        if (response.ok) {
            // SUCCESS! Login is valid.
            alert('Login Successful! Welcome!');
            
            // SAVE THE SECURE TOKEN (JWT)
            localStorage.setItem('auth_token', data.token); 
            
            // REDIRECT TO THE ADMIN PAGE (or wherever your portal is)
            window.location.href = 'front.html'; 

        } else {
            // FAILURE! Invalid username or password.
            alert('Login Failed: ' + data.message);
        }

    } catch (error) {
        console.error('Network or Function Error:', error);
        alert('An error occurred during login. Please ensure your Netlify function is deployed correctly.');
    }
});
