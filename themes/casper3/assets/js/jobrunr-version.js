const versionPlaceholders = Array.from(document.querySelectorAll('code')).filter(el => el.textContent.includes('${jobrunr.version}'));
if(versionPlaceholders.length > 0) {
    fetch('https://api.jobrunr.io/api/version/jobrunr/latest')
        .then(response => response.json())
        .then(json => { 
                versionPlaceholders.forEach(placeHolder => placeHolder.innerHTML = placeHolder.innerHTML.replace('${jobrunr.version}', json.latestVersion));
        });
}