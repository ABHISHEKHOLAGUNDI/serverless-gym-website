export async function onRequest(context) {
    const { request, next, env } = context;
    const url = new URL(request.url);

    // Allow Login and Logout endpoints to pass through
    if (url.pathname === '/api/auth/login' || url.pathname === '/api/auth/logout') {
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
        const decoded = atob(sessionValue);
        const parts = decoded.split(':');
        const role = parts[0]; // "admin" or "member"
        const timestamp = parseInt(parts[parts.length - 1]);

        // Check Expiry (24 hours)
        const oneDay = 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp > oneDay) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Session expired' }), { status: 401 });
        }

        if (role === 'admin') {
            // Admin session: "admin:PIN:timestamp"
            const pin = parts[1];
            const validPin = env.ADMIN_PIN || '123456';
            if (pin !== validPin) {
                return new Response(JSON.stringify({ error: 'Unauthorized: Invalid admin session' }), { status: 401 });
            }
            // Store role info for downstream handlers
            context.data = { role: 'admin' };

        } else if (role === 'member') {
            // Member session: "member:MEMBER_ID:MEMBER_NAME:timestamp"
            const memberId = parseInt(parts[1]);
            const memberName = parts[2];

            // Members can only access portal endpoints and auth endpoints
            const allowedPaths = ['/api/auth/verify', '/api/auth/logout', '/api/portal/'];
            const isAllowed = allowedPaths.some(p => url.pathname.startsWith(p));

            if (!isAllowed) {
                return new Response(JSON.stringify({ error: 'Unauthorized: Members cannot access admin endpoints' }), { status: 403 });
            }

            context.data = { role: 'member', memberId, memberName };

        } else {
            return new Response(JSON.stringify({ error: 'Unauthorized: Unknown role' }), { status: 401 });
        }

        return next();

    } catch (e) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Malformed session' }), { status: 401 });
    }
}
