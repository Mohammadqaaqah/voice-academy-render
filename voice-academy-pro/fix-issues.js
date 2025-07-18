// إصلاح مشاكل الموقع
// أضف هذا الكود في بداية app.js

// 1. إصلاح مشكلة userData
class VoiceAcademyApp {
    constructor() {
        // تهيئة البيانات الافتراضية
        this.userData = {
            statistics: {
                totalRecordings: 0,
                totalDuration: 0,
                averageScore: 0,
                dailyProgress: 0,
                weeklyProgress: 0,
                monthlyProgress: 0,
                completedLessons: 0,
                totalLessons: 10,
                streakDays: 0,
                lastActivity: new Date().toISOString()
            },
            settings: {
                language: 'ar',
                theme: 'dark',
                notifications: true,
                autoSave: true
            },
            progress: {
                currentLevel: 1,
                experience: 0,
                achievements: [],
                completedCourses: []
            }
        };
        
        // تحميل البيانات من localStorage
        this.loadUserData();
        
        // باقي التهيئة...
        this.init();
    }
    
    // تحميل بيانات المستخدم
    loadUserData() {
        try {
            const savedData = localStorage.getItem('voiceAcademyData');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.userData = { ...this.userData, ...parsed };
            }
        } catch (error) {
            console.warn('⚠️ خطأ في تحميل بيانات المستخدم:', error);
        }
    }
    
    // حفظ بيانات المستخدم
    saveUserData() {
        try {
            localStorage.setItem('voiceAcademyData', JSON.stringify(this.userData));
        } catch (error) {
            console.warn('⚠️ خطأ في حفظ بيانات المستخدم:', error);
        }
    }
    
    // إصلاح حساب التقدم اليومي
    calculateDailyProgress() {
        try {
            if (!this.userData || !this.userData.statistics) {
                console.warn('⚠️ بيانات المستخدم غير متوفرة');
                return 0;
            }
            
            const stats = this.userData.statistics;
            const today = new Date().toDateString();
            const lastActivity = new Date(stats.lastActivity).toDateString();
            
            // إذا كان اليوم جديد، اعتبر التقدم 0
            if (today !== lastActivity) {
                stats.dailyProgress = 0;
                stats.lastActivity = new Date().toISOString();
                this.saveUserData();
            }
            
            return stats.dailyProgress || 0;
        } catch (error) {
            console.error('❌ خطأ في حساب التقدم اليومي:', error);
            return 0;
        }
    }
    
    // إصلاح تحديث دائرة التقدم
    updateProgressCircle() {
        try {
            const progressCircle = document.querySelector('.progress-circle');
            const progressText = document.querySelector('.progress-text');
            
            if (!progressCircle || !progressText) {
                console.warn('⚠️ عناصر دائرة التقدم غير موجودة');
                return;
            }
            
            const progress = this.calculateDailyProgress();
            const circumference = 2 * Math.PI * 45; // نصف قطر الدائرة 45
            const strokeDashoffset = circumference - (progress / 100) * circumference;
            
            progressCircle.style.strokeDasharray = circumference;
            progressCircle.style.strokeDashoffset = strokeDashoffset;
            progressText.textContent = `${Math.round(progress)}%`;
            
        } catch (error) {
            console.error('❌ خطأ في تحديث دائرة التقدم:', error);
        }
    }
    
    // إصلاح معالج تغيير الحجم
    handleResize() {
        try {
            this.updateLayout();
            this.updateProgressCircle();
        } catch (error) {
            console.error('❌ خطأ في معالج تغيير الحجم:', error);
        }
    }
    
    // إصلاح تحديث التخطيط
    updateLayout() {
        try {
            // تحديث التخطيط بناءً على حجم الشاشة
            const isMobile = window.innerWidth <= 768;
            document.body.classList.toggle('mobile-layout', isMobile);
            
            // تحديث دائرة التقدم
            this.updateProgressCircle();
            
        } catch (error) {
            console.error('❌ خطأ في تحديث التخطيط:', error);
        }
    }
    
    // تهيئة التطبيق
    init() {
        try {
            // إضافة مستمعي الأحداث
            window.addEventListener('resize', this.handleResize.bind(this));
            
            // تحديث التخطيط الأولي
            this.updateLayout();
            
            // تحديث الإحصائيات
            this.updateStatistics();
            
            console.log('✅ تم تهيئة التطبيق بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة التطبيق:', error);
        }
    }
    
    // تحديث الإحصائيات
    updateStatistics() {
        try {
            const stats = this.userData.statistics;
            
            // تحديث عناصر الإحصائيات في الواجهة
            this.updateElement('.total-recordings', stats.totalRecordings);
            this.updateElement('.total-duration', this.formatDuration(stats.totalDuration));
            this.updateElement('.average-score', `${stats.averageScore}%`);
            this.updateElement('.streak-days', stats.streakDays);
            
        } catch (error) {
            console.error('❌ خطأ في تحديث الإحصائيات:', error);
        }
    }
    
    // تحديث عنصر في الواجهة
    updateElement(selector, value) {
        try {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = value;
            }
        } catch (error) {
            console.warn(`⚠️ عنصر ${selector} غير موجود`);
        }
    }
    
    // تنسيق المدة الزمنية
    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// إضافة معالج الأخطاء العام
window.addEventListener('error', (event) => {
    console.error('❌ خطأ عام:', event.error);
    // يمكنك إضافة تسجيل الأخطاء هنا
});

// إضافة معالج الأخطاء للـ Promise
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ خطأ في Promise:', event.reason);
    event.preventDefault();
});

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.voiceAcademyApp = new VoiceAcademyApp();
    } catch (error) {
        console.error('❌ فشل في تهيئة التطبيق:', error);
    }
});
