document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('uptime-kuma-status')
    const badges = container.querySelectorAll('img')
    const fallbackImg = container.dataset.fallbackImg

    fetch(badges[0].src, { signal: AbortSignal.timeout(5000) })
    .catch(e => {
        // The status server itself is down!
        [...badges].forEach(b => {
            b.src = fallbackImg
            b.title = "JobRunr Stats Server is down"
        })
    });
});