export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare(
            "SELECT * FROM trainers ORDER BY name ASC"
        ).all();
        return Response.json(results);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const { name, specialty, phone } = await request.json();
        const info = await env.DB.prepare(
            "INSERT INTO trainers (name, specialty, phone) VALUES (?, ?, ?)"
        ).bind(name, specialty, phone).run();
        return Response.json({ id: info.lastRowId, message: "Trainer added" }, { status: 201 });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

    try {
        await env.DB.prepare("DELETE FROM trainers WHERE id = ?").bind(id).run();
        return Response.json({ message: "Trainer deleted" });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
