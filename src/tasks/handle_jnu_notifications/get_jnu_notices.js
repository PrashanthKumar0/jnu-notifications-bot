import { parse } from "node-html-parser";
import { fix_url } from "../common/fix_url.js";

// Returns notice[]
// notice : { file_url, caption_text }
async function get_jnu_notices() {
    const notices = [];
    const jnu_notices_site_url = "https://www.jnu.ac.in/notices";
    let dom = parse(
        await fetch(jnu_notices_site_url).then((res) => res.text())
    );

    const tbody = dom.querySelector('#block-jnu-consilium-system-main > div > div > div > div > table > tbody')
    const trs = tbody.querySelectorAll('tr');

    trs.forEach(tr => {
        const a = tr.querySelector('a');
        const href = a.getAttribute('href');
        const date = tr.querySelector('.views-field-field-notice-date').innerText;

        const file_url = fix_url('https://www.jnu.ac.in/', href);
        
        const caption_text =
            `\nDesc     : ${a.innerText}\n\n\nDate     : ${date}`;

        notices.push({ file_url, caption_text });
    })

    return notices;
}

export default get_jnu_notices;