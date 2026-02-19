export async function onRequestGet(context) {
    // If we reached here, the middleware has already validated the session.
    return new Response(JSON.stringify({
        authenticated: true,
        user: { name: 'Owner', role: 'admin' }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
