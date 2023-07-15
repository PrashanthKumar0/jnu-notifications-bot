import { parse } from "node-html-parser";
import { fix_url } from "../common/fix_url.js";

// Returns notice[]
// notice : { file_url, caption_text }
async function get_soe_notices() {
    const notices = [];
    const soe_site_url = "http://soe.jnu.ac.in/";
    let dom = parse(
        await fetch(soe_site_url).then((res) => res.text())
    );
    let marquee_container = dom.querySelector("#block-gridblockhomepage > div > div > div:nth-child(2) > div > div > div > div > div > div > div > div > marquee");
    let marquee_rows = marquee_container.querySelectorAll(".marquee-row")

    marquee_rows.forEach(marquee_row => {
        const a = marquee_row.querySelector('a')
        const date = marquee_row.querySelector('time').innerText;
        const desc = a.innerText;

        const caption_text = `DESC : ${desc}\n\nDATE : ${date}`
        const href = a.getAttribute('href');
        const file_url = fix_url(soe_site_url, href);

        notices.push({ file_url, caption_text })
    });

    return notices;
}

export default get_soe_notices;