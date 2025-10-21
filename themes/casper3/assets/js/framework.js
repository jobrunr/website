document.addEventListener('DOMContentLoaded', () => {
    const contents = document.querySelectorAll(".framework-content");
    const tabs = document.querySelectorAll(".framework-container .nav-tabs li");
    const possibleTypes = [...document.querySelectorAll(".framework-button")].map(type => type.dataset.type);

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

            const url = new URL(window.location.href)
            url.searchParams.set('framework', tabType)
            window.history.pushState({}, '', url)
        });  
    }); 

    if (tabs.length > 0) {  
        setActive(tabs[0].getAttribute('data-type')) 
    }

    const queryParams = new URLSearchParams(document.location.search)
    const possibleFrameworkType = queryParams.get("framework")
    if(possibleTypes.includes(possibleFrameworkType)) {
        removeActive(possibleFrameworkType)
        setActive(possibleFrameworkType)
    }
});  
