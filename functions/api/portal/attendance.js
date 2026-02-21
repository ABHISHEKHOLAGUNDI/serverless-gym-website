export async function onRequestGet(context) {
    const { env, data } = context;
    const memberId = data?.memberId;
    if (!memberId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, date, status FROM attendance WHERE member_id = ? ORDER BY date DESC LIMIT 90"
        ).bind(memberId).all();

        return Response.json(results || []);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
