export async function get_jnu_db_json(env) {
    const { results } = await env.DB.prepare("SELECT json FROM jnu_bot WHERE site = ?").bind("jnu.ac.in/notices").all();
    return results[0].json;
}
export async function set_jnu_db_json(env, json) {
    const { success } = await env.DB.prepare("UPDATE jnu_bot SET json = ? WHERE site = ? ").bind(JSON.stringify(json), "jnu.ac.in/notices").run();
    return success;
}