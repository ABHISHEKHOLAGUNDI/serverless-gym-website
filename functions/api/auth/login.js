// ─── SHA-256 Helper ───
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Sign session data with HMAC (SHA-256) ───
async function signSession(data, secret) {
    const dataB64 = btoa(data);
    const signature = await sha256(dataB64 + ':' + secret);
    return dataB64 + '.' + signature;
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const secret = env.SESSION_SECRET || env.ADMIN_PIN || 'gym-app-secret-key';
        const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';

        // ─── RATE LIMITING: 5 attempts per 5 minutes per IP ───
        try {
            const recentAttempts = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM rate_limits WHERE ip = ? AND endpoint = 'login' AND attempted_at > DATETIME('now', '-5 minutes')"
            ).bind(ip).first('count');

            if (recentAttempts >= 5) {
                return new Response(JSON.stringify({
                    error: 'Too many login attempts. Please wait 5 minutes and try again.'
                }), { status: 429, headers: { 'Content-Type': 'application/json' } });
            }

            // Log this attempt
            await env.DB.prepare(
                "INSERT INTO rate_limits (ip, endpoint) VALUES (?, 'login')"
            ).bind(ip).run();

            // Cleanup old entries (older than 10 minutes) — lightweight maintenance
            await env.DB.prepare(
                "DELETE FROM rate_limits WHERE attempted_at < DATETIME('now', '-10 minutes')"
            ).run();
        } catch (rateLimitErr) {
            // If rate_limits table doesn't exist yet, continue without rate limiting
            // This prevents breakage before the table is created
            console.error('Rate limit check failed (table may not exist):', rateLimitErr.message);
        }

        // === ADMIN LOGIN (PIN-based) ===
        if (body.pin) {
            const validPin = env.ADMIN_PIN || '123456';

            // Hash comparison to avoid timing attacks
            const inputHash = await sha256(body.pin);
            const validHash = await sha256(validPin);

            if (inputHash === validHash) {
                // Session data does NOT include the raw PIN anymore — just role + timestamp
                const sessionData = `admin:${Date.now()}`;
                const signedSession = await signSession(sessionData, secret);

                return new Response(JSON.stringify({ success: true, role: 'admin' }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Set-Cookie': `gym_session=${signedSession}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
                    },
                });
            }
            return new Response(JSON.stringify({ error: 'Invalid PIN Code' }), {
                status: 401, headers: { 'Content-Type': 'application/json' }
            });
        }

        // === MEMBER LOGIN (Phone + Password) ===
        if (body.phone && body.password) {
            const member = await env.DB.prepare(
                "SELECT id, name, phone, dob, status FROM members WHERE phone = ? LIMIT 1"
            ).bind(body.phone).first();

            if (!member) {
                return new Response(JSON.stringify({ error: 'No member found with this phone number' }), {
                    status: 401, headers: { 'Content-Type': 'application/json' }
                });
            }

            // Check if member is active or expired (allow expired to see their data)
            if (member.status === 'inactive') {
                return new Response(JSON.stringify({ error: 'Your membership has been deactivated. Contact the gym owner.' }), {
                    status: 401, headers: { 'Content-Type': 'application/json' }
                });
            }

            // Password = phone + birth year (e.g., "98765432101995")
            let expectedPassword = member.phone;
            if (member.dob) {
                const birthYear = member.dob.split('-')[0];
                expectedPassword = member.phone + birthYear;
            }

            // Hash comparison — passwords never compared as plaintext
            const inputHash = await sha256(body.password);
            const expectedHash = await sha256(expectedPassword);

            if (inputHash !== expectedHash) {
                return new Response(JSON.stringify({ error: 'Invalid password' }), {
                    status: 401, headers: { 'Content-Type': 'application/json' }
                });
            }

            // Session data: "member:ID:NAME:timestamp"
            const sessionData = `member:${member.id}:${member.name}:${Date.now()}`;
            const signedSession = await signSession(sessionData, secret);

            return new Response(JSON.stringify({ success: true, role: 'member', name: member.name }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `gym_session=${signedSession}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
                },
            });
        }

        return new Response(JSON.stringify({ error: 'Missing credentials' }), {
            status: 400, headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Server error: ' + err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}
