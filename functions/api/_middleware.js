export async function onRequest(context) {
    const { request, next, env } = context;
    const url = new URL(request.url);

    // Allow Login endpoint to pass through
    if (url.pathname === '/api/auth/login') {
        return next();
    }

    // Check for cookie
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('gym_session=')) {
        return new Response(JSON.stringify({ error: 'Unauthorized: No session' }), { status: 401 });
    }

    // Extract session
    const sessionMatch = cookieHeader.match(/gym_session=([^;]+)/);
    if (!sessionMatch) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Invalid cookie format' }), { status: 401 });
    }

    const sessionValue = sessionMatch[1];

    try {
        // Decode session: "admin:PIN:TIMESTAMP"
        const decoded = atob(sessionValue);
        const [user, pin, timestamp] = decoded.split(':');

        // Verify PIN ( Hardcoded '123456' or ENV)
        const validPin = env.ADMIN_PIN || '123456';

        if (pin !== validPin) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Invalid session' }), { status: 401 });
        }

        // Optional: Check Expiry (e.g., 24 hours)
        const oneDay = 24 * 60 * 60 * 1000;
        if (Date.now() - parseInt(timestamp) > oneDay) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Session expired' }), { status: 401 });
        }

        // Pass to next handler
        return next();

    } catch (e) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Malformed session' }), { status: 401 });
    }
}
