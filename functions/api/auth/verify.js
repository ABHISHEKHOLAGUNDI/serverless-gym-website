export async function onRequestGet(context) {
    const { request } = context;

    // Decode session to determine role
    const cookieHeader = request.headers.get('Cookie');
    const sessionMatch = cookieHeader?.match(/gym_session=([^;]+)/);

    if (!sessionMatch) {
        return new Response(JSON.stringify({ error: 'No session' }), { status: 401 });
    }

    try {
        const decoded = atob(sessionMatch[1]);
        const parts = decoded.split(':');
        const role = parts[0];

        if (role === 'admin') {
            return Response.json({
                authenticated: true,
                user: { name: 'Owner', role: 'admin' }
            });
        } else if (role === 'member') {
            const memberId = parseInt(parts[1]);
            const memberName = parts[2];
            return Response.json({
                authenticated: true,
                user: { name: memberName, role: 'member', memberId }
            });
        }

        return Response.json({ error: 'Unknown role' }, { status: 401 });
    } catch (e) {
        return Response.json({ error: 'Invalid session' }, { status: 401 });
    }
}
