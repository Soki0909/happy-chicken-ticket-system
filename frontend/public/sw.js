/**
 * Happy Chicken Ticket System - Service Worker
 * PWA対応とオフライン機能
 */

const CACHE_NAME = 'happy-chicken-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/scripts/main.js',
    '/assets/images/happy-chicken-logo.svg'
];

// Service Worker のインストール
self.addEventListener('install', (event) => {
    console.log('🐔 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('❌ Service Worker: Cache failed', error);
            })
    );
});

// Service Worker のアクティブ化
self.addEventListener('activate', (event) => {
    console.log('🐔 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // API リクエストの処理
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // API レスポンスはキャッシュしない
                    return response;
                })
                .catch((error) => {
                    console.error('❌ Service Worker: API request failed', error);
                    // オフライン時のフォールバック
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: 'ネットワークに接続できません。インターネット接続を確認してください。'
                        }),
                        {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                })
        );
        return;
    }
    
    // 静的ファイルの処理
    event.respondWith(
        caches.match(request)
            .then((response) => {
                if (response) {
                    console.log('💾 Service Worker: Serving from cache', request.url);
                    return response;
                }
                
                return fetch(request)
                    .then((response) => {
                        // レスポンスが有効でない場合はそのまま返す
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // レスポンスをクローンしてキャッシュに保存
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('❌ Service Worker: Fetch failed', error);
                        
                        // オフライン時のフォールバック（HTMLページの場合）
                        if (request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'ticket-update') {
        event.waitUntil(
            // バックグラウンドでチケット情報を更新
            updateTicketInBackground()
        );
    }
});

// プッシュ通知（将来の拡張用）
self.addEventListener('push', (event) => {
    console.log('🔔 Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'ハッピーチキンからのお知らせ',
        icon: '/assets/images/happy-chicken-logo.svg',
        badge: '/assets/images/happy-chicken-logo.svg',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '確認する',
                icon: '/assets/images/checkmark.png'
            },
            {
                action: 'close',
                title: '閉じる',
                icon: '/assets/images/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('ハッピーチキン', options)
    );
});

// 通知クリック処理
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Service Worker: Notification clicked', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * バックグラウンドでのチケット更新（将来の拡張用）
 */
async function updateTicketInBackground() {
    try {
        // localStorage からセッション情報を取得
        // Service Worker では localStorage にアクセスできないため、
        // IndexedDB などを使用する必要がある
        console.log('🔄 Service Worker: Background ticket update');
        
        // 実装は後で追加
        return Promise.resolve();
    } catch (error) {
        console.error('❌ Service Worker: Background update failed', error);
        return Promise.reject(error);
    }
}