const publicVapidKey = 'BJ5lPY0qjF1Tx9v9AvS7ajodgmXdmOCiPwpROPmBMY2Jk3DRaxCe6q8NoW8vS592V0-kec77xMPO514qf5AcVk4';
const host = 'https://stage.usdt.town'
const uid = generateUUID();
const dom = {
	btn: document.querySelector('.btn-go'),
}
const options = {
	userVisibleOnly: true,
	applicationServerKey: urlB64ToUint8Array(publicVapidKey)
};

/**
 * 註冊 Service Worker
 * 這是 PWA 的核心，用於背景處理、快取和接收推播通知
 */
async function registerServiceWorker() {
	try {
		const reg = await navigator.serviceWorker.register('./sw.js');
		console.log('Service Worker successful registration:', reg);
	} catch (err) {
		handleError('Service Worker registration failed:', err);
	}
}

/**
 * 訂閱使用者的推播通知
 */
async function subscribeUser() {
	dom.btn.disabled = true

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

/**
 * 統一的錯誤處理函數
 * @param {string} message - 要顯示在控制台的錯誤訊息
 * @param {Error} err - 捕獲到的錯誤對象
 */
function handleError(message, err) {
	console.error(message, err);
	redirect();
}

/**
 * 重定向到帶有使用者ID的結果頁面
 */
function redirect() {
	dom.btn.disabled = false;
	window.location.href = `${host}/vapid/${uid}`;
}

/**
 * 將 URL安全的 Base64 編碼的 VAPID 金鑰轉換為 Uint8Array
 * 這是 Push API 的 `applicationServerKey` 所需的格式
 * @param {string} base64String - Base64 編碼的字串
 * @returns {Uint8Array}
 */
function urlB64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = window.atob(base64);
	return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

/**
 * 生成一個符合 RFC4122 v4 標準的 UUID (通用唯一辨識碼)
 * @returns {string}
 */
function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

/**
 * 檢查通知權限並在必要時重定向
 * 主要用於獨立模式 (Standalone PWA)，當應用程式像原生App一樣從主畫面啟動時
 */
async function checkPermissionAndRedirect() {
    try {
		// 如果使用者已經明確做出選擇 (允許或拒絕)
		if (Notification.permission !== 'default') {
            redirect();
		}
    } catch (err) {
        console.error('Error checking subscription:', err);
        redirect();
    }
}

if ('serviceWorker' in navigator) {
	registerServiceWorker()
}

dom.btn.onclick = subscribeUser;

/** 如果是獨立模式，則重定向 */
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
	checkPermissionAndRedirect();
}

/**
 * 在頁面關閉或刷新前，嘗試保存頁面上的圖片狀態到 localStorage
 */
window.onbeforeunload = function() {
	const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
    localStorage.setItem('pwaState', JSON.stringify({
        images: images,
    }));
};

/**
 * 頁面加載完成時，嘗試從 localStorage 恢復之前保存的圖片狀態
 */
window.addEventListener('load', () => {
	const savedState = localStorage.getItem('pwaState');
    if (savedState) {
        const state = JSON.parse(savedState);
        const images = document.querySelectorAll('img');
        state.images.forEach((src, index) => {
            if (images[index]) {
                images[index].src = src;
            }
        });
    }
});