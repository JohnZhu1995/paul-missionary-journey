// 使徒保罗的宣教之旅 - Service Worker
const CACHE_NAME = 'paul-journey-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/data.js',
  '/game.js',
  '/manifest.json'
];

// 安装Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 正在安装...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 正在缓存静态资源');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] 安装完成');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] 缓存失败:', error);
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 正在激活...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[Service Worker] 删除旧缓存:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] 激活完成');
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  // 只处理GET请求
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 如果在缓存中找到了，先返回缓存的响应
        if (cachedResponse) {
          // 同时发起网络请求来更新缓存
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                  });
              }
            })
            .catch((error) => {
              console.log('[Service Worker] 网络请求失败，使用缓存:', error);
            });
          
          return cachedResponse;
        }
        
        // 如果缓存中没有，发起网络请求
        return fetch(event.request)
          .then((networkResponse) => {
            // 检查响应是否有效
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // 将响应克隆并存入缓存
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch((error) => {
            console.error('[Service Worker] 网络请求失败:', error);
            
            // 如果是HTML页面请求失败，返回离线页面
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            throw error;
          });
      })
  );
});

// 处理后台同步（用于稍后保存游戏数据）
self.addEventListener('sync', (event) => {
  if (event.tag === 'save-game-data') {
    console.log('[Service Worker] 后台同步: 保存游戏数据');
    // 这里可以添加将数据发送到服务器的逻辑
  }
});

// 处理推送通知（可选）
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || '继续你的宣教之旅！',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || '保罗的宣教之旅', options)
    );
  }
});

// 处理通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
