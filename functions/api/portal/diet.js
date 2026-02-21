export async function onRequestGet(context) {
    const { env, data } = context;
    const memberId = data?.memberId;
    if (!memberId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, meal_type, items, created_at FROM diet_plans WHERE member_id = ? ORDER BY CASE meal_type WHEN 'Breakfast' THEN 1 WHEN 'Morning Snack' THEN 2 WHEN 'Lunch' THEN 3 WHEN 'Evening Snack' THEN 4 WHEN 'Dinner' THEN 5 END"
        ).bind(memberId).all();

        return Response.json(results || []);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
