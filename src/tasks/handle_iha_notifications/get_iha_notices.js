import { parse } from "node-html-parser";
import { fix_url } from "../common/fix_url.js";

// Returns notice[]
// notice : { file_url, caption_text }
async function get_iha_notices() {
    const notices = [];
    const iha_site_url = "https://jnu.ac.in/iha-notices";
    let dom = parse(
        await fetch(iha_site_url).then((res) => res.text())
    );

    const tbody = dom.querySelector('#block-jnu-consilium-system-main > div > div > div > div.view-content > table > tbody');
    const trs = tbody.querySelectorAll('tr');

    trs.forEach(tr => {
        const desc = tr.querySelector('.views-field-field-notice').innerText;
        const date = tr.querySelector('time').innerText;
        const a = tr.querySelector('a');
        const href = a.getAttribute('href');

        const file_url = fix_url('https://jnu.ac.in', href);
        const caption_text =
            `\nDesc      : ${desc}\n\nFile Name : ${a.innerText}\n\n\nDate      : ${date}`;

        if (notices.length < 5) //TODO: Remove this condition as its just a temporarry patch to solve an issue of repetedly sending notices
            notices.push({ file_url, caption_text });
            
    });


    return notices;
}

export default get_iha_notices;