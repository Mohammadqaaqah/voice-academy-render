/**
 * ========================================
 * Service Worker - أكاديمية الإعلام الاحترافية
 * للعمل بدون إنترنت وتحسين الأداء
 * ========================================
 */

const CACHE_NAME = 'voice-academy-v2.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/training.js',
    '/ai-analysis.js',
    '/manifest.json',
    // يمكن إضافة المزيد من الملفات حسب الحاجة
];

/**
 * تثبيت Service Worker
 */
self.addEventListener('install', function(event) {
    console.log('🔧 تثبيت Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('📦 فتح الذاكرة المؤقتة');
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                console.log('✅ تم تثبيت Service Worker بنجاح');
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.error('❌ خطأ في تثبيت Service Worker:', error);
            })
    );
});

/**
 * تفعيل Service Worker
 */
self.addEventListener('activate', function(event) {
    console.log('🚀 تفعيل Service Worker...');
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ حذف ذاكرة مؤقتة قديمة:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log('✅ تم تفعيل Service Worker بنجاح');
            return self.clients.claim();
        })
    );
});

/**
 * اعتراض الطلبات
 */
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // إرجاع النسخة المحفوظة إذا وجدت
                if (response) {
                    return response;
                }
                
                // إذا لم توجد، جلب من الشبكة
                return fetch(event.request)
                    .then(function(response) {
                        // التحقق من صحة الاستجابة
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // نسخ الاستجابة
                        const responseToCache = response.clone();
                        
                        // حفظ في الذاكرة المؤقتة
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(function() {
                        // في حالة عدم توفر الشبكة، إرجاع صفحة بديلة
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

/**
 * التعامل مع الرسائل
 */
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

/**
 * إشعارات الدفع
 */
self.addEventListener('push', function(event) {
    console.log('📬 تم استلام إشعار دفع');
    
    const options = {
        body: event.data ? event.data.text() : 'رسالة جديدة من أكاديمية الإعلام',
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'فتح التطبيق',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'إغلاق',
                icon: '/icon-192x192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('أكاديمية الإعلام الاحترافية', options)
    );
});

/**
 * النقر على الإشعارات
 */
self.addEventListener('notificationclick', function(event) {
    console.log('👆 تم النقر على الإشعار');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        event.notification.close();
    } else {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * مزامنة الخلفية
 */
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

/**
 * تنفيذ مزامنة الخلفية
 */
function doBackgroundSync() {
    return new Promise(function(resolve) {
        console.log('🔄 تنفيذ مزامنة الخلفية...');
        // هنا يمكن إضافة منطق المزامنة
        setTimeout(resolve, 1000);
    });
}

console.log('🎓 Service Worker لأكاديمية الإعلام الاحترافية جاهز!');
