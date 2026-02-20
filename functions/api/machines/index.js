export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare(
            "SELECT * FROM machines ORDER BY name ASC"
        ).all();
        // Map snake_case to camelCase for frontend consistency
        const mappedResults = results.map(m => ({
            id: m.id,
            name: m.name,
            status: m.status,
            lastMaintenance: m.last_maintenance,
            nextMaintenance: m.next_maintenance
        }));
        return Response.json(mappedResults);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const { name, status, lastMaintenance, nextMaintenance } = await request.json();
        const info = await env.DB.prepare(
            "INSERT INTO machines (name, status, last_maintenance, next_maintenance) VALUES (?, ?, ?, ?)"
        ).bind(name, status, lastMaintenance, nextMaintenance).run();
        return Response.json({ id: info.lastRowId, message: "Machine added" }, { status: 201 });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPut(context) {
    const { request, env } = context;
    try {
        const { id, name, status, lastMaintenance, nextMaintenance } = await request.json();
        if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

        await env.DB.prepare(
            `UPDATE machines SET 
                name = COALESCE(?, name), 
                status = COALESCE(?, status), 
                last_maintenance = COALESCE(?, last_maintenance), 
                next_maintenance = COALESCE(?, next_maintenance) 
            WHERE id = ?`
        ).bind(name || null, status || null, lastMaintenance || null, nextMaintenance || null, id).run();

        return Response.json({ message: "Machine updated" });
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
        await env.DB.prepare("DELETE FROM machines WHERE id = ?").bind(id).run();
        return Response.json({ message: "Machine deleted" });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
