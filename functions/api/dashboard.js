export async function onRequestGet(context) {
    const { env } = context;
    try {
        // Run queries in parallel for efficiency
        const [totalMembers, activeMembers, expiringSoon] = await Promise.all([
            env.DB.prepare("SELECT COUNT(*) as count FROM members").first('count'),
            env.DB.prepare("SELECT COUNT(*) as count FROM members WHERE status = 'active'").first('count'),
            env.DB.prepare("SELECT COUNT(*) as count FROM members WHERE expiry_date <= date('now', '+7 days') AND status = 'active'").first('count')
        ]);

        // Mock revenue data for chart (requires more complex SQL/dates for real implementation)
        const revenueChart = [
            { name: 'Mon', income: 4000 },
            { name: 'Tue', income: 3000 },
            { name: 'Wed', income: 2000 },
            { name: 'Thu', income: 2780 },
            { name: 'Fri', income: 1890 },
            { name: 'Sat', income: 2390 },
            { name: 'Sun', income: 3490 },
        ];

        return Response.json({
            metrics: {
                totalMembers,
                activeMembers,
                expiringSoon
            },
            revenueChart
        });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
