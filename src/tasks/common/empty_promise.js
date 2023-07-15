export function empty_promise() {
    return new Promise((res, rej) => res());
}