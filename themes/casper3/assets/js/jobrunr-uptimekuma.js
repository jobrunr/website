document.addEventListener('DOMContentLoaded', () => {
    const badges = document.querySelectorAll('#uptime-kuma-status img')

    fetch(badges[0].src, { signal: AbortSignal.timeout(5000) })
    .catch(e => {
        // The status server itself is down!
        [...badges].forEach(b => {
            b.src = "/shield-down.svg"
            b.title = "JobRunr Stats Server is down"
        })
    });
});
