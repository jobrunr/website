document.addEventListener('DOMContentLoaded', () => {

    function setupFramework() {
        const contents = document.querySelectorAll(".framework-content");
        const tabs = document.querySelectorAll(".framework-container .nav-tabs li");

        const setActive = (tabType) => {
            document.querySelectorAll(`.framework-container .nav-tabs li[data-type="${tabType}"]`).forEach(function(tab) {
                tab.classList.add('active'); 
            })
            document.querySelectorAll(`.framework-content[data-type="${tabType}"]`)?.forEach(function(content) {
                content.classList.add('active'); 
            }); 
        }

        const removeActive = (nextTabType) => {
            document.querySelectorAll(".framework-content.active").forEach(x => x.classList.remove("active"));
            document.querySelectorAll(".framework-container .nav-tabs li.active").forEach(x => x.classList.remove("active"));
        }

        tabs.forEach((tab) => {  
            tab.addEventListener('click', () => {  
                const tabType = tab.getAttribute('data-type');
                removeActive(tabType);
                setActive(tabType);
            });  
        }); 

        if (tabs.length > 0) {  
            setActive(tabs[0].getAttribute('data-type')) 
        }
    }

    function setupCodeTabs() {
        const tabsContainer = document.querySelectorAll(".tab-container");
        const contents = document.querySelectorAll(".framework-content");
        const tabs = document.querySelectorAll(".tab-container .nav-tabs li");

        const setActive = (tabType) => {
            console.log('tester!!');
            document.querySelectorAll(`.tab-container .nav-tabs li[data-type="${tabType}"]`).forEach(function(tab) {
                tab.classList.add('active'); 
            })
            document.querySelectorAll(`.framework-content[data-type="${tabType}"]`)?.forEach(function(content) {
                content.classList.add('active'); 
            });
        }

        const removeActive = (nextTabType) => {
            tabsContainer.forEach(tabContainer => {
                const activeTab = tabContainer.querySelector(".nav-tabs li.active");
                if(!activeTab) return;
                const nextActiveTab = tabContainer.querySelector(`.nav-tabs li[data-type="${nextTabType}`);
                if(!nextActiveTab) return;
                activeTab.classList.remove("active");
                tabContainer.querySelector(".framework-content.active")?.classList.remove("active");
            })
        }

        tabs.forEach((tab) => {  
            tab.addEventListener('click', () => {  
                const tabType = tab.getAttribute('data-type');
                console.log('test ron: ', tabType)
                removeActive(tabType);
                setActive(tabType);
            });  
        }); 

        if (tabs.length > 0) {  
            setActive(tabs[0].getAttribute('data-type')) 
        }        
    }

    function setupUptimeKumaBadges() {
        const badges = document.querySelectorAll('#uptime-kuma-status img')

        try {
            fetch(badges[0].src, { signal: AbortSignal.timeout(5000) })
        } catch {
            // The status server itself is down!
            [...badges].forEach(b => {
                b.src = "/shield-down.svg"
                b.title = "JobRunr Stats Server is down"
            })
        }
    }

    setupFramework();
    setupCodeTabs();
    setupUptimeKumaBadges();
});  
