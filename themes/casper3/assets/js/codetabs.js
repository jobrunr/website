document.addEventListener('DOMContentLoaded', () => {  
    const contents = document.querySelectorAll(".tab-container .tabpanel");
    const tabs = document.querySelectorAll(".tab-container .nav-tabs li");

    const setActive = (tabType) => {
        document.querySelectorAll(`.tab-container .nav-tabs li[data-type="${tabType}"]`).forEach(function(tab) {
            tab.classList.add('active'); 
        })
        document.querySelectorAll(`.tabpanel[data-type="${tabType}"]`)?.forEach(function(content) {
            content.classList.add('active'); 
        }); 
    }

    tabs.forEach((tab) => {  
        tab.addEventListener('click', () => {  
            const tabType = tab.getAttribute('data-type');
            
            tabs.forEach(t => t.classList.remove('active'));  
            contents.forEach(c => c.classList.remove('active'));
            
            setActive(tabType);
        });  
    }); 

    if (tabs.length > 0) {  
        setActive(tabs[0].getAttribute('data-type')) 
    }
    
});  
