export function filter_notices(notices, cached_notices) {
    return notices.filter(notice => {

        for (let i = 0; i < cached_notices.length; i++) {
            if (notice.file_url == cached_notices[i].file_url) {
                return false; // dont take it
            }
        }

        return true; // take it
    });
}