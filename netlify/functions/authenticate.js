// netlify/functions/authenticate.js
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Variables are pulled securely from Netlify Environment settings
const JWT_SECRET = process.env.JWT_SECRET;
// We use NETLIFY_DATABASE_URL because Neon sets this variable up automatically
const CONNECTION_STRING = process.env.NETLIFY_DATABASE_URL; 

exports.handler = async (event) => {
    // Only process POST requests from the login form
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Extract credentials securely
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Missing credentials.' }) };
    }
    
    // Connect to the Neon database
    const client = new Client({ connectionString: CONNECTION_STRING });

    try {
        await client.connect();

        // 1. Fetch user data (hash and role)
        // Checks the 'users' table you created in the SQL Editor
        const res = await client.query('SELECT user_id, password_hash, role FROM users WHERE user_id = $1', [username]);

        if (res.rows.length === 0) {
            return { statusCode: 401, body: JSON.stringify({ message: 'User not found.' }) };
        }

        const user = res.rows[0];
        
        // 2. SECURE HASH COMPARISON
        // Compares the plain password against the secure hash from the database
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return { statusCode: 401, body: JSON.stringify({ message: 'Invalid password.' }) };
        }

        // 3. GENERATE JSON WEB TOKEN (JWT) using the secret key from Netlify
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' } 
        );

        // Success response
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Login successful', 
                token: token,
                role: user.role
            })
        };

    } catch (error) {
        console.error('Database or Server Error:', error);
        return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error.' }) };
    } finally {
        // Always close the database connection
        await client.end();
    }
};