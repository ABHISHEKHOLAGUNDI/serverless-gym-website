export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    try {
        const { results } = await env.DB.prepare(
            `SELECT m.id as member_id, a.status, a.date, m.name, m.photo 
             FROM members m 
             LEFT JOIN attendance a ON m.id = a.member_id AND a.date = ? 
             WHERE m.status = 'active'`
        ).bind(date).all();

        // Return all active members, with their attendance status for the date (null if absent/not recorded)
        return Response.json(results);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    // We'll use POST/PUT to toggle. 
    // If status is 'present', insert/update. If 'absent', delete? Or just set status='absent'.
    // Let's stick to storing 'present' records. If not in DB, they are absent.

    const { request, env } = context;
    try {
        const { member_id, status, date } = await request.json();
        const targetDate = date || new Date().toISOString().split('T')[0];

        if (status === 'present') {
            // Insert or Ignore (to avoid duplicates)
            await env.DB.prepare(
                "INSERT OR IGNORE INTO attendance (member_id, date, status) VALUES (?, ?, 'present')"
            ).bind(member_id, targetDate).run();
        } else {
            // Delete if marking absent
            await env.DB.prepare(
                "DELETE FROM attendance WHERE member_id = ? AND date = ?"
            ).bind(member_id, targetDate).run();
        }

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
