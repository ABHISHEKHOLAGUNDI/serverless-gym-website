export async function onRequestPost(context) {
    const { env } = context;
    try {
        // Delete all data from all tables (order matters for foreign keys)
        await env.DB.prepare("DELETE FROM chat_messages").run();
        await env.DB.prepare("DELETE FROM workout_plans").run();
        await env.DB.prepare("DELETE FROM diet_plans").run();
        await env.DB.prepare("DELETE FROM attendance").run();
        await env.DB.prepare("DELETE FROM measurements").run();
        await env.DB.prepare("DELETE FROM finances").run();
        await env.DB.prepare("DELETE FROM members").run();
        await env.DB.prepare("DELETE FROM trainers").run();
        await env.DB.prepare("DELETE FROM machines").run();

        return Response.json({ message: "All data has been reset successfully" });
    } catch (e) {
        // Try to delete rate_limits too (may not exist)
        try { await env.DB.prepare("DELETE FROM rate_limits").run(); } catch (_) { }
        return Response.json({ error: e.message }, { status: 500 });
    }
}
