export function strip_text(text, completely = false) {
    let replace_with = '\n';
    if (completely) replace_with = '';

    return text.replace(/\n\n/gmi, replace_with);
}
