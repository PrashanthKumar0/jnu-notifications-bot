import get_iha_notices from "./get_iha_notices.js";
import { get_iha_db_json, set_iha_db_json } from "../controllers/iha.js";
import { send_notices } from "../common/send_notices.js";

// returns promise
export default async function handle_iha_notifications(env, bot) {
    const site = 'jnu.ac.in/iha-notices';
    const get_notices_fn = get_iha_notices;
    const get_db_json_fn = get_iha_db_json;
    const set_db_json_fn = set_iha_db_json;

    await send_notices({ site, env, bot, get_notices_fn, get_db_json_fn, set_db_json_fn });
}
