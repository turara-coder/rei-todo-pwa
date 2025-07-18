// れいのToDo PWA - Service Worker (デプロイ版)
const CACHE_NAME = 'rei-todo-v15';

// サブディレクトリに配置される場合に対応
const BASE_PATH = self.location.pathname.replace('/sw.js', '');

const urlsToCache = [
    BASE_PATH + '/',
    BASE_PATH + '/index.html',
    BASE_PATH + '/style.css', 
    BASE_PATH + '/app.js',
    BASE_PATH + '/manifest.json',
    BASE_PATH + '/icons/icon-192.png',
    BASE_PATH + '/icons/icon-512.png',
    BASE_PATH + '/test.html',
    BASE_PATH + '/js/app-refactored-v2.js',
    BASE_PATH + '/js/modules/todo-manager.js',
    BASE_PATH + '/js/modules/exp-system.js',
    BASE_PATH + '/js/modules/ui-components.js',
    BASE_PATH + '/js/functional-test.js',
    BASE_PATH + '/js/performance-test.js'
];

// インストール時
self.addEventListener('install', function(event) {
    console.log('Service Worker: インストール中...', BASE_PATH);
    
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
                            return caches.match(BASE_PATH + '/index.html');
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
            icon: BASE_PATH + '/icons/icon-192.png',
            badge: BASE_PATH + '/icons/icon-72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey || 'default'
            },
            actions: [
                {
                    action: 'open',
                    title: '開く',
                    icon: BASE_PATH + '/icons/icon-72.png'
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
            clients.openWindow(BASE_PATH + '/')
        );
    }
});
