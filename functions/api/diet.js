// Admin endpoint to manage diet plans for members
// GET: Get diet plans for a specific member (?member_id=X)
// POST: Create/update diet plan for a member
// DELETE: Remove a diet plan entry (?id=X)

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const memberId = url.searchParams.get('member_id');

    if (!memberId) return Response.json({ error: 'member_id required' }, { status: 400 });

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, member_id, meal_type, items, created_at FROM diet_plans WHERE member_id = ? ORDER BY CASE meal_type WHEN 'Breakfast' THEN 1 WHEN 'Morning Snack' THEN 2 WHEN 'Lunch' THEN 3 WHEN 'Evening Snack' THEN 4 WHEN 'Dinner' THEN 5 END"
        ).bind(memberId).all();

        return Response.json(results || []);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { memberId, mealType, items } = await request.json();
        if (!memberId || !mealType) return Response.json({ error: 'memberId and mealType required' }, { status: 400 });

        // Upsert: delete existing plan for this meal type, then insert new one
        await env.DB.prepare("DELETE FROM diet_plans WHERE member_id = ? AND meal_type = ?").bind(memberId, mealType).run();

        if (items && items.trim()) {
            await env.DB.prepare(
                "INSERT INTO diet_plans (member_id, meal_type, items) VALUES (?, ?, ?)"
            ).bind(memberId, mealType, items.trim()).run();
        }

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const memberId = url.searchParams.get('member_id');

    try {
        if (id) {
            await env.DB.prepare("DELETE FROM diet_plans WHERE id = ?").bind(id).run();
        } else if (memberId) {
            await env.DB.prepare("DELETE FROM diet_plans WHERE member_id = ?").bind(memberId).run();
        }
        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
