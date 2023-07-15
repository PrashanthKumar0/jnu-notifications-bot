import Bot from "./bot/index.js";
// handlers
import Tasks from "./tasks/index.js";

const env = {
	BOT_TOKEN,
	CHANNEL_ID,
};

let bot_token = env.BOT_TOKEN;
let bot = new Bot(bot_token);
bot.set_chatid(env.CHANNEL_ID);


export default {
	async fetch(request, env, ctx) {

		return handleReq(request, env, ctx);


		// let pk = "how did you get here?";

		// // ctx.waitUntil(await run_scheduled(env));
		// // FLUSH_LOGS();
		// return Response.json({ pk, status: "i wana know your name" });
	},
	async scheduled(event, env, ctx) {
		ctx.waitUntil(await run_scheduled(env));
	}
}

async function run_scheduled(env) {
	let requests = [];

	requests.push(Tasks.handle_iha_notifications(env, bot));
	requests.push(Tasks.handle_jnu_notifications(env, bot));
	requests.push(Tasks.handle_soe_notifications(env, bot));
	requests.push(Tasks.handle_soe_results_page(env, bot));

	console.log(" 🥱 waiting for subtasks");
	await Promise.all(requests);
	console.log(" ✅ all tasks checked ");
}