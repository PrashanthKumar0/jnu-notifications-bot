import { parse } from "node-html-parser";
import { fix_url } from "../common/fix_url.js";
import { strip_text } from "../common/strip_text.js";


// Returns notice[]
// notice : { file_url, caption_text }
async function get_soe_results_page_notices() {
    const notices = [];
    const soe_results_page_site_url = "http://soe.jnu.ac.in/for-students/examination-and-results";
    let dom = parse(
        await fetch(soe_results_page_site_url).then((res) => res.text())
    );

    const ul = dom.querySelector('#block-iu-content-fullwidth > article > div > div.field-iu-page-section.field-type-entity-reference-revisions.field-label-is-hidden > div.section.collapsed.bg-none.no-padding > div > div > div > div > div > div > div > div > div > ul')
    const lis = ul.querySelectorAll('li');

    lis.forEach(li => {
        const notice_type =
            li.querySelector('.views-field-field-notice > .field-content').innerText;
        const desc =
            li.querySelector('.views-field-field-notice-text > .field-content').innerText;
        const date =
            li.querySelector('.views-field-field-notice-date > .field-content').innerText;
        const href = li.querySelector('a').getAttribute('href');

        const file_url = fix_url('http://soe.jnu.ac.in', href);
        const caption_text =
            `\nDesc      : ${strip_text(desc,true)}\n\nCategory  : ${strip_text(notice_type, true)}\n\nDate      : ${strip_text(date, true)}`;

        notices.push({ file_url, caption_text });

    });

    return notices;
}


export default get_soe_results_page_notices;