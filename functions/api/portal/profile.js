export async function onRequestGet(context) {
    const { env, data } = context;
    const memberId = data?.memberId;
    if (!memberId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const member = await env.DB.prepare(
            "SELECT id, name, phone, photo, height, plan_type, amount, start_date, expiry_date, dob, trainer_id, status FROM members WHERE id = ?"
        ).bind(memberId).first();

        if (!member) return Response.json({ error: 'Member not found' }, { status: 404 });

        // Get trainer name if assigned
        let trainerName = null;
        if (member.trainer_id) {
            const trainer = await env.DB.prepare("SELECT name FROM trainers WHERE id = ?").bind(member.trainer_id).first();
            trainerName = trainer?.name || null;
        }

        return Response.json({
            id: member.id,
            name: member.name,
            phone: member.phone,
            photo: member.photo,
            height: member.height,
            planType: member.plan_type,
            amount: member.amount,
            startDate: member.start_date,
            expiry: member.expiry_date,
            dob: member.dob,
            trainerId: member.trainer_id,
            trainerName,
            status: member.status
        });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
