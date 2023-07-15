import { empty_promise } from "./empty_promise.js";
import { filter_notices } from "./filter_notices.js";
import md5 from "md5";
import Bot from "../../bot/index.js";

// Returns Promise
export async function send_notices({ site, env, bot, get_notices_fn, get_db_json_fn, set_db_json_fn }) {
    // eg :
    // site:http://soe.jnu.ac.in
    // scrap_notices
    // fetch_from_db
    // filter 
    // send notices

    const notices = await get_notices_fn();
    const notices_str = JSON.stringify(notices);

    const cached_notices_str = await get_db_json_fn(env);
    const cached_notices = JSON.parse(cached_notices_str);


    if (notices_str == cached_notices_str) return empty_promise(); // we could have returned null

    const filtered_notices = filter_notices(notices, cached_notices);

    if (filtered_notices.length <= 0) {
        console.log(`${site} : Everything is up to date`);
        return empty_promise();
    }

    await bot.send_message(`🔔 new notices from : ${site}`);
    await bot.send_notices(filtered_notices);

    console.log(`

    
🕷 SITE     :  ${site}
┗✦ Payload :  ${JSON.stringify(filtered_notices)}
┗✦ Old Hash : ${md5(cached_notices_str)}
┗✦ New Hash : ${md5(notices_str)}
┗✦ Old Json : ${cached_notices_str}
┗✦ New Json : ${notices_str}
`);

    await set_db_json_fn(env, notices);









    /*
        TODO : Reomve this testing part
    */

        let channel_id_log = "@undefined3301_bot_logs";
        let bot_log = new Bot(bot.bot_token);
        bot_log.set_chatid(channel_id_log);
        await bot_log.send_message(`

        
🌍 SITE    :  ${site}
┗✦ Payload :  ${JSON.stringify(filtered_notices)}
┗✦ Old Hash : ${md5(cached_notices_str)}
┗✦ New Hash : ${md5(notices_str)}
┗✦ Old Json : ${cached_notices_str}
┗✦ New Json : ${notices_str}
`)
        


}