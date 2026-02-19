export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const { type, amount, description, date } = await request.json();

        await env.DB.prepare(
            "INSERT INTO finances (type, amount, description, date) VALUES (?, ?, ?, ?)"
        ).bind(type, amount, description, date || new Date().toISOString().split('T')[0]).run();

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare(
            "SELECT * FROM finances ORDER BY date DESC LIMIT 50"
        ).all();
        return Response.json(results);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
