window.activateLoadScreen = function (time) {
    const loadscreen = document.getElementById('loadscreen');
    const defaultWaitTime = 3000;
    loadscreen.classList.add('active');

    setTimeout(() => {
        loadscreen.classList.remove('active');
    }, time || defaultWaitTime);
}