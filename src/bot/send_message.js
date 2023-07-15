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
    }).then((res) => res.json());
    return res;
}

export default send_message;