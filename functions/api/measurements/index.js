export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        const member_id = body.member_id;
        const date = body.date || new Date().toISOString().split('T')[0];

        // Use explicit null checks — do NOT use || null (converts 0 to null)
        const weight = body.weight !== undefined && body.weight !== '' ? Number(body.weight) : null;
        const chest = body.chest !== undefined && body.chest !== '' ? Number(body.chest) : null;
        const bicepsL = body.bicepsL !== undefined && body.bicepsL !== '' ? Number(body.bicepsL) : null;
        const bicepsR = body.bicepsR !== undefined && body.bicepsR !== '' ? Number(body.bicepsR) : null;
        const waist = body.waist !== undefined && body.waist !== '' ? Number(body.waist) : null;
        const thigh = body.thigh !== undefined && body.thigh !== '' ? Number(body.thigh) : null;
        const calves = body.calves !== undefined && body.calves !== '' ? Number(body.calves) : null;

        await env.DB.prepare(
            `INSERT INTO measurements (member_id, date, weight, chest, biceps_l, biceps_r, waist, thigh, calves) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(member_id, date, weight, chest, bicepsL, bicepsR, waist, thigh, calves).run();

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
            "SELECT * FROM measurements WHERE member_id = ? ORDER BY date DESC"
        ).bind(memberId).all();

        // Map snake_case DB columns to camelCase for frontend
        const mapped = (results || []).map(r => ({
            id: r.id,
            memberId: r.member_id,
            date: r.date,
            weight: r.weight,
            chest: r.chest,
            bicepsL: r.biceps_l,
            bicepsR: r.biceps_r,
            waist: r.waist,
            thigh: r.thigh,
            calves: r.calves
        }));

        return Response.json(mapped);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
