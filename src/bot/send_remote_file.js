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
    }).then((res) => res.json());
    return res;
}

export default send_remote_file;