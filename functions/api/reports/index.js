export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const memberId = url.searchParams.get('id');

    if (!memberId) {
        return Response.json({ error: "Member ID required" }, { status: 400 });
    }

    try {
        // 1. Get Member Details & Current measurements
        const member = await env.DB.prepare("SELECT * FROM members WHERE id = ?").bind(memberId).first();
        if (!member) return Response.json({ error: "Member not found" }, { status: 404 });

        // 2. Get Attendance Count
        const attendanceCount = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM attendance WHERE member_id = ? AND status = 'present'"
        ).bind(memberId).first('count');

        // 3. Get Initial Weight (First measurement or current if none)
        const initialMeasurement = await env.DB.prepare(
            "SELECT weight FROM measurements WHERE member_id = ? ORDER BY date ASC LIMIT 1"
        ).bind(memberId).first();

        // 4. Get Latest Weight
        const latestMeasurement = await env.DB.prepare(
            "SELECT weight FROM measurements WHERE member_id = ? ORDER BY date DESC LIMIT 1"
        ).bind(memberId).first();

        // Calculate Days Since Joining
        const joinDate = new Date(member.start_date);
        const today = new Date();
        const diffTime = Math.abs(today - joinDate);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Response.json({
            member: {
                id: member.id,
                name: member.name,
                phone: member.phone,
                dob: member.dob,
                height: member.height,
                planType: member.plan_type,
                startDate: member.start_date,
                expiry: member.expiry_date,
                status: member.status
            },
            stats: {
                attendance: attendanceCount,
                totalDays: totalDays || 1, // Avoid division by zero
                initialWeight: initialMeasurement?.weight || latestMeasurement?.weight || 0,
                currentWeight: latestMeasurement?.weight || 0
            }
        });

    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
