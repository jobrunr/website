const initUptimeKumaStatus = () => {
    const container = document.getElementById('uptime-kuma-status')
    if (!container) return

    const fallbackImg = container.dataset.fallbackImg

    container.querySelectorAll('img').forEach(badge => {
        badge.addEventListener('error', () => {
            badge.src = fallbackImg
            badge.title = "JobRunr Stats Server is down"
        })
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUptimeKumaStatus)
} else {
    initUptimeKumaStatus()
}
