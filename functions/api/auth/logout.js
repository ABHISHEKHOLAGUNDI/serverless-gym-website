export async function onRequestPost(context) {
    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': 'gym_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0', // Clear cookie
        },
    });
}
