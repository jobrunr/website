const initUptimeKumaStatus = () => {
    const container = document.getElementById('uptime-kuma-status')
    if (!container) return

    const fallbackImg = container.dataset.fallbackImg

    container.querySelectorAll('img[data-badge]').forEach(badge => {
        const live = new Image()
        live.onload = () => badge.src = live.src
        live.onerror = () => {
            badge.src = fallbackImg
            badge.title = "Could not reach the JobRunr status server"
        }
        live.src = badge.dataset.badge
    })
}

if (document.readyState === 'complete') {
    initUptimeKumaStatus()
} else {
    window.addEventListener('load', initUptimeKumaStatus)
}
