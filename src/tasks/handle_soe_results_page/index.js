import get_soe_results_page_notices from "./get_soe_results_page_notices.js";
import { get_soe_results_page_db_json, set_soe_results_page_db_json } from "../controllers/soe_results_page.js";
import { send_notices } from "../common/send_notices.js";

// returns promise
export default async function handle_soe_results_page_notifications(env, bot) {
    const site = 'soe.jnu.ac.in/for-students/examination-and-results';
    const get_notices_fn = get_soe_results_page_notices;
    const get_db_json_fn = get_soe_results_page_db_json;
    const set_db_json_fn = set_soe_results_page_db_json;

    await send_notices({ site, env, bot, get_notices_fn, get_db_json_fn, set_db_json_fn });
}
