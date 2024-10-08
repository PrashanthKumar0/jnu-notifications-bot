import Bot from "./bot/index.js";
// handlers
import Tasks from "./tasks/index.js";

let bot = null;

export default {
    async fetch(request, env, ctx) {
        // WE DONT USE THIS PART 
        // so ignore this
        
        let message = "how did you get here? \nI wana know your name";

        // // // ctx.waitUntil(await run_scheduled(env));
        // // // FLUSH_LOGS();
        
        bot = new Bot(env.BOT_TOKEN);
        bot.set_chatid(env.CHANNEL_ID);
        ctx.waitUntil(await run_scheduled(env));
        return Response.json({ message });
    },
    async scheduled(event, env, ctx) {
        bot = new Bot(env.BOT_TOKEN);
        bot.set_chatid(env.CHANNEL_ID);

        ctx.waitUntil(await run_scheduled(env));
    }
}

async function run_scheduled(env) {
    let requests = [];

    requests.push(Tasks.handle_iha_notifications(env, bot));
    requests.push(Tasks.handle_jnu_notifications(env, bot));

    // TODO : handle soe site
    // requests.push(Tasks.handle_soe_notifications(env, bot));
    // requests.push(Tasks.handle_soe_results_page(env, bot));

    console.log(" 🥱 waiting for subtasks");
    await Promise.all(requests);
    console.log(" ✅ all tasks checked ");
}