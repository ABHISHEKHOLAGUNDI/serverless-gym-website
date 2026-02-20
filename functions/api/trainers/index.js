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

export async function onRequestPut(context) {
    const { request, env } = context;
    try {
        const { id, name, specialty, phone } = await request.json();
        if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

        await env.DB.prepare(
            `UPDATE trainers SET 
                name = COALESCE(?, name), 
                specialty = COALESCE(?, specialty), 
                phone = COALESCE(?, phone) 
            WHERE id = ?`
        ).bind(name || null, specialty || null, phone || null, id).run();

        return Response.json({ message: "Trainer updated" });
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
