export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare(
            "SELECT * FROM finances ORDER BY date DESC LIMIT 100"
        ).all();
        return Response.json(results);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const { type, amount, description, date, category } = await request.json();

        const info = await env.DB.prepare(
            "INSERT INTO finances (type, amount, description, date, category) VALUES (?, ?, ?, ?, ?)"
        ).bind(type, amount, description, date || new Date().toISOString().split('T')[0], category).run();

        return Response.json({ success: true, id: info.lastRowId }, { status: 201 });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
