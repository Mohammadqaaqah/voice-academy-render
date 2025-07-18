/**
 * ========================================
 * خادم أكاديمية الإعلام الاحترافية
 * Express.js Server for Voice Academy Pro
 * ========================================
 */

// استيراد المكتبات المطلوبة
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// إنشاء تطبيق Express
const app = express();

// إعدادات البيئة
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'production';

// معلومات التطبيق
const APP_INFO = {
    name: 'أكاديمية الإعلام الاحترافية',
    version: '2.0.0',
    description: 'منصة تدريب متقدمة مدعومة بالذكاء الاصطناعي',
    author: 'Mohammad Qaaqah',
    startTime: new Date()
};

console.log(`
╔══════════════════════════════════════╗
║     🎙️ أكاديمية الإعلام الاحترافية      ║
║                                      ║
║  منصة تدريب متقدمة بالذكاء الاصطناعي   ║
║           الإصدار 2.0.0              ║
╚══════════════════════════════════════╝
`);

// ========================================
// إعدادات الأمان والحماية
// ========================================

// Helmet للحماية الأساسية مع إصلاح CSP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            mediaSrc: ["'self'", "blob:", "data:"],
            connectSrc: ["'self'", "https:", "blob:"],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["'self'", "blob:"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false // مطلوب للصوت
}));

// CORS للسماح بالطلبات من مصادر مختلفة
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://voice-academy-render.onrender.com',
        'https://voice-academy-pro.onrender.com',
        'https://mohammadqaaqah.github.io'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ضغط الاستجابات
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6, // مستوى ضغط متوازن
    threshold: 1024 // ضغط الملفات أكبر من 1KB
}));

// تسجيل الطلبات
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ========================================
// إعدادات معالجة البيانات
// ========================================

// معالجة JSON
app.use(express.json({ 
    limit: '10mb',
    strict: true
}));

// معالجة URL encoded
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

// إعداد Service Worker مع MIME type صحيح
app.use('/sw.js', express.static('sw.js', {
    setHeaders: (res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Service-Worker-Allowed', '/');
    }
}));

// إعداد manifest.json مع MIME type صحيح
app.use('/manifest.json', express.static('manifest.json', {
    setHeaders: (res) => {
        res.setHeader('Content-Type', 'application/manifest+json');
    }
}));

// إعداد الملفات الثابتة
app.use(express.static('.', {
    maxAge: NODE_ENV === 'production' ? '1d' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        // إعدادات خاصة لأنواع الملفات المختلفة
        if (path.endsWith('.html')) {
            res.set('Cache-Control', 'public, max-age=300'); // 5 دقائق للHTML
        } else if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
            res.set('Cache-Control', 'public, max-age=86400'); // يوم واحد للJS
        } else if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
            res.set('Cache-Control', 'public, max-age=86400'); // يوم واحد للCSS
        } else if (path.match(/\.(jpg|jpeg|png|gif|ico|svg)$/)) {
            res.set('Cache-Control', 'public, max-age=604800'); // أسبوع للصور
        } else if (path.endsWith('.woff2') || path.endsWith('.woff')) {
            res.set('Content-Type', 'font/woff2');
            res.set('Cache-Control', 'public, max-age=31536000'); // سنة للخطوط
        }
    }
}));

