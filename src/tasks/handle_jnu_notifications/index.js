import get_jnu_notices from "./get_jnu_notices.js";
import { get_jnu_db_json, set_jnu_db_json } from "../controllers/jnu.js";
import { send_notices } from "../common/send_notices.js";

// returns promise
export default async function handle_jnu_notifications(env, bot) {
    const site = 'jnu.ac.in/jnu-notices';
    const get_notices_fn = get_jnu_notices;
    const get_db_json_fn = get_jnu_db_json;
    const set_db_json_fn = set_jnu_db_json;

    await send_notices({ site, env, bot, get_notices_fn, get_db_json_fn, set_db_json_fn });
}
