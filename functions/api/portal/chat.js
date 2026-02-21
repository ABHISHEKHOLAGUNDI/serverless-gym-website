// Member-side chat endpoint
export async function onRequestGet(context) {
    const { env, data } = context;
    const memberId = data?.memberId;
    if (!memberId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, sender, message, created_at FROM chat_messages WHERE member_id = ? ORDER BY created_at ASC"
        ).bind(memberId).all();

        return Response.json(results || []);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env, data } = context;
    const memberId = data?.memberId;
    if (!memberId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { message } = await request.json();
        if (!message?.trim()) return Response.json({ error: 'Message is required' }, { status: 400 });

        await env.DB.prepare(
            "INSERT INTO chat_messages (member_id, sender, message) VALUES (?, 'member', ?)"
        ).bind(memberId, message.trim()).run();

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
