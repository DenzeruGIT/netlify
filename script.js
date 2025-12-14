// --- Replace your existing login logic with this ---

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    // Get credentials from the form inputs
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
            localStorage.setItem('auth_token', data.token); 
            window.location.href = 'authorized.html'; // Redirect to the success page

        } else {
            // FAILURE! Status code is 401 or 500.
            alert('Wrong Credentials');
            document.getElementById('password').value = ''; // Clear password on failure
        }

    } catch (error) {
        console.error('Network or Function Error:', error);
        alert('An error occurred during login. Check console.');
    }
});
