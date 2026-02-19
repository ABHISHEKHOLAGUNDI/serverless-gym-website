export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { username, password } = await request.json();

        // Verification against Environment Variables
        if (
            username === env.ADMIN_USERNAME &&
            password === env.ADMIN_PASSWORD
        ) {
            // Create a session cookie (simple implementation for single user)
            // In production, sign this with a secret
            const sessionValue = btoa(`${username}:${password}:${Date.now()}`); // Simple encoding for demo

            return new Response(JSON.stringify({ success: true }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `gym_session=${sessionValue}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
                },
            });
        }

        return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
}
