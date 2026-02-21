export async function onRequestGet(context) {
    const { env, data } = context;
    const memberId = data?.memberId;
    if (!memberId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, day, exercises, created_at FROM workout_plans WHERE member_id = ? ORDER BY CASE day WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 END"
        ).bind(memberId).all();

        return Response.json(results || []);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
