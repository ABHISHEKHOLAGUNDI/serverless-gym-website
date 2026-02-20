export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare(
            "SELECT * FROM members ORDER BY status='active' DESC, expiry_date ASC"
        ).all();
        // Map snake_case (DB) to camelCase (Frontend)
        const mappedResults = results.map(m => ({
            id: m.id,
            name: m.name,
            phone: m.phone,
            photo: m.photo,
            planType: m.plan_type,
            amount: m.amount,
            startDate: m.start_date,
            expiry: m.expiry_date,
            dob: m.dob,
            status: m.status
        }));
        return Response.json(mappedResults);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const data = await request.json();
        const { name, phone, photo, planType, amount, startDate, expiry, dob } = data;

        const info = await env.DB.prepare(
            "INSERT INTO members (name, phone, photo, plan_type, amount, start_date, expiry_date, dob, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')"
        ).bind(name, phone, photo, planType, amount, startDate, expiry, dob).run();

        return Response.json({ message: "Member added", id: info.lastRowId }, { status: 201 });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPut(context) {
    const { request, env } = context;
    try {
        const data = await request.json();
        // Default to null if undefined, so bind() calls receive null instead of undefined
        const id = data.id;
        const name = data.name || null;
        const phone = data.phone || null;
        const photo = data.photo || null;
        const planType = data.planType || null;
        const amount = data.amount || null;
        const startDate = data.startDate || null;
        const expiry = data.expiry || null;
        const dob = data.dob || null;
        const status = data.status || null;

        await env.DB.prepare(
            `UPDATE members SET 
                name = COALESCE(?, name), 
                phone = COALESCE(?, phone), 
                photo = COALESCE(?, photo),
                plan_type = COALESCE(?, plan_type),
                amount = COALESCE(?, amount),
                start_date = COALESCE(?, start_date),
                expiry_date = COALESCE(?, expiry_date),
                dob = COALESCE(?, dob),
                status = COALESCE(?, status)
            WHERE id = ?`
        ).bind(name, phone, photo, planType, amount, startDate, expiry, dob, status, id).run();

        return Response.json({ message: "Member updated" });
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
        // Delete related records first to avoid FOREIGN KEY constraint
        await env.DB.prepare("DELETE FROM attendance WHERE member_id = ?").bind(id).run();
        await env.DB.prepare("DELETE FROM measurements WHERE member_id = ?").bind(id).run();
        // Now delete the member
        await env.DB.prepare("DELETE FROM members WHERE id = ?").bind(id).run();
        return Response.json({ message: "Member deleted" });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
