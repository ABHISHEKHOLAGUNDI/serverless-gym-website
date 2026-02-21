// Admin-side chat management
// GET all conversations (grouped by member) or a specific member's chat
// POST reply to a member

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const memberId = url.searchParams.get('member_id');

    try {
        if (memberId) {
            // Get specific member's chat history
            const { results } = await env.DB.prepare(
                "SELECT id, sender, message, created_at FROM chat_messages WHERE member_id = ? ORDER BY created_at ASC"
            ).bind(memberId).all();
            return Response.json(results || []);
        } else {
            // Get all conversations with latest message
            const { results } = await env.DB.prepare(`
                SELECT cm.member_id, m.name, m.photo, cm.message as last_message, cm.created_at as last_time, cm.sender,
                       (SELECT COUNT(*) FROM chat_messages WHERE member_id = cm.member_id) as total_messages
                FROM chat_messages cm
                JOIN members m ON m.id = cm.member_id
                WHERE cm.id IN (SELECT MAX(id) FROM chat_messages GROUP BY member_id)
                ORDER BY cm.created_at DESC
            `).all();
            return Response.json(results || []);
        }
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { memberId, message } = await request.json();
        if (!memberId || !message?.trim()) {
            return Response.json({ error: 'memberId and message are required' }, { status: 400 });
        }

        await env.DB.prepare(
            "INSERT INTO chat_messages (member_id, sender, message) VALUES (?, 'owner', ?)"
        ).bind(memberId, message.trim()).run();

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
