import send_message from "./send_message.js";
import send_remote_file from "./send_remote_file.js";

function send_remote_files(bot_token, chat_id, files) {
    let requests = [];
    files.forEach((file) => {

        // patch for non pdfs
        if (file.file_url.search(/\.pdf/gmi) == -1) {
            requests.push(send_message(bot_token, chat_id, `Visit : ${file.file_url} \n\n\n${file.caption_text}`))
            return;
        }

        requests.push(send_remote_file(bot_token, chat_id, file.file_url, file.caption_text));
    });
    return Promise.all(requests);
}


export default send_remote_files;