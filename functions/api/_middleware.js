// ─── SHA-256 Helper (must match login.js) ───
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Verify HMAC-signed session cookie ───
async function verifySession(cookie, secret) {
    const dotIndex = cookie.lastIndexOf('.');
    if (dotIndex === -1) return null; // unsigned cookie — reject

    const dataB64 = cookie.substring(0, dotIndex);
    const signature = cookie.substring(dotIndex + 1);

    // Recompute signature and compare
    const expectedSig = await sha256(dataB64 + ':' + secret);
    if (signature !== expectedSig) return null; // tampered — reject

    try {
        return atob(dataB64); // decode base64 → raw session string
    } catch {
        return null;
    }
}

export async function onRequest(context) {
    const { request, next, env } = context;
    const url = new URL(request.url);

    // Allow Login and Logout endpoints to pass through
    if (url.pathname === '/api/auth/login' || url.pathname === '/api/auth/logout') {
        return next();
    }

    // Check for cookie
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('gym_session=')) {
        return new Response(JSON.stringify({ error: 'Unauthorized: No session' }), {
            status: 401, headers: { 'Content-Type': 'application/json' }
        });
    }

    // Extract session cookie
    const sessionMatch = cookieHeader.match(/gym_session=([^;]+)/);
    if (!sessionMatch) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Invalid cookie format' }), {
            status: 401, headers: { 'Content-Type': 'application/json' }
        });
    }

    const rawCookie = sessionMatch[1];
    const secret = env.SESSION_SECRET || env.ADMIN_PIN || 'gym-app-secret-key';

    // ─── VERIFY SIGNATURE ───
    let decoded;

    if (rawCookie.includes('.')) {
        // New signed format: base64data.signature
        decoded = await verifySession(rawCookie, secret);
        if (!decoded) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or tampered session' }), {
                status: 401, headers: { 'Content-Type': 'application/json' }
            });
        }
    } else {
        // Legacy unsigned format — accept temporarily for backward compatibility
        // This allows existing sessions to work until they expire naturally (24h)
        try {
            decoded = atob(rawCookie);
        } catch {
            return new Response(JSON.stringify({ error: 'Unauthorized: Malformed session' }), {
                status: 401, headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    try {
        const parts = decoded.split(':');
        const role = parts[0]; // "admin" or "member"
        const timestamp = parseInt(parts[parts.length - 1]);

        // ─── CHECK SESSION EXPIRY (24 hours) ───
        const oneDay = 24 * 60 * 60 * 1000;
        if (isNaN(timestamp) || Date.now() - timestamp > oneDay) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Session expired' }), {
                status: 401, headers: { 'Content-Type': 'application/json' }
            });
        }

        if (role === 'admin') {
            // Admin session (new format): "admin:timestamp"
            // Admin session (old format): "admin:PIN:timestamp" — still works
            context.data = { role: 'admin' };

            // ─── AUTO-EXPIRE MEMBERS (runs on admin requests only, lightweight) ───
            try {
                await env.DB.prepare(
                    "UPDATE members SET status = 'expired' WHERE status = 'active' AND expiry_date < DATE('now')"
                ).run();
            } catch (e) {
                // Non-critical — don't block the request if this fails
                console.error('Auto-expire failed:', e.message);
            }

        } else if (role === 'member') {
            // Member session: "member:ID:NAME:timestamp"
            const memberId = parseInt(parts[1]);
            const memberName = parts[2];

            if (!memberId || isNaN(memberId)) {
                return new Response(JSON.stringify({ error: 'Unauthorized: Invalid member session' }), {
                    status: 401, headers: { 'Content-Type': 'application/json' }
                });
            }

            // Members can only access portal endpoints and auth endpoints
            const allowedPaths = ['/api/auth/verify', '/api/auth/logout', '/api/portal/'];
            const isAllowed = allowedPaths.some(p => url.pathname.startsWith(p));

            if (!isAllowed) {
                return new Response(JSON.stringify({ error: 'Unauthorized: Members cannot access admin endpoints' }), {
                    status: 403, headers: { 'Content-Type': 'application/json' }
                });
            }

            context.data = { role: 'member', memberId, memberName };

        } else {
            return new Response(JSON.stringify({ error: 'Unauthorized: Unknown role' }), {
                status: 401, headers: { 'Content-Type': 'application/json' }
            });
        }

        return next();

    } catch (e) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Malformed session' }), {
            status: 401, headers: { 'Content-Type': 'application/json' }
        });
    }
}
