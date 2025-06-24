const publicVapidKey = 'BJ5lPY0qjF1Tx9v9AvS7ajodgmXdmOCiPwpROPmBMY2Jk3DRaxCe6q8NoW8vS592V0-kec77xMPO514qf5AcVk4';
const host = 'https://stage.usdt.town'
const uid = generateUUID();
const dom = {
    loading: document.querySelector('.spinner-border'),
    btn: document.querySelector('.btn-go'),
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
            dom.btn.classList.remove('d-none')
            dom.btn.onclick = _ => {
		dom.btn.disabled = true
                reg.pushManager.subscribe(options)
                    .then(async subscription => {
                        console.log('User Subscription:', subscription);
                        const form = new FormData()
                        form.append('json', JSON.stringify(subscription))
			form.append('uid', uid)
			await fetch(host + '/vapid', {
				method: 'POST',
				body: form
			})
			window.location.href = `${host}/vapid/${uid}`
                    })
                    .catch(err => {
                        console.error('Subscription failed:', err);
				window.location.href = host
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

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
