// fix url if its in the for 
// /somewhere/spmethings or somewhere/spmethings
// to 
// https://example.com/somewhere/spmethings
// prefix == https://example.com or https://example.com/
export function fix_url(prefix, url) {

    // strip tailing / in prefix
    // so https://example.com/ becomes https://example.com
    if (prefix[prefix.length - 1] == '/') prefix = prefix.substr(0, prefix.length - 1);

    // if url doesnot contain https:// or http:// then add prefix
    if (!(url.substr(0, 7).toLowerCase() == "http://" || url.substr(0, 8).toLowerCase() == "https://")) {
        // if url already has leading / 
        // eg : /somewhere/somethings
        if (url[0] == "/")
            url = prefix + url;
        else
            url = prefix + "/" + url;
    }

    return url;
}
