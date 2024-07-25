document.addEventListener('DOMContentLoaded', () => {
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
    
});  
