const publicVapidKey = 'BJ5lPY0qjF1Tx9v9AvS7ajodgmXdmOCiPwpROPmBMY2Jk3DRaxCe6q8NoW8vS592V0-kec77xMPO514qf5AcVk4';
const dom = {
    loading: document.querySelector('.spinner-border'),
    form: document.querySelector('.form-submit'),
    input: document.querySelector('.input-vapid'),
}
const options = {
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(publicVapidKey)
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(reg => {
            console.log('Service Worker successful registration:', reg);
            dom.loading.classList.add('d-none')
            dom.form.classList.remove('d-none')
            dom.form.onsubmit = e => {
                e.preventDefault()
                reg.pushManager.subscribe(options)
                    .then(subscription => {
                        console.log('User Subscription:', subscription);
                        dom.input.value = JSON.stringify(subscription);
                        dom.form.submit();
                    })
                    .catch(err => {
                        console.error('Subscription failed:', err);
                        dom.form.submit();
                    });
            }

        })
        .catch(err => console.error('Service Worker registration failed:', err));
}

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}
