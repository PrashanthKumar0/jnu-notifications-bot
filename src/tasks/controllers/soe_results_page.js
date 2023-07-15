export async function get_soe_results_page_db_json(env) {
	const { results } = await env.DB.prepare("SELECT json FROM jnu_bot WHERE site = ?").bind("soe.jnu.ac.in/for-students/examination-and-results").all();
	return results[0].json;
}

export async function set_soe_results_page_db_json(env, json) {
	const { success } = await env.DB.prepare("UPDATE jnu_bot SET json = ? WHERE site = ? ").bind(JSON.stringify(json), "soe.jnu.ac.in/for-students/examination-and-results").run();
	return success;
}
