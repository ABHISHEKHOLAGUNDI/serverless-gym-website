export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const { member_id, weight, body_fat, muscle_mass, date } = await request.json();

        await env.DB.prepare(
            "INSERT INTO measurements (member_id, date, weight, body_fat, muscle_mass) VALUES (?, ?, ?, ?, ?)"
        ).bind(member_id, date || new Date().toISOString().split('T')[0], weight, body_fat, muscle_mass).run();

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const memberId = url.searchParams.get('member_id');

    if (!memberId) return Response.json({ error: 'member_id required' }, { status: 400 });

    try {
        const { results } = await env.DB.prepare(
            "SELECT * FROM measurements WHERE member_id = ? ORDER BY date ASC"
        ).bind(memberId).all();
        return Response.json(results);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
