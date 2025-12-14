const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Netlify automatically provides this URL from the Neon extension
const databaseUrl = process.env.NETLIFY_DATABASE_URL;

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    // Get credentials from the request body
    const { username, password } = JSON.parse(event.body);

    const pool = new Pool({
        connectionString: databaseUrl,
    });
    
    let client;

    try {
        client = await pool.connect();
        
        // 1. Fetch the user and password hash from the database
        const result = await client.query(
            'SELECT password_hash FROM users WHERE user_id = $1',
            [username]
        );

        if (result.rows.length === 0) {
            // User not found
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'User not found.' }),
            };
        }

        const storedHash = result.rows[0].password_hash;
        
        // 2. Compare the plain password with the stored hash
        const isMatch = await bcrypt.compare(password, storedHash);

        if (isMatch) {
            // 3. Password matches! Generate a secure token
            const token = jwt.sign({ user: username, role: 'admin' }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });

            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    message: 'Authentication successful!', 
                    token: token 
                }),
            };
        } else {
            // Password mismatch
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Invalid password.' }),
            };
        }
    } catch (error) {
        console.error('Database or Server Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error during login.' }),
        };
    } finally {
        if (client) {
            client.release();
        }
        await pool.end(); // Important to close the pool after use in a serverless function
    }
};
