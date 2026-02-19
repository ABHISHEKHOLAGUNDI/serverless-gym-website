export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { pin } = await request.json();

        // Validate PIN
        if (pin === '123456' || pin === env.ADMIN_PIN) {
            // Create a session cookie
            const sessionValue = btoa(`admin:${pin}:${Date.now()}`);

            return new Response(JSON.stringify({ success: true }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `gym_session=${sessionValue}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
                },
            });
        }

        return new Response(JSON.stringify({ error: 'Invalid PIN Code' }), { status: 401 });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
}
