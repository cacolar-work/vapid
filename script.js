const publicVapidKey = 'BJ5lPY0qjF1Tx9v9AvS7ajodgmXdmOCiPwpROPmBMY2Jk3DRaxCe6q8NoW8vS592V0-kec77xMPO514qf5AcVk4';
const host = 'https://stage.usdt.town'
const uid = generateUUID();
const dom = {
	loading: document.querySelector('.spinner-border'),
	main: document.querySelector('.d-main'),
	btn: document.querySelector('.btn-go'),
}
const options = {
	userVisibleOnly: true,
	applicationServerKey: urlB64ToUint8Array(publicVapidKey)
};

async function registerServiceWorker() {
	try {
		const reg = await navigator.serviceWorker.register('./sw.js');
		console.log('Service Worker successful registration:', reg);
		dom.loading.classList.add('d-none');
		dom.main.classList.remove('d-none');
	} catch (err) {
		handleError('Service Worker registration failed:', err);
	}
}

async function subscribeUser() {
	dom.btn.disabled = true
	dom.loading.classList.remove('d-none')
	dom.main.classList.add('d-none')

	try {
		const permission = await Notification.requestPermission()
		if (permission !== 'granted') {
			redirect()
			return
		}

		const reg = await navigator.serviceWorker.ready
		const subscription = await reg.pushManager.subscribe(options)
		console.log('User Subscription:', subscription);

		const form = new FormData()
		form.append('json', JSON.stringify(subscription))
		form.append('uid', uid)
		await fetch(host + '/vapid', {
			method: 'POST',
			body: form
		})

		redirect()
	} catch (err) {
		handleError('Subscription failed:', err);
	}
}

function handleError(message, err) {
	console.error(message, err);
	redirect();
}

function redirect() {
	dom.loading.classList.add('d-none');
	dom.main.classList.remove('d-none');
	dom.btn.disabled = false;
	window.location.href = `${host}/vapid/${uid}`;
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

async function checkSubscriptionAndRedirect() {
    try {
        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.getSubscription();
        if (subscription !== null) {
            redirect();
        }
    } catch (err) {
        console.error('Error checking subscription:', err);
    }
}

if ('serviceWorker' in navigator) {
	registerServiceWorker()
}

dom.btn.onclick = subscribeUser;

/** 如果是獨立模式，則重定向 */
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
	dom.btn.classList.add('d-none');
	dom.loading.classList.remove('d-none')
	checkSubscriptionAndRedirect();
}

/** 返回PWA重整畫面避免空白 */
window.onbeforeunload = function() {
    window.location.reload();
};