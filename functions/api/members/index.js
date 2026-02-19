export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare(
            "SELECT * FROM members ORDER BY status='active' DESC, expiry_date ASC"
        ).all();
        return Response.json(results);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const data = await request.json();
        const { name, phone, dob, expiry_date } = data;

        const info = await env.DB.prepare(
            "INSERT INTO members (name, phone, dob, expiry_date, status) VALUES (?, ?, ?, ?, 'active')"
        ).bind(name, phone, dob, expiry_date).run();

        return Response.json({ message: "Member added", id: info.lastRowId }, { status: 201 });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
