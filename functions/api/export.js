// CSV Data Export API — Members & Finances
// GET /api/export?type=members  → Members CSV
// GET /api/export?type=finances → Finances CSV
// GET /api/export?type=attendance → Attendance CSV

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    try {
        if (type === 'members') {
            const { results } = await env.DB.prepare(
                "SELECT id, name, phone, plan_type, amount, start_date, expiry_date, dob, status FROM members ORDER BY id"
            ).all();

            const headers = ['ID', 'Name', 'Phone', 'Plan', 'Amount', 'Start Date', 'Expiry Date', 'DOB', 'Status'];
            const rows = (results || []).map(m => [
                m.id, escapeCsv(m.name), m.phone, m.plan_type, m.amount,
                m.start_date, m.expiry_date, m.dob || '', m.status
            ]);

            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

            return new Response(csv, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename=members_${today()}.csv`
                }
            });
        }

        if (type === 'finances') {
            const { results } = await env.DB.prepare(
                "SELECT id, type, amount, date, category, description FROM finances ORDER BY date DESC"
            ).all();

            const headers = ['ID', 'Type', 'Amount', 'Date', 'Category', 'Description'];
            const rows = (results || []).map(f => [
                f.id, f.type, f.amount, f.date, escapeCsv(f.category || ''), escapeCsv(f.description || '')
            ]);

            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

            return new Response(csv, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename=finances_${today()}.csv`
                }
            });
        }

        if (type === 'attendance') {
            const { results } = await env.DB.prepare(
                `SELECT a.id, m.name, a.date, a.status 
                 FROM attendance a JOIN members m ON m.id = a.member_id 
                 ORDER BY a.date DESC LIMIT 5000`
            ).all();

            const headers = ['ID', 'Member Name', 'Date', 'Status'];
            const rows = (results || []).map(a => [
                a.id, escapeCsv(a.name), a.date, a.status
            ]);

            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

            return new Response(csv, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename=attendance_${today()}.csv`
                }
            });
        }

        return Response.json({ error: 'Invalid export type. Use: members, finances, attendance' }, { status: 400 });

    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

// ─── Helpers ───
function escapeCsv(value) {
    if (!value) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function today() {
    return new Date().toISOString().split('T')[0];
}
