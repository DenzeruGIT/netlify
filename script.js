// --- COMPLETE LOGIN FORM SUBMISSION HANDLER (Final Version) ---

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    try {
        // Send data to the secure Netlify Function
        const response = await fetch('/.netlify/functions/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        // HANDLE THE RESPONSE
        if (response.ok) {
            // SUCCESS! Status code is 200.
            
            // 1. Save the secure token
            localStorage.setItem('auth_token', data.token); 
            
            // 2. REDIRECT TO THE NEW SUCCESS PAGE
            window.location.href = 'authorized.html'; 

        } else {
            // FAILURE! Status code is 401 or 500.
            
            // 1. Display the custom error message you requested
            alert('Wrong Credentials');
            
            // OPTIONAL: Clear the password field after failure
            document.getElementById('password').value = ''; 
        }

    } catch (error) {
        console.error('Network or Function Error:', error);
        alert('An error occurred during login. Check console.');
    }
});
