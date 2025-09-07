/**
 * Café Serenity - Service Worker
 * PWA対応とオフライン機能の実装
 */

const CACHE_NAME = 'cafe-serenity-v1.0.0';
const OFFLINE_URL = '/offline.html';

// キャッシュするリソースのリスト
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/css/critical.css',
    '/css/main.css',
    '/js/main.js',
    '/manifest.json',
    '/offline.html',
    // フォント
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Playfair+Display:wght@400;500;600;700&display=swap',
    // アイコン
    '/images/icons/favicon.ico',
    '/images/icons/favicon-96x96.png',
    '/images/icons/apple-touch-icon.png',
    '/images/icons/web-app-manifest-192x192.png',
    '/images/icons/web-app-manifest-512x512.png',
    // ヒーロー画像（重要な画像のみ）
    '/images/hero/hero-main.png'
];

// 画像用の別キャッシュ
const IMAGE_CACHE_NAME = 'cafe-serenity-images-v1.0.0';

// インストールイベント
self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            // 静的リソースをキャッシュ
            await cache.addAll(STATIC_CACHE_URLS);
            
            // オフラインページを個別にキャッシュ（エラーハンドリング付き）
            try {
                const offlineRequest = new Request(OFFLINE_URL);
                const offlineResponse = await fetch(offlineRequest);
                await cache.put(offlineRequest, offlineResponse);
            } catch (error) {
                console.error('Failed to cache offline page:', error);
            }
        })()
    );
    
    // 即座にアクティベート
    self.skipWaiting();
});

// アクティベートイベント
self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            // 古いキャッシュを削除
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('cafe-serenity-') && name !== CACHE_NAME && name !== IMAGE_CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
            
            // すべてのクライアントを制御
            await clients.claim();
        })()
    );
});

// フェッチイベント
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 同一オリジンのリクエストのみ処理
    if (url.origin !== location.origin) {
        return;
    }
    
    // ナビゲーションリクエスト（HTML）
    if (request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    // ネットワークファースト戦略
                    const networkResponse = await fetch(request);
                    
                    // 成功したレスポンスをキャッシュ
                    if (networkResponse.ok) {
                        const cache = await caches.open(CACHE_NAME);
                        cache.put(request, networkResponse.clone());
                    }
                    
                    return networkResponse;
                } catch (error) {
                    // オフライン時はキャッシュから取得
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    // キャッシュにもない場合はオフラインページを表示
                    const offlineResponse = await caches.match(OFFLINE_URL);
                    return offlineResponse || new Response('オフラインです', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain; charset=utf-8'
                        })
                    });
                }
            })()
        );
        return;
    }
    
    // 画像リクエスト
    if (request.destination === 'image') {
        event.respondWith(
            (async () => {
                const cache = await caches.open(IMAGE_CACHE_NAME);
                const cachedResponse = await cache.match(request);
                
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                try {
                    const networkResponse = await fetch(request);
                    
                    // 成功した画像レスポンスをキャッシュ
                    if (networkResponse.ok) {
                        cache.put(request, networkResponse.clone());
                    }
                    
                    return networkResponse;
                } catch (error) {
                    // プレースホルダー画像を返す
                    return new Response(
                        `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="#e7e5e4"/>
                            <text x="50%" y="50%" font-family="sans-serif" font-size="18" fill="#78716c" text-anchor="middle" dy="0.3em">画像を読み込めません</text>
                        </svg>`,
                        {
                            headers: {
                                'Content-Type': 'image/svg+xml',
                                'Cache-Control': 'no-store'
                            }
                        }
                    );
                }
            })()
        );
        return;
    }
    
    // その他のリソース（CSS、JS等）
    event.respondWith(
        (async () => {
            // キャッシュファースト戦略
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            try {
                const networkResponse = await fetch(request);
                
                // 成功したレスポンスをキャッシュ
                if (networkResponse.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, networkResponse.clone());
                }
                
                return networkResponse;
            } catch (error) {
                console.error('Fetch failed:', error);
                // エラーレスポンスを返す
                return new Response('リソースを取得できません', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain; charset=utf-8'
                    })
                });
            }
        })()
    );
});

// バックグラウンド同期（将来の実装用）
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncFormData());
    }
});

// プッシュ通知（将来の実装用）
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/images/icons/web-app-manifest-192x192.png',
            badge: '/images/icons/favicon-96x96.png',
            vibrate: [200, 100, 200],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '1'
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// 通知クリックイベント
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

// フォームデータの同期（実装例）
async function syncFormData() {
    // IndexedDBからペンディングのフォームデータを取得して送信
    // この機能は実際のバックエンドAPIに合わせて実装する必要があります
    console.log('Syncing form data...');
}