// ========================================
// المسارات الرئيسية
// ========================================

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// معلومات التطبيق
app.get('/api/info', (req, res) => {
    const uptime = Date.now() - APP_INFO.startTime.getTime();
    
    res.json({
        ...APP_INFO,
        uptime: Math.floor(uptime / 1000), // بالثواني
        uptimeFormatted: formatUptime(uptime),
        environment: NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// فحص صحة التطبيق
app.get('/api/health', (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: APP_INFO.version,
        environment: NODE_ENV
    };
    
    res.status(200).json(healthCheck);
});

// إحصائيات الأداء
app.get('/api/stats', (req, res) => {
    const stats = {
        server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            platform: process.platform,
            nodeVersion: process.version
        },
        application: {
            name: APP_INFO.name,
            version: APP_INFO.version,
            startTime: APP_INFO.startTime,
            environment: NODE_ENV
        },
        system: {
            loadAverage: require('os').loadavg(),
            totalMemory: require('os').totalmem(),
            freeMemory: require('os').freemem(),
            cpuCount: require('os').cpus().length
        }
    };
    
    res.json(stats);
});

// ========================================
// مسارات واجهة برمجة التطبيقات للتطبيق
// ========================================

// حفظ بيانات المستخدم (في النسخة الكاملة سيكون مع قاعدة بيانات)
app.post('/api/user/save', (req, res) => {
    try {
        const userData = req.body;
        
        // التحقق من صحة البيانات
        if (!userData || !userData.name) {
            return res.status(400).json({
                error: 'بيانات المستخدم غير صحيحة',
                code: 'INVALID_USER_DATA'
            });
        }
        
        // في النسخة الكاملة: حفظ في قاعدة البيانات
        console.log(`💾 حفظ بيانات المستخدم: ${userData.name}`);
        
        res.json({
            success: true,
            message: 'تم حفظ البيانات بنجاح',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ خطأ في حفظ بيانات المستخدم:', error);
        res.status(500).json({
            error: 'خطأ في الخادم',
            code: 'SERVER_ERROR'
        });
    }
});

// تحليل الصوت (في النسخة الكاملة سيكون مع AI حقيقي)
app.post('/api/audio/analyze', (req, res) => {
    try {
        console.log('🔍 طلب تحليل صوتي جديد');
        
        // محاكاة تحليل الصوت
        const analysisResult = {
            id: `analysis_${Date.now()}`,
            timestamp: new Date().toISOString(),
            
            scores: {
                pronunciation: Math.floor(Math.random() * 30) + 70,
                fluency: Math.floor(Math.random() * 25) + 75,
                confidence: Math.floor(Math.random() * 35) + 65,
                expressiveness: Math.floor(Math.random() * 20) + 80
            },
            
            recommendations: [
                'تدرب على إبطاء سرعة الكلام قليلاً',
                'ركز على مخارج الحروف الصعبة',
                'استخدم تمارين التنفس قبل التسجيل'
            ],
            
            processingTime: Math.random() * 2000 + 1000 // 1-3 ثانية
        };
        
        // حساب النتيجة الإجمالية
        const scores = analysisResult.scores;
        analysisResult.overallScore = Math.round(
            (scores.pronunciation + scores.fluency + scores.confidence + scores.expressiveness) / 4
        );
        
        res.json({
            success: true,
            data: analysisResult
        });
        
    } catch (error) {
        console.error('❌ خطأ في تحليل الصوت:', error);
        res.status(500).json({
            error: 'خطأ في تحليل الصوت',
            code: 'ANALYSIS_ERROR'
        });
    }
});

// الحصول على التوصيات المخصصة
app.get('/api/recommendations/:userId?', (req, res) => {
    try {
        const userId = req.params.userId || 'anonymous';
        console.log(`💡 طلب توصيات للمستخدم: ${userId}`);
        
        const recommendations = [
            {
                type: 'breathing',
                title: 'تمرين التنفس العميق',
                description: 'تحسين التحكم في التنفس والصوت',
                difficulty: 'easy',
                estimatedTime: 10,
                priority: 'high'
            },
            {
                type: 'pronunciation',
                title: 'تمرين النطق المتقدم',
                description: 'تحسين وضوح النطق والمخارج',
                difficulty: 'medium',
                estimatedTime: 15,
                priority: 'medium'
            },
            {
                type: 'expression',
                title: 'تمرين التعبير العاطفي',
                description: 'تطوير القدرة على التعبير بالصوت',
                difficulty: 'medium',
                estimatedTime: 20,
                priority: 'low'
            }
        ];
        
        res.json({
            success: true,
            data: recommendations,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ خطأ في توليد التوصيات:', error);
        res.status(500).json({
            error: 'خطأ في توليد التوصيات',
            code: 'RECOMMENDATIONS_ERROR'
        });
    }
});

// ========================================
// معالجة الأخطاء والمسارات غير الموجودة
// ========================================

// مسار خاص لملفات الخط
app.get('/fonts/*', (req, res) => {
    res.status(404).json({
        error: 'الخط غير موجود',
        code: 'FONT_NOT_FOUND'
    });
});

// مسار خاص للصور
app.get('/images/*', (req, res) => {
    res.status(404).json({
        error: 'الصورة غير موجودة',
        code: 'IMAGE_NOT_FOUND'
    });
});

// معالجة المسارات غير الموجودة (404)
app.use('*', (req, res) => {
    // إذا كان المسار يطلب API
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({
            error: 'المسار غير موجود',
            code: 'API_NOT_FOUND',
            path: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }
    
    // إعادة توجيه جميع المسارات الأخرى للصفحة الرئيسية (SPA)
    res.sendFile(path.join(__dirname, 'index.html'));
});

// معالجة الأخطاء العامة
app.use((error, req, res, next) => {
    console.error('❌ خطأ في الخادم:', error);
    
    // تسجيل تفاصيل الخطأ
    const errorDetails = {
        message: error.message,
        stack: NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    };
    
    // إرسال استجابة الخطأ
    res.status(error.status || 500).json({
        error: NODE_ENV === 'development' ? error.message : 'حدث خطأ في الخادم',
        code: 'SERVER_ERROR',
        timestamp: errorDetails.timestamp,
        ...(NODE_ENV === 'development' && { details: errorDetails })
    });
});

// ========================================
// وظائف مساعدة
// ========================================

/**
 * تنسيق وقت التشغيل
 */
function formatUptime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days} يوم، ${hours % 24} ساعة، ${minutes % 60} دقيقة`;
    } else if (hours > 0) {
        return `${hours} ساعة، ${minutes % 60} دقيقة`;
    } else if (minutes > 0) {
        return `${minutes} دقيقة، ${seconds % 60} ثانية`;
    } else {
        return `${seconds} ثانية`;
    }
}

/**
 * إغلاق نظيف للخادم
 */
function gracefulShutdown(signal) {
    console.log(`\n🔄 تم استلام إشارة ${signal}. إغلاق الخادم بأمان...`);
    
    server.close((err) => {
        if (err) {
            console.error('❌ خطأ في إغلاق الخادم:', err);
            process.exit(1);
        }
        
        console.log('✅ تم إغلاق الخادم بنجاح');
        process.exit(0);
    });
    
    // إجبار الإغلاق بعد 10 ثوانٍ
    setTimeout(() => {
        console.error('⚠️ فرض إغلاق الخادم بعد انتهاء المهلة الزمنية');
        process.exit(1);
    }, 10000);
}

// ========================================
// بدء تشغيل الخادم
// ========================================

const server = app.listen(PORT, HOST, () => {
    console.log(`
🚀 الخادم يعمل بنجاح!
📍 العنوان: http://${HOST}:${PORT}
🌍 البيئة: ${NODE_ENV}
⏰ وقت البدء: ${APP_INFO.startTime.toLocaleString('ar-SA')}
📦 إصدار Node.js: ${process.version}
🎯 جاهز لاستقبال الطلبات!

📋 المسارات المتاحة:
   GET  /                     - الصفحة الرئيسية
   GET  /api/info            - معلومات التطبيق
   GET  /api/health          - فحص الصحة
   GET  /api/stats           - إحصائيات الأداء
   POST /api/user/save       - حفظ بيانات المستخدم
   POST /api/audio/analyze   - تحليل الصوت
   GET  /api/recommendations - التوصيات المخصصة
`);
});

// معالجة إشارات النظام للإغلاق النظيف
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// معالجة الأخطاء غير المعالجة
process.on('uncaughtException', (error) => {
    console.error('❌ خطأ غير معالج:', error);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise مرفوض غير معالج:', reason);
    gracefulShutdown('unhandledRejection');
});

// تصدير التطبيق للاختبار
module.exports = app;
