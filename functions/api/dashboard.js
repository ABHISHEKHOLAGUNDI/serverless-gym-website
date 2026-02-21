export async function onRequestGet(context) {
    const { env } = context;
    try {
        // ─── METRICS: Run queries in parallel ───
        const [totalMembers, activeMembers, expiringSoon, todayAttendance, monthlyRevenue, monthlyExpense] = await Promise.all([
            env.DB.prepare("SELECT COUNT(*) as count FROM members").first('count'),
            env.DB.prepare("SELECT COUNT(*) as count FROM members WHERE status = 'active'").first('count'),
            env.DB.prepare("SELECT COUNT(*) as count FROM members WHERE expiry_date <= DATE('now', '+7 days') AND status = 'active'").first('count'),
            env.DB.prepare("SELECT COUNT(*) as count FROM attendance WHERE date = DATE('now') AND status = 'present'").first('count'),
            env.DB.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM finances WHERE type = 'Income' AND date >= DATE('now', 'start of month')").first('total'),
            env.DB.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM finances WHERE type = 'Expense' AND date >= DATE('now', 'start of month')").first('total'),
        ]);

        // ─── REVENUE CHART: Real data from last 7 days ───
        const { results: revenueRaw } = await env.DB.prepare(`
            WITH RECURSIVE dates(d) AS (
                SELECT DATE('now', '-6 days')
                UNION ALL
                SELECT DATE(d, '+1 day') FROM dates WHERE d < DATE('now')
            )
            SELECT 
                dates.d as date,
                COALESCE(SUM(CASE WHEN f.type = 'Income' THEN f.amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN f.type = 'Expense' THEN f.amount ELSE 0 END), 0) as expense
            FROM dates
            LEFT JOIN finances f ON DATE(f.date) = dates.d
            GROUP BY dates.d
            ORDER BY dates.d ASC
        `).all();

        // Format day names for chart display
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const revenueChart = (revenueRaw || []).map(r => {
            const dayOfWeek = new Date(r.date + 'T00:00:00').getDay();
            return {
                name: dayNames[dayOfWeek],
                income: r.income,
                expense: r.expense,
                date: r.date
            };
        });

        return Response.json({
            metrics: {
                totalMembers,
                activeMembers,
                expiringSoon,
                todayAttendance: todayAttendance || 0,
                monthlyRevenue: monthlyRevenue || 0,
                monthlyExpense: monthlyExpense || 0
            },
            revenueChart
        });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
