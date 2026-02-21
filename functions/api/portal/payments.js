export async function onRequestGet(context) {
    const { env, data } = context;
    const memberId = data?.memberId;
    if (!memberId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, type, amount, date, category, description FROM finances WHERE description LIKE ? ORDER BY date DESC"
        ).bind(`%member:${memberId}%`).all();

        return Response.json(results || []);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
