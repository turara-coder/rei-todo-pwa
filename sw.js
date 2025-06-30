// れいのToDo PWA - Service Worker
const CACHE_NAME = 'rei-todo-v23';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/celebration.js',
    '/weather-system.js',
    '/anniversary-system.js',
    '/notification-system.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// インストール時
self.addEventListener('install', function(event) {
    console.log('Service Worker: インストール中...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Service Worker: ファイルをキャッシュ中...');
                return cache.addAll(urlsToCache);
            })
            .catch(function(error) {
                console.log('Service Worker: キャッシュエラー', error);
            })
    );
});

// アクティベート時
self.addEventListener('activate', function(event) {
    console.log('Service Worker: アクティベート中...');
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: 古いキャッシュを削除', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// フェッチ時（ネットワークリクエスト）
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // キャッシュにある場合はそれを返す
                if (response) {
                    return response;
                }
                
                // キャッシュにない場合はネットワークから取得
                return fetch(event.request)
                    .then(function(response) {
                        // 有効なレスポンスかチェック
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // レスポンスをクローンしてキャッシュに保存
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(function() {
                        // ネットワークエラー時のフォールバック
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// バックグラウンド同期（将来の機能拡張用）
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: バックグラウンド同期');
        // TODO: データの同期処理
    }
});

// プッシュ通知（将来の機能拡張用）
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body || 'れいからのお知らせ♡',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey || 'default'
            },
            actions: [
                {
                    action: 'open',
                    title: '開く',
                    icon: '/icons/icon-72.png'
                },
                {
                    action: 'close',
                    title: '閉じる'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'れいのToDo', options)
        );
    }
});

// 通知クリック時
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
