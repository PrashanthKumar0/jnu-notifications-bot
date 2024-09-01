
// src/bot/send_message.js
function send_message(bot_token, chat_id, message_text) {
    let api_url = `https://api.telegram.org/bot${bot_token}/sendMessage`;
    let res = fetch(api_url, {
      method: "POST",
      headers: {
        "content-type": "application/json "
      },
      body: JSON.stringify({
        chat_id,
        text: message_text
      })
    }).then((res2) => res2.json());
    return res;
  }
  var send_message_default = send_message;
  
  // src/bot/send_remote_file.js
  function send_remote_file(bot_token, chat_id, file_url, caption_text) {
    let api_url = `https://api.telegram.org/bot${bot_token}/sendDocument`;
    let res = fetch(api_url, {
      method: "POST",
      headers: {
        "content-type": "application/json "
      },
      body: JSON.stringify({
        chat_id,
        document: file_url,
        caption: caption_text
      })
    }).then((res2) => res2.json());
    return res;
  }
  var send_remote_file_default = send_remote_file;
  
  // src/bot/send_remote_files.js
  function send_remote_files(bot_token, chat_id, files) {
    let requests = [];
    files.forEach((file) => {
      if (file.file_url.search(/\.(pdf|png|jpg|jpeg|webp)/gi) == -1) {
        requests.push(send_message_default(bot_token, chat_id, `Visit : ${file.file_url} 
  
  
  ${file.caption_text}`));
        return;
      }
      requests.push(send_remote_file_default(bot_token, chat_id, file.file_url, file.caption_text));
    });
    return Promise.all(requests);
  }
  var send_remote_files_default = send_remote_files;
  
  // src/bot/index.js
  var Bot = class {
    constructor(bot_token, chat_id = "") {
      this.bot_token = bot_token;
      this.chat_id = chat_id;
    }
    set_chatid(chat_id) {
      this.chat_id = chat_id;
      return this;
    }
    send_message(message) {
      return send_message_default(this.bot_token, this.chat_id, message);
    }
    send_remote_file(file_url, caption_text) {
      if (file_url.search(".pdf") == -1) {
        return this.send_message(`Visit : ${file_url}
  
  DESC : ${caption_text}`);
      }
      return send_remote_file_default(this.bot_token, this.chat_id, file_url, caption_text);
    }
    send_bulk_messages(message_list) {
      let proms = [];
      message_list.forEach((message) => {
        proms.push(send_message_default(this.bot_token, this.chat_id, message));
      });
      return Promise.all(proms);
    }
    send_remote_files(files) {
      return send_remote_files_default(this.bot_token, this.chat_id, files);
    }
    send_notices(notices) {
      return this.send_remote_files(notices);
    }
  };
  var bot_default = Bot;
  
  // src/tasks/handle_soe_notifications/get_soe_notices.js
  var import_node_html_parser = __toESM(require_dist(), 1);
  
  // src/tasks/common/fix_url.js
  function fix_url(prefix, url) {
    if (prefix[prefix.length - 1] == "/")
      prefix = prefix.substr(0, prefix.length - 1);
    if (!(url.substr(0, 7).toLowerCase() == "http://" || url.substr(0, 8).toLowerCase() == "https://")) {
      if (url[0] == "/")
        url = prefix + url;
      else
        url = prefix + "/" + url;
    }
    return url;
  }
  
  // src/tasks/common/send_log.js
  async function send_log2({ env, message }) {
    let channel_id_log = "-4141516945";
    let bot2 = new bot_default(env.BOT_TOKEN);
    bot2.set_chatid(channel_id_log);
    await bot2.send_message(message);
  }
  
  // src/tasks/handle_soe_notifications/get_soe_notices.js
  async function get_soe_notices() {
    const notices = [];
    const soe_site_url = "http://soe.jnu.ac.in/";
    let dom = (0, import_node_html_parser.parse)(
      await fetch(soe_site_url).then((res) => res.text())
    );
    let marquee_container = dom.querySelector("#block-gridblockhomepage > div > div > div:nth-child(2) > div > div > div > div > div > div > div > div > marquee");
    let marquee_rows = marquee_container.querySelectorAll(".marquee-row");
    marquee_rows.forEach((marquee_row) => {
      try {
        const a = marquee_row.querySelector("a");
        const date = marquee_row.querySelector("time").innerText;
        const desc = a.innerText;
        const caption_text = `DESC : ${desc}
  
  DATE : ${date}`;
        const href = a.getAttribute("href");
        const file_url = fix_url(soe_site_url, href);
        notices.push({ file_url, caption_text });
      } catch (message) {
        console.log(message);
      }
    });
    return notices;
  }
  var get_soe_notices_default = get_soe_notices;
  
  // src/tasks/controllers/soe.js
  async function get_soe_db_json(env) {
    const { results } = await env.DB.prepare("SELECT json FROM jnu_bot WHERE site = ? ").bind("soe.jnu.ac.in").all();
    return results[0].json;
  }
  async function set_soe_db_json(env, json) {
    const { success } = await env.DB.prepare("UPDATE jnu_bot SET json = ? WHERE site = ? ").bind(JSON.stringify(json), "soe.jnu.ac.in").run();
    return success;
  }
  
  // src/tasks/common/empty_promise.js
  function empty_promise() {
    return new Promise((res, rej) => res());
  }
  
  // src/tasks/common/filter_notices.js
  function filter_notices(notices, cached_notices) {
    return notices.filter((notice) => {
      for (let i = 0; i < cached_notices.length; i++) {
        if (notice.file_url == cached_notices[i].file_url) {
          return false;
        }
      }
      return true;
    });
  }
  
  // src/tasks/common/send_notices.js
  var import_md5 = __toESM(require_md5(), 1);
  async function send_notices({ site, env, bot: bot2, get_notices_fn, get_db_json_fn, set_db_json_fn }) {
    const notices = await get_notices_fn();
    const notices_str = JSON.stringify(notices);
    const cached_notices_str = await get_db_json_fn(env);
    const cached_notices = JSON.parse(cached_notices_str);
    if (notices_str == cached_notices_str) {
      console.log(`${site} : Everything is up to date`);
      return empty_promise();
    }
    const filtered_notices = filter_notices(notices, cached_notices);
    if (filtered_notices.length <= 0) {
      console.log(`${site} : Everything is up to date`);
      return empty_promise();
    }
    await bot2.send_message(`\u{1F514} new notices from : ${site}`);
    await bot2.send_notices(filtered_notices);
    console.log(`
  
      
  \u{1F577} SITE     :  ${site}
  \u2517\u2726 Payload :  ${JSON.stringify(filtered_notices)}
  \u2517\u2726 Old Hash : ${(0, import_md5.default)(cached_notices_str)}
  \u2517\u2726 New Hash : ${(0, import_md5.default)(notices_str)}
  \u2517\u2726 Old Json : ${cached_notices_str}
  \u2517\u2726 New Json : ${notices_str}
  `);
    await set_db_json_fn(env, notices);
    let channel_id_log = "-4141516945";
    let bot_log = new bot_default(bot2.bot_token);
    bot_log.set_chatid(channel_id_log);
    await bot_log.send_message(`
  
          
  \u{1F30D} SITE    :  ${site}
  \u2517\u2726 Payload :  ${JSON.stringify(filtered_notices)}
  \u2517\u2726 Old Hash : ${(0, import_md5.default)(cached_notices_str)}
  \u2517\u2726 New Hash : ${(0, import_md5.default)(notices_str)}
  `);
    await bot_log.send_message(`
  \u{1F30D} SITE    :  ${site}
  \u2517\u2726 Old Json : ${cached_notices_str}
  \u2517\u2726 New Json : ${notices_str}        
  `);
  }
  
  // src/tasks/handle_soe_notifications/index.js
  async function handle_soe_notifications(env, bot2) {
    const site = "soe.jnu.ac.in";
    const get_notices_fn = get_soe_notices_default;
    const get_db_json_fn = get_soe_db_json;
    const set_db_json_fn = set_soe_db_json;
    try {
      await send_notices({ site, env, bot: bot2, get_notices_fn, get_db_json_fn, set_db_json_fn });
    } catch (err) {
      const message = `${site} failed with error ${err}`;
      console.log(message);
      await send_log2({ env, message });
    }
  }
  
  // src/tasks/handle_iha_notifications/get_iha_notices.js
  var import_node_html_parser2 = __toESM(require_dist(), 1);
  async function get_iha_notices() {
    const notices = [];
    const iha_site_url = "https://jnu.ac.in/iha-notices";
    let dom = (0, import_node_html_parser2.parse)(
      await fetch(iha_site_url).then((res) => res.text())
    );
    const tbody = dom.querySelector("#block-jnu-consilium-system-main > div > div > div > div.view-content > table > tbody");
    const trs = tbody.querySelectorAll("tr");
    trs.forEach((tr) => {
      const desc = tr.querySelector(".views-field-field-notice").innerText;
      const date = tr.querySelector("time").innerText;
      const a = tr.querySelector("a");
      const href = a.getAttribute("href");
      const file_url = fix_url("https://jnu.ac.in", href);
      const caption_text = `
  Desc      : ${desc}
  
  File Name : ${a.innerText}
  
  
  Date      : ${date}`;
      notices.push({ file_url, caption_text });
    });
    return notices;
  }
  var get_iha_notices_default = get_iha_notices;
  
  // src/tasks/controllers/iha.js
  async function get_iha_db_json(env) {
    const { results } = await env.DB.prepare("SELECT json FROM jnu_bot WHERE site = ? ").bind("jnu.ac.in/iha-notices").all();
    return results[0].json;
  }
  async function set_iha_db_json(env, json) {
    const { success } = await env.DB.prepare("UPDATE jnu_bot SET json = ? WHERE site = ? ").bind(JSON.stringify(json), "jnu.ac.in/iha-notices").run();
    return success;
  }
  
  // src/tasks/common/send_notices_iha.js
  var import_md52 = __toESM(require_md5(), 1);
  async function send_notices_iha({ site, env, bot: bot2, get_notices_fn, get_db_json_fn, set_db_json_fn }) {
    const notices = await get_notices_fn();
    const notices_str = JSON.stringify(notices);
    const cached_notices_str = await get_db_json_fn(env);
    const cached_notices = JSON.parse(cached_notices_str);
    console.log(`---- IHA Notices Count : ${cached_notices.length} (from database) --- `);
    if (notices_str == cached_notices_str) {
      console.log(`${site} : Everything is up to date`);
      return empty_promise();
    }
    const filtered_notices = filter_notices(notices, cached_notices);
    if (filtered_notices.length <= 0) {
      console.log(`${site} : Everything is up to date`);
      return empty_promise();
    }
    console.log("is null????? ", bot2 === null);
    await bot2.send_message(`\u{1F514} new notices from : ${site}`);
    await bot2.send_notices(filtered_notices);
    const union_notices = [...notices];
    cached_notices.forEach((cached_notice) => {
      let should_push = true;
      for (let i = 0; i < union_notices.length; i++) {
        if (union_notices[i].file_url == cached_notice.file_url)
          should_push = false;
      }
      if (should_push) {
        union_notices.push(cached_notice);
      }
    });
    console.log(`---- IHA Notices Count : ${union_notices.length} (from database) --- `);
    await set_db_json_fn(env, union_notices);
    console.log(`
  
         
  \u{1F30D} SITE    :  ${site}
  \u2517\u2726 Payload :  ${JSON.stringify(filtered_notices)}
  \u2517\u2726 Old Hash : ${(0, import_md52.default)(cached_notices_str)}
  \u2517\u2726 New Hash : ${(0, import_md52.default)(notices_str)}
  \u2517\u2726 Old Json : ${cached_notices_str}
  \u2517\u2726 New Json : ${notices_str}
  \u2517\u2726 Old #obj : ${cached_notices.length} Notices
  \u2517\u2726 New #obj : ${union_notices.length} Notices
  `);
    let channel_id_log = "-4141516945";
    let bot_log = new bot_default(bot2.bot_token);
    bot_log.set_chatid(channel_id_log);
    await bot_log.send_message(`
  
         
  \u{1F30D} SITE    :  ${site}
  \u2517\u2726 Payload :  ${JSON.stringify(filtered_notices)}
  \u2517\u2726 Old Hash : ${(0, import_md52.default)(cached_notices_str)}
  \u2517\u2726 New Hash : ${(0, import_md52.default)(notices_str)}
  \u2517\u2726 Old #obj : ${cached_notices.length} Notices
  \u2517\u2726 New #obj : ${union_notices.length} Notices
  `);
    await bot2.send_message(`
  \u{1F30D} SITE    :  ${site}
  \u2517\u2726 Old Json : ${cached_notices_str}
  \u2517\u2726 New Json : ${notices_str}
  `);
    console.log("flushed logs :)");
  }
  
  // src/tasks/handle_iha_notifications/index.js
  async function handle_iha_notifications(env, bot2) {
    const site = "jnu.ac.in/iha-notices";
    const get_notices_fn = get_iha_notices_default;
    const get_db_json_fn = get_iha_db_json;
    const set_db_json_fn = set_iha_db_json;
    try {
      await send_notices_iha({ site, env, bot: bot2, get_notices_fn, get_db_json_fn, set_db_json_fn });
    } catch (err) {
      const message = `${site} failed with error ${err}`;
      console.log(message);
      await send_log2({ env, message });
    }
  }
  
  // src/tasks/handle_jnu_notifications/get_jnu_notices.js
  var import_node_html_parser3 = __toESM(require_dist(), 1);
  async function get_jnu_notices() {
    const notices = [];
    const jnu_notices_site_url = "https://www.jnu.ac.in/notices";
    let dom = (0, import_node_html_parser3.parse)(
      await fetch(jnu_notices_site_url).then((res) => res.text())
    );
    const tbody = dom.querySelector("#block-jnu-consilium-system-main > div > div > div > div > table > tbody");
    const trs = tbody.querySelectorAll("tr");
    trs.forEach((tr) => {
      const a = tr.querySelector("a");
      const href = a.getAttribute("href");
      const date = tr.querySelector(".views-field-field-notice-date").innerText;
      const file_url = fix_url("https://www.jnu.ac.in/", href);
      const caption_text = `
  Desc     : ${a.innerText}
  
  
  Date     : ${date}`;
      if (notices.length < 5)
        notices.push({ file_url, caption_text });
    });
    return notices;
  }
  var get_jnu_notices_default = get_jnu_notices;
  
  // src/tasks/controllers/jnu.js
  async function get_jnu_db_json(env) {
    const { results } = await env.DB.prepare("SELECT json FROM jnu_bot WHERE site = ?").bind("jnu.ac.in/notices").all();
    return results[0].json;
  }
  async function set_jnu_db_json(env, json) {
    const { success } = await env.DB.prepare("UPDATE jnu_bot SET json = ? WHERE site = ? ").bind(JSON.stringify(json), "jnu.ac.in/notices").run();
    return success;
  }
  
  // src/tasks/handle_jnu_notifications/index.js
  async function handle_jnu_notifications(env, bot2) {
    const site = "jnu.ac.in/notices";
    const get_notices_fn = get_jnu_notices_default;
    const get_db_json_fn = get_jnu_db_json;
    const set_db_json_fn = set_jnu_db_json;
    try {
      await send_notices({ site, env, bot: bot2, get_notices_fn, get_db_json_fn, set_db_json_fn });
    } catch (err) {
      const message = `${site} failed with error ${err}`;
      console.log(message);
      await send_log2({ env, message });
    }
  }
  
  // src/tasks/handle_soe_results_page/get_soe_results_page_notices.js
  var import_node_html_parser4 = __toESM(require_dist(), 1);
  
  // src/tasks/common/strip_text.js
  function strip_text(text, completely = false) {
    let replace_with = "\n";
    if (completely)
      replace_with = "";
    return text.replace(/\n\n/gmi, replace_with);
  }
  
  // src/tasks/handle_soe_results_page/get_soe_results_page_notices.js
  async function get_soe_results_page_notices() {
    const notices = [];
    const soe_results_page_site_url = "http://soe.jnu.ac.in/for-students/examination-and-results";
    let dom = (0, import_node_html_parser4.parse)(
      await fetch(soe_results_page_site_url).then((res) => res.text())
    );
    const ul = dom.querySelector("#block-iu-content-fullwidth > article > div > div.field-iu-page-section.field-type-entity-reference-revisions.field-label-is-hidden > div.section.collapsed.bg-none.no-padding > div > div > div > div > div > div > div > div > div > ul");
    const lis = ul.querySelectorAll("li");
    lis.forEach((li) => {
      const notice_type = li.querySelector(".views-field-field-notice > .field-content").innerText;
      const desc = li.querySelector(".views-field-field-notice-text > .field-content").innerText;
      const date = li.querySelector(".views-field-field-notice-date > .field-content").innerText;
      const href = li.querySelector("a").getAttribute("href");
      const file_url = fix_url("http://soe.jnu.ac.in", href);
      const caption_text = `
  Desc      : ${strip_text(desc, true)}
  
  Category  : ${strip_text(notice_type, true)}
  
  Date      : ${strip_text(date, true)}`;
      notices.push({ file_url, caption_text });
    });
    return notices;
  }
  var get_soe_results_page_notices_default = get_soe_results_page_notices;
  
  // src/tasks/controllers/soe_results_page.js
  async function get_soe_results_page_db_json(env) {
    const { results } = await env.DB.prepare("SELECT json FROM jnu_bot WHERE site = ?").bind("soe.jnu.ac.in/for-students/examination-and-results").all();
    return results[0].json;
  }
  async function set_soe_results_page_db_json(env, json) {
    const { success } = await env.DB.prepare("UPDATE jnu_bot SET json = ? WHERE site = ? ").bind(JSON.stringify(json), "soe.jnu.ac.in/for-students/examination-and-results").run();
    return success;
  }
  
  // src/tasks/handle_soe_results_page/index.js
  async function handle_soe_results_page_notifications(env, bot2) {
    const site = "soe.jnu.ac.in/for-students/examination-and-results";
    const get_notices_fn = get_soe_results_page_notices_default;
    const get_db_json_fn = get_soe_results_page_db_json;
    const set_db_json_fn = set_soe_results_page_db_json;
    try {
      await send_notices({ site, env, bot: bot2, get_notices_fn, get_db_json_fn, set_db_json_fn });
    } catch (err) {
      const message = `${site} failed with error ${err}`;
      console.log(message);
      await send_log2({ env, message });
    }
  }
  
  // src/tasks/controllers/jnuee.js
  async function get_jnuee_db_json(env) {
    const { results } = await env.DB.prepare("SELECT json FROM jnu_bot WHERE site = ?").bind("jnuee.jnu.ac.in").all();
    return results[0].json;
  }
  async function set_jnuee_db_json(env, json) {
    const { success } = await env.DB.prepare("UPDATE jnu_bot SET json = ? WHERE site = ? ").bind(JSON.stringify(json), "jnuee.jnu.ac.in").run();
    return success;
  }
  
  // src/tasks/handle_jnuee_notifications/get_jnuee_notices.js
  var import_node_html_parser5 = __toESM(require_dist(), 1);
  async function get_jnuee_notices() {
    const notices = [];
    const jnuee_site_url = "https://jnuee.jnu.ac.in/";
    let dom = (0, import_node_html_parser5.parse)(
      await fetch(jnuee_site_url).then((res) => res.text())
    );
    let uls = dom.querySelectorAll("ul");
    for (let i = 0; i < 2; i++) {
      let ul = uls[i];
      let lis = ul.querySelectorAll("li");
      lis.forEach((li) => {
        let a = li.querySelector("a");
        let caption_text = a.innerText;
        let file_url = fix_url(jnuee_site_url, a.getAttribute("href"));
        notices.push({ file_url, caption_text });
      });
    }
    try {
      let as = dom.querySelectorAll("a.btn.btn-outline-success.btn-sm.btn-block.text-left.font-weight-bold.p-2");
      as.forEach((a) => {
        let caption_text = a.innerText.replace(/click {0,}here/gmi, "");
        let file_url = a.getAttribute("href");
        notices.push({ file_url, caption_text });
      });
    } catch (err) {
      console.log(`---- something went wrong in get_jnuee_notices.js`);
    }
    return notices;
  }
  var get_jnuee_notices_default = get_jnuee_notices;
  
  // src/tasks/handle_jnuee_notifications/index.js
  async function handle_jnuee_notifications(env, bot2) {
    const site = "jnuee.jnu.ac.in";
    const get_notices_fn = get_jnuee_notices_default;
    const get_db_json_fn = get_jnuee_db_json;
    const set_db_json_fn = set_jnuee_db_json;
    try {
      await send_notices({ site, env, bot: bot2, get_notices_fn, get_db_json_fn, set_db_json_fn });
    } catch (err) {
      const message = `${site} failed with error ${err}`;
      console.log(message);
      await send_log2({ env, message });
    }
  }
  
  // src/tasks/controllers/jnu_admissions.js
  async function get_jnu_admissions_db_json(env) {
    const { results } = await env.DB.prepare("SELECT json FROM jnu_bot WHERE site = ?").bind("jnu.ac.in/admissions").all();
    return results[0].json;
  }
  async function set_jnu_admissions_db_json(env, json) {
    const { success } = await env.DB.prepare("UPDATE jnu_bot SET json = ? WHERE site = ? ").bind(JSON.stringify(json), "jnu.ac.in/admissions").run();
    return success;
  }
  
  // src/tasks/handle_jnu_admissions_notices/get_jnu_admissions_notices.js
  var import_node_html_parser6 = __toESM(require_dist(), 1);
  async function get_jnu_admissions_notices() {
    const notices = [];
    const jnu_admissions_site_url = "https://www.jnu.ac.in/admissions";
    let dom = (0, import_node_html_parser6.parse)(
      await fetch(jnu_admissions_site_url).then((res) => res.text())
    );
    let tbody = dom.querySelector("tbody");
    let as = tbody.querySelectorAll("a");
    let proms = [];
    as.forEach((a, idx) => {
      if (idx < 6) {
        proms.push((async () => {
          let notice = await get_notice_from_url(fix_url("https://www.jnu.ac.in/", a.getAttribute("href")));
          notices.push(notice);
        })());
      }
    });
    await Promise.all(proms);
    return notices;
  }
  async function get_notice_from_url(url) {
    const dom = (0, import_node_html_parser6.parse)(await fetch(url).then((res) => res.text()));
    const div = dom.querySelector("#block-jnu-consilium-system-main");
    const a = div.querySelector("a");
    const date = div.querySelector("time")?.innerText;
    const file_url = fix_url("https://www.jnu.ac.in/", a.getAttribute("href"));
    const caption_text = `
  DESC  : ${a.innerText}
  
  Date  : ${date} `;
  console.log('DEBUG',{ file_url, caption_text });
  
    return { file_url, caption_text };
  }
  var get_jnu_admissions_notices_default = get_jnu_admissions_notices;
  
  // src/tasks/handle_jnu_admissions_notices/index.js
  async function handle_jnu_admissions_notices(env, bot2) {
    const site = "jnu.ac.in/admissions";
    const get_notices_fn = get_jnu_admissions_notices_default;
    const get_db_json_fn = get_jnu_admissions_db_json;
    const set_db_json_fn = set_jnu_admissions_db_json;
    try {
      await send_notices({ site, env, bot: bot2, get_notices_fn, get_db_json_fn, set_db_json_fn });
    } catch (err) {
      const message = `${site} failed with error ${err}`;
      console.log(message);
      await send_log2({ env, message });
    }
  }
  
  // src/tasks/handle_crs_notices/get_crs_notices.js
  var import_node_html_parser7 = __toESM(require_dist(), 1);
  async function get_crs_notices() {
    const notices = [];
    const jnu_crs_site_url = "https://www.jnu.ac.in/sllcs/crs";
    let dom = (0, import_node_html_parser7.parse)(
      await fetch(jnu_crs_site_url).then((res) => res.text())
    );
    const as = dom.querySelectorAll("p > a");
    as.forEach((a) => {
      const file_url = fix_url("https://jnu.ac.in/", a.getAttribute("href"));
      const caption_text = a.innerText;
      if (a.innerText.replace(/\&nbsp;[ ]?/gim, "") == "")
        return;
      notices.push({ file_url, caption_text });
    });
    return notices;
  }
  var get_crs_notices_default = get_crs_notices;
  
  // src/tasks/controllers/crs.js
  async function get_crs_db_json(env) {
    const { results } = await env.DB.prepare("SELECT json FROM jnu_bot WHERE site = ? ").bind("jnu.ac.in/sllcs/crs").all();
    return results[0].json;
  }
  async function set_crs_db_json(env, json) {
    const { success } = await env.DB.prepare("UPDATE jnu_bot SET json = ? WHERE site = ? ").bind(JSON.stringify(json), "jnu.ac.in/sllcs/crs").run();
    return success;
  }
  
  // src/tasks/handle_crs_notices/index.js
  async function handle_crs_notices(env, bot2) {
    const site = "jnu.ac.in/sllcs/crs";
    const get_notices_fn = get_crs_notices_default;
    const get_db_json_fn = get_crs_db_json;
    const set_db_json_fn = set_crs_db_json;
    try {
      await send_notices({ site, env, bot: bot2, get_notices_fn, get_db_json_fn, set_db_json_fn });
    } catch (err) {
      const message = `${site} failed with error ${err}`;
      console.log(message);
      await send_log2({ env, message });
    }
  }
  
  // src/tasks/controllers/mca_scss.js
  async function get_mca_scss_db_json(env) {
    const { results } = await env.DB.prepare("SELECT json FROM jnu_bot WHERE site = ?").bind("jnu.ac.in/scss-upcoming-events").all();
    return results[0].json;
  }
  async function set_mca_scss_db_json(env, json) {
    const { success } = await env.DB.prepare("UPDATE jnu_bot SET json = ? WHERE site = ? ").bind(JSON.stringify(json), "jnu.ac.in/scss-upcoming-events").run();
    return success;
  }
  
  // src/tasks/handle_mca_scss_events/get_mcs_scss_notices.js
  var import_node_html_parser8 = __toESM(require_dist(), 1);
  async function get_mca_scss_notices() {
    const notices = [];
    const site_url = "https://www.jnu.ac.in/scss-upcoming-events";
    const dom = (0, import_node_html_parser8.parse)(
      await fetch(site_url).then((res) => res.text())
    );
    const div = dom.querySelector("#block-jnu-consilium-system-main > div > article > div > div");
    const a = div.querySelector("a");
    const file_url = a.getAttribute("href");
    const caption_text = div.innerText.replace(/\&nbsp; {0,}/gim, " ").replace(/\&amp; {0,}/gim, "&").replace(/\&[a-z]{1,};/gim, " ");
    notices.push({ file_url, caption_text });
    return notices;
  }
  var get_mcs_scss_notices_default = get_mca_scss_notices;
  
  // src/tasks/handle_mca_scss_events/index.js
  async function handle_mca_scss_events(env, bot2) {
    const site = "jnu.ac.in/scss-upcoming-events \n (helpful for B.Tech too)";
    const get_notices_fn = get_mcs_scss_notices_default;
    const get_db_json_fn = get_mca_scss_db_json;
    const set_db_json_fn = set_mca_scss_db_json;
    try {
      await send_notices({ site, env, bot: bot2, get_notices_fn, get_db_json_fn, set_db_json_fn });
    } catch (err) {
      const message = `${site} failed with error ${err}`;
      console.log(message);
      await send_log2({ env, message });
    }
  }
  
  // src/tasks/index.js
  var tasks_default = {
    handle_soe_notifications,
    handle_iha_notifications,
    handle_jnu_notifications,
    handle_soe_results_page: handle_soe_results_page_notifications,
    handle_jnuee_notifications,
    handle_jnu_admissions_notices,
    handle_crs_notices,
    handle_mca_scss_events
  };
  
  // src/worker.js
  var bot = null;
  var worker_default = {
    async fetch(request, env, ctx) {
      let pk = "how did you get here?";
      await ctx.waitUntil(await run_scheduled(env));
      return Response.json({ pk, status: "i wana know your name" });
    },
    async scheduled(event, env, ctx) {
      bot = new bot_default(env.BOT_TOKEN);
      bot.set_chatid(env.CHANNEL_ID);
      await ctx.waitUntil(await run_scheduled(env));
    }
  };
  async function run_scheduled(env) {
    let requests = [];
    requests.push(tasks_default.handle_crs_notices(env, bot));
    requests.push(tasks_default.handle_mca_scss_events(env, bot));
    requests.push(tasks_default.handle_soe_results_page(env, bot));
    requests.push(tasks_default.handle_iha_notifications(env, bot));
    requests.push(tasks_default.handle_jnu_notifications(env, bot));
    requests.push(tasks_default.handle_soe_notifications(env, bot));
    requests.push(tasks_default.handle_jnuee_notifications(env, bot));
    requests.push(tasks_default.handle_jnu_admissions_notices(env, bot));
    console.log(" \u{1F971} waiting for subtasks");
    await Promise.all(requests);
    console.log(" \u2705 all tasks checked ");
  }
  
  