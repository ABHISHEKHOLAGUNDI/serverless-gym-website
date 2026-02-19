export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const { member_id, status, date } = await request.json();
        const today = date || new Date().toISOString().split('T')[0];

        await env.DB.prepare(
            "INSERT INTO attendance (member_id, date, status) VALUES (?, ?, ?)"
        ).bind(member_id, today, status).run();

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestGet(context) {
    const { env } = context;
    // Get today's attendance by default
    const today = new Date().toISOString().split('T')[0];
    try {
        const { results } = await env.DB.prepare(
            "SELECT a.*, m.name FROM attendance a JOIN members m ON a.member_id = m.id WHERE date = ?"
        ).bind(today).all();
        return Response.json(results);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
