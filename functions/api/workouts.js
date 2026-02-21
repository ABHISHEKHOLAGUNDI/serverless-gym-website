// Admin endpoint to manage workout plans for members
// GET: Get workout plans for a specific member (?member_id=X)
// POST: Create/update workout plan for a member
// DELETE: Remove a workout plan entry (?id=X)

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const memberId = url.searchParams.get('member_id');

    if (!memberId) return Response.json({ error: 'member_id required' }, { status: 400 });

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, member_id, day, exercises, created_at FROM workout_plans WHERE member_id = ? ORDER BY CASE day WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 END"
        ).bind(memberId).all();

        return Response.json(results || []);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { memberId, day, exercises } = await request.json();
        if (!memberId || !day) return Response.json({ error: 'memberId and day required' }, { status: 400 });

        // Upsert: delete existing plan for this day, then insert new one
        await env.DB.prepare("DELETE FROM workout_plans WHERE member_id = ? AND day = ?").bind(memberId, day).run();

        if (exercises && exercises.length > 0) {
            const exercisesJson = typeof exercises === 'string' ? exercises : JSON.stringify(exercises);
            await env.DB.prepare(
                "INSERT INTO workout_plans (member_id, day, exercises) VALUES (?, ?, ?)"
            ).bind(memberId, day, exercisesJson).run();
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
            await env.DB.prepare("DELETE FROM workout_plans WHERE id = ?").bind(id).run();
        } else if (memberId) {
            await env.DB.prepare("DELETE FROM workout_plans WHERE member_id = ?").bind(memberId).run();
        }
        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
