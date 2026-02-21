export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();

        // === ADMIN LOGIN (PIN-based) ===
        if (body.pin) {
            const validPin = env.ADMIN_PIN || '123456';
            if (body.pin === validPin) {
                const sessionValue = btoa(`admin:${body.pin}:${Date.now()}`);
                return new Response(JSON.stringify({ success: true, role: 'admin' }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Set-Cookie': `gym_session=${sessionValue}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
                    },
                });
            }
            return new Response(JSON.stringify({ error: 'Invalid PIN Code' }), { status: 401 });
        }

        // === MEMBER LOGIN (Phone + Password) ===
        if (body.phone && body.password) {
            // Look up member by phone number
            const member = await env.DB.prepare(
                "SELECT id, name, phone, dob FROM members WHERE phone = ? AND status = 'active' LIMIT 1"
            ).bind(body.phone).first();

            if (!member) {
                return new Response(JSON.stringify({ error: 'No active member found with this phone number' }), { status: 401 });
            }

            // Password = phone + birth year (e.g., "98765432101995")
            let expectedPassword = member.phone;
            if (member.dob) {
                const birthYear = member.dob.split('-')[0]; // "1995-06-15" → "1995"
                expectedPassword = member.phone + birthYear;
            }

            if (body.password !== expectedPassword) {
                return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
            }

            // Create member session: "member:MEMBER_ID:MEMBER_NAME:timestamp"
            const sessionValue = btoa(`member:${member.id}:${member.name}:${Date.now()}`);
            return new Response(JSON.stringify({ success: true, role: 'member', name: member.name }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `gym_session=${sessionValue}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
                },
            });
        }

        return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 400 });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Server error: ' + err.message }), { status: 500 });
    }
}
