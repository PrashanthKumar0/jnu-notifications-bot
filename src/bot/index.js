import send_message from "./send_message.js";
import send_remote_file from "./send_remote_file.js";
import send_remote_files from "./send_remote_files.js";


class Bot {
    constructor(bot_token, chat_id = "") {
        this.bot_token = bot_token;
        this.chat_id = chat_id;
    }

    // has method chaining capacity
    set_chatid(chat_id) {
        this.chat_id = chat_id;
        return this;
    }

    // Returns promise
    send_message(message) {
        return send_message(this.bot_token, this.chat_id, message);
    }

    // Returns promise
    send_remote_file(file_url, caption_text) {
        // Temporarry Patch for non pdf files :P
        if (file_url.search(".pdf") == -1) {
            return this.send_message(`Visit : ${file_url}\n\nDESC : ${caption_text}`);
        }
        return send_remote_file(this.bot_token, this.chat_id, file_url, caption_text);
    }

    // Returns Promises[]
    send_bulk_messages(message_list) {
        let proms = [];
        message_list.forEach((message) => {
            proms.push(send_message(this.bot_token, this.chat_id, message));
        });
        return Promise.all(proms);
    }

    // Returns Promises[]
    send_remote_files(files) {
        return send_remote_files(this.bot_token, this.chat_id, files);
    }

    // Alias to Bot::send_remote_files
    // Returns Promises[]
    send_notices(notices) {
        return this.send_remote_files(notices);
    }
};
export default Bot;
