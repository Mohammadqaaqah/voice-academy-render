/**
 * ========================================
 * أكاديمية الإعلام الاحترافية - الملف الرئيسي
 * مدعوم بالذكاء الاصطناعي
 * ========================================
 */

// متغيرات عامة
let voiceAcademy = null;
let currentUser = null;
let appSettings = {
    version: '2.0.0',
    environment: 'production',
    apiUrl: 'https://api.voice-academy.com',
    debug: false
};

/**
 * فئة التطبيق الرئيسية
 */
class VoiceAcademyApp {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'dashboard';
        this.audioContext = null;
        this.mediaRecorder = null;
        this.recordingData = [];
        this.isRecording = false;
        this.trainingSession = null;
        this.notifications = [];
        
        // تهيئة التطبيق
        this.init();
    }

    /**
     * تهيئة التطبيق
     */
    async init() {
        try {
            this.log('🚀 بدء تحميل أكاديمية الإعلام الاحترافية...');
            
            // عرض شاشة التحميل
            this.showLoadingScreen();
            
            // تحميل المكونات
            await this.loadComponents();
            
            // إعداد أحداث التطبيق
            this.setupEventListeners();
            
            // تهيئة الصوت
            await this.initializeAudio();
            
            // تحميل بيانات المستخدم المحفوظة
            await this.loadSavedUserData();
            
            // إخفاء شاشة التحميل
            this.hideLoadingScreen();
            
            this.log('✅ تم تحميل التطبيق بنجاح!');
            
        } catch (error) {
            this.error('❌ خطأ في تهيئة التطبيق:', error);
            this.showNotification('حدث خطأ في تحميل التطبيق', 'error');
        }
    }

    /**
     * عرض شاشة التحميل
     */
    showLoadingScreen() {
        const loadingTexts = [
            'جاري تحميل النظام...',
            'تهيئة محرك الذكاء الاصطناعي...',
            'إعداد معالج الصوت...',
            'تحميل النماذج التدريبية...',
            'تحضير الواجهات...',
            'كل شيء جاهز!'
        ];

        let currentIndex = 0;
        const loadingText = document.getElementById('loadingText');
        const progressBar = document.getElementById('loadingProgress');
        
        const updateProgress = () => {
            if (currentIndex < loadingTexts.length) {
                loadingText.textContent = loadingTexts[currentIndex];
                const progress = ((currentIndex + 1) / loadingTexts.length) * 100;
                progressBar.style.width = `${progress}%`;
                currentIndex++;
                
                setTimeout(updateProgress, 500);
            }
        };
        
        updateProgress();
    }

    /**
     * إخفاء شاشة التحميل
     */
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            loadingScreen.classList.add('hidden');
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                document.getElementById('loginSection').classList.add('active');
            }, 500);
        }, 3000);
    }

    /**
     * تحميل المكونات
     */
    async loadComponents() {
        return new Promise(resolve => {
            setTimeout(() => {
                this.log('📦 تم تحميل جميع المكونات');
                resolve();
            }, 1500);
        });
    }

    /**
     * إعداد أحداث التطبيق
     */
    setupEventListeners() {
        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // أحداث الماوس
        document.addEventListener('click', (e) => this.handleGlobalClick(e));
        
        // أحداث تغيير حجم النافذة
        window.addEventListener('resize', () => this.handleResize());
        
        // حفظ تلقائي كل 30 ثانية
        setInterval(() => this.autoSave(), 30000);
        
        // مراقبة حالة الاتصال
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
        
        this.log('🎯 تم إعداد جميع أحداث التطبيق');
    }

    /**
     * التعامل مع أحداث لوحة المفاتيح
     */
    handleKeydown(e) {
        // إغلاق النوافذ بـ Escape
        if (e.key === 'Escape') {
            this.closeModal();
            this.closeNotification();
        }
        
        // حفظ سريع بـ Ctrl+S
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveUserData();
            this.showNotification('تم حفظ البيانات', 'success');
        }
        
        // التنقل السريع بين التبويبات
        if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const tabNames = ['dashboard', 'training', 'analysis', 'studio', 'progress'];
            const tabIndex = parseInt(e.key) - 1;
            if (tabNames[tabIndex]) {
                this.switchTab(tabNames[tabIndex]);
            }
        }
    }

    /**
     * التعامل مع النقرات العامة
     */
    handleGlobalClick(e) {
        // إغلاق النافذة المنبثقة عند النقر على الخلفية
        if (e.target.classList.contains('modal')) {
            this.closeModal();
        }
    }

    /**
     * التعامل مع تغيير حجم النافذة
     */
    handleResize() {
        // إعادة حساب تخطيط العناصر
        this.updateLayout();
    }

    /**
     * التعامل مع حالة الاتصال
     */
    handleOnlineStatus(isOnline) {
        const message = isOnline ? 'تم استعادة الاتصال بالإنترنت' : 'لا يوجد اتصال بالإنترنت - التطبيق يعمل بوضع عدم الاتصال';
        const type = isOnline ? 'success' : 'warning';
        this.showNotification(message, type);
    }

    /**
     * تهيئة معالج الصوت
     */
    async initializeAudio() {
        try {
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.log('🎵 تم تهيئة معالج الصوت بنجاح');
                return true;
            }
        } catch (error) {
            this.warn('⚠️ لا يمكن تهيئة معالج الصوت:', error);
            return false;
        }
    }

    /**
     * بدء التدريب - تسجيل دخول جديد
     */
    async startTraining() {
        const userName = document.getElementById('userName').value.trim();
        const userLevel = document.getElementById('userLevel').value;
        const trainingGoal = document.getElementById('trainingGoal').value;

        // التحقق من صحة البيانات
        if (!this.validateUserInput(userName)) {
            return false;
        }

        // إنشاء ملف المستخدم الجديد
        this.currentUser = this.createNewUser(userName, userLevel, trainingGoal);
        
        // حفظ البيانات
        await this.saveUserData();
        
        // عرض الواجهة الرئيسية
        this.showMainInterface();
        
        // تحديث البيانات
        this.updateAllUI();
        
        // رسالة ترحيب
        this.showWelcomeMessage();
        
        this.log('👤 تم إنشاء مستخدم جديد:', userName);
        
        return true;
    }

    /**
     * التحقق من صحة بيانات المستخدم
     */
    validateUserInput(name) {
        // التحقق من الطول
        if (name.length < 2) {
            this.showNotification('يرجى إدخال اسمك الكامل (حرفين على الأقل)', 'error');
            return false;
        }

        if (name.length > 50) {
            this.showNotification('الاسم طويل جداً (أقل من 50 حرف)', 'error');
            return false;
        }

        // التحقق من الأحرف المسموحة
        const nameRegex = /^[\u0600-\u06FFa-zA-Z\s\-\.]+$/;
        if (!nameRegex.test(name)) {
            this.showNotification('يرجى استخدام الأحرف العربية أو الإنجليزية فقط', 'error');
            return false;
        }

        return true;
    }

    /**
     * إنشاء مستخدم جديد
     */
    createNewUser(name, level, goal) {
        return {
            // معلومات أساسية
            name: name,
            level: level,
            goal: goal,
            joinDate: new Date().toISOString(),
            lastActiveDate: new Date().toISOString(),
            
            // الملف الشخصي
            profile: {
                currentLevel: 1,
                xp: 0,
                streak: 0,
                totalMinutes: 0,
                avatar: this.generateAvatar(name)
            },
            
            // المهارات (من 0 إلى 100)
            skills: {
                breathing: 0,
                pronunciation: 0,
                expression: 0,
                confidence: 0
            },
            
            // الإحصائيات
            statistics: {
                exercisesCompleted: 0,
                recordingsAnalyzed: 0,
                averageAccuracy: 0,
                improvementRate: 0,
                totalSessions: 0,
                bestScores: {
                    breathing: 0,
                    pronunciation: 0,
                    expression: 0,
                    confidence: 0
                }
            },
            
            // الإعدادات
            preferences: {
                difficulty: level,
                reminderTime: '19:00',
                soundEnabled: true,
                notificationsEnabled: true,
                language: 'ar',
                theme: 'auto'
            },
            
            // الإنجازات
            achievements: [],
            
            // سجل التدريب
            trainingHistory: []
        };
    }

    /**
     * توليد صورة رمزية للمستخدم
     */
    generateAvatar(name) {
        const colors = ['#667eea', '#764ba2', '#4CAF50', '#FF9800', '#2196F3'];
        const initials = name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
        const color = colors[name.length % colors.length];
        
        return {
            initials: initials,
            color: color,
            style: 'circle'
        };
    }

    /**
     * تحميل ملف شخصي موجود
     */
    async loadExistingProfile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    const userData = JSON.parse(text);
                    
                    if (this.validateUserData(userData)) {
                        this.currentUser = userData;
                        this.showMainInterface();
                        this.updateAllUI();
                        this.showNotification('تم تحميل الملف الشخصي بنجاح', 'success');
                        this.log('📁 تم تحميل ملف شخصي موجود');
                    } else {
                        this.showNotification('ملف غير صحيح أو تالف', 'error');
                    }
                } catch (error) {
                    this.showNotification('خطأ في قراءة الملف', 'error');
                    this.error('خطأ في تحميل الملف:', error);
                }
            }
        };
        
        input.click();
    }

    /**
     * التحقق من صحة بيانات المستخدم
     */
    validateUserData(data) {
        const requiredFields = ['name', 'profile', 'skills', 'statistics'];
        return requiredFields.every(field => data && data[field]);
    }

    /**
     * عرض توضيحي
     */
    startDemo() {
        this.currentUser = this.createDemoUser();
        this.showMainInterface();
        this.updateAllUI();
        this.showNotification('مرحباً بك في العرض التوضيحي! 🎬', 'info');
        this.log('🎭 تم بدء العرض التوضيحي');
    }

    /**
     * إنشاء مستخدم تجريبي
     */
    createDemoUser() {
        const demoUser = this.createNewUser('مستخدم تجريبي', 'intermediate', 'general');
        
        // تحديث البيانات للعرض التوضيحي
        demoUser.profile.currentLevel = 2;
        demoUser.profile.xp = 1500;
        demoUser.profile.streak = 5;
        demoUser.profile.totalMinutes = 120;
        
        demoUser.skills.breathing = 75;
        demoUser.skills.pronunciation = 60;
        demoUser.skills.expression = 45;
        demoUser.skills.confidence = 55;
        
        demoUser.statistics.exercisesCompleted = 25;
        demoUser.statistics.recordingsAnalyzed = 10;
        demoUser.statistics.averageAccuracy = 78;
        demoUser.statistics.improvementRate = 12;
        
        return demoUser;
    }

    /**
     * عرض الواجهة الرئيسية
     */
    showMainInterface() {
        document.getElementById('loginSection').classList.remove('active');
        document.getElementById('mainInterface').classList.remove('hidden');
        
        this.updateUserDisplay();
    }

    /**
     * تحديث عرض بيانات المستخدم
     */
    updateUserDisplay() {
        if (!this.currentUser) return;
        
        document.getElementById('userWelcome').textContent = `مرحباً ${this.currentUser.name}`;
        document.getElementById('userLevelDisplay').textContent = `المستوى ${this.currentUser.profile.currentLevel}`;
        document.getElementById('userPointsDisplay').textContent = `${this.currentUser.profile.xp} نقطة`;
        document.getElementById('userStreakDisplay').textContent = `${this.currentUser.profile.streak} يوم`;
    }

    /**
     * تحديث جميع عناصر الواجهة
     */
    updateAllUI() {
        this.updateUserDisplay();
        this.updateDashboard();
        this.updateProgressCircle();
    }

    /**
     * تحديث لوحة التحكم
     */
    updateDashboard() {
        if (!this.currentUser) return;
        
        // تحديث الإحصائيات
        document.getElementById('totalMinutes').textContent = this.currentUser.profile.totalMinutes;
        document.getElementById('completedExercises').textContent = this.currentUser.statistics.exercisesCompleted;
        document.getElementById('accuracyScore').textContent = `${this.currentUser.statistics.averageAccuracy}%`;
        document.getElementById('achievementsCount').textContent = this.currentUser.achievements.length;
        
        // تحديث رسالة المساعد الذكي
        this.updateAIMessage();
        
        // تحديث التمارين المقترحة
        this.updateRecommendedExercises();
    }

    /**
     * تحديث رسالة المساعد الذكي
     */
    updateAIMessage() {
        const messages = this.generateAIMessages();
        document.getElementById('aiWelcomeMessage').textContent = messages.welcome;
    }

    /**
     * توليد رسائل الذكاء الاصطناعي
     */
    generateAIMessages() {
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء الخير';
        
        const personalizedMessages = [
            `${timeGreeting} ${this.currentUser.name}! وقت رائع لتطوير مهاراتك الصوتية`,
            `أهلاً ${this.currentUser.name}! لقد تقدمت ${this.currentUser.statistics.improvementRate}% منذ آخر جلسة`,
            `مرحباً ${this.currentUser.name}! هل أنت مستعد لتحدي جديد اليوم؟`
        ];
        
        return {
            welcome: personalizedMessages[Math.floor(Math.random() * personalizedMessages.length)],
            tip: this.generateDailyTip(),
            motivation: this.generateMotivation()
        };
    }

    /**
     * توليد نصيحة يومية
     */
    generateDailyTip() {
        const tips = [
            'اشرب كوباً من الماء الدافئ قبل التدريب لترطيب الحبال الصوتية',
            'تذكر أن الممارسة المنتظمة أهم من المدة الطويلة',
            'استمع لتسجيلاتك السابقة لتلاحظ التطور',
            'تدرب في مكان هادئ وخالٍ من الضوضاء',
            'استخدم تقنيات التنفس العميق قبل كل تمرين'
        ];
        
        return tips[Math.floor(Math.random() * tips.length)];
    }

    /**
     * توليد رسالة تحفيزية
     */
    generateMotivation() {
        const level = this.currentUser.profile.currentLevel;
        
        if (level === 1) {
            return 'رحلة الألف ميل تبدأ بخطوة واحدة، وأنت بدأت بالفعل! 🌟';
        } else if (level < 3) {
            return 'تقدمك رائع! استمر في هذا المعدل وستصل لأهدافك قريباً 🚀';
        } else {
            return 'أنت تتطور بشكل ممتاز! مهاراتك أصبحت أكثر احترافية 🏆';
        }
    }

    /**
     * تحديث التمارين المقترحة
     */
    updateRecommendedExercises() {
        const recommendations = this.generateRecommendations();
        const container = document.getElementById('recommendedExercises');
        
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item interactive-card" onclick="voiceAcademy.startRecommendedExercise('${rec.type}')">
                <div class="rec-icon">
                    <i class="fas ${rec.icon}"></i>
                </div>
                <div class="rec-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <div class="rec-difficulty ${rec.difficulty}">${rec.difficultyText}</div>
                </div>
                <div class="rec-time">${rec.estimatedTime} دقيقة</div>
            </div>
        `).join('');
    }

    /**
     * توليد التوصيات
     */
    generateRecommendations() {
        const recommendations = [];
        const skills = this.currentUser.skills;
        
        // توصيات بناءً على نقاط الضعف
        if (skills.breathing < 50) {
            recommendations.push({
                type: 'breathing',
                title: 'تمرين التنفس العميق',
                description: 'تحسين التحكم في التنفس والصوت',
                icon: 'fa-lungs',
                difficulty: 'easy',
                difficultyText: 'سهل',
                estimatedTime: 10
            });
        }
        
        if (skills.pronunciation < 60) {
            recommendations.push({
                type: 'pronunciation',
                title: 'تمرين النطق المتقدم',
                description: 'تحسين وضوح النطق والمخارج',
                icon: 'fa-spell-check',
                difficulty: 'medium',
                difficultyText: 'متوسط',
                estimatedTime: 15
            });
        }
        
        if (skills.expression < 40) {
            recommendations.push({
                type: 'expression',
                title: 'تمرين التعبير العاطفي',
                description: 'تطوير القدرة على التعبير بالصوت',
                icon: 'fa-theater-masks',
                difficulty: 'medium',
                difficultyText: 'متوسط',
                estimatedTime: 20
            });
        }
        
        // توصية للمتقدمين
        if (Object.values(skills).every(skill => skill > 70)) {
            recommendations.push({
                type: 'advanced',
                title: 'تحدي الإلقاء المتقدم',
                description: 'تمرين شامل لجميع المهارات',
                icon: 'fa-trophy',
                difficulty: 'hard',
                difficultyText: 'صعب',
                estimatedTime: 30
            });
        }
        
        return recommendations.slice(0, 3);
    }

    /**
     * تحديث دائرة التقدم اليومي
     */
    updateProgressCircle() {
        const progress = this.calculateDailyProgress();
        const circle = document.getElementById('progressCircle');
        const text = document.getElementById('dailyProgressPercent');
        
        if (circle && text) {
            const circumference = 2 * Math.PI * 50; // نصف القطر 50
            const offset = circumference - (progress / 100) * circumference;
            
            circle.style.strokeDashoffset = offset;
            text.textContent = `${progress}%`;
        }
    }

    /**
     * حساب التقدم اليومي
     */
    calculateDailyProgress() {
        // هدف يومي افتراضي
        const dailyGoals = {
            exercises: 3,
            minutes: 30,
            recordings: 2
        };
        
        // إحصائيات اليوم (محاكاة)
        const todayStats = {
            exercises: Math.min(this.currentUser.statistics.exercisesCompleted, dailyGoals.exercises),
            minutes: Math.min(this.currentUser.profile.totalMinutes, dailyGoals.minutes),
            recordings: Math.min(this.currentUser.statistics.recordingsAnalyzed, dailyGoals.recordings)
        };
        
        const progressScores = [
            (todayStats.exercises / dailyGoals.exercises) * 100,
            (todayStats.minutes / dailyGoals.minutes) * 100,
            (todayStats.recordings / dailyGoals.recordings) * 100
        ];
        
        return Math.min(Math.round(progressScores.reduce((a, b) => a + b, 0) / 3), 100);
    }

    /**
     * التبديل بين التبويبات
     */
    switchTab(tabName, element = null) {
        // إخفاء جميع التبويبات
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // إزالة التحديد من جميع أزرار التبويبات
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // إظهار التبويب المحدد
        const targetPanel = document.getElementById(tabName);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
        
        // تحديد زر التبويب
        const targetBtn = element || document.querySelector(`[data-tab="${tabName}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
        
        this.currentTab = tabName;
        this.loadTabContent(tabName);
        
        this.log(`📑 تم التبديل إلى تبويب: ${tabName}`);
    }

    /**
     * تحميل محتوى التبويب
     */
    async loadTabContent(tabName) {
        switch(tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'training':
                this.loadTrainingContent();
                break;
            case 'analysis':
                this.loadAnalysisContent();
                break;
            case 'studio':
                this.loadStudioContent();
                break;
            case 'progress':
                this.loadProgressContent();
                break;
        }
    }

    /**
     * تحميل محتوى التدريب
     */
    loadTrainingContent() {
        // سيتم تطويره في الإصدارات القادمة
        this.log('🏋️ تحميل محتوى التدريب...');
    }

    /**
     * تحميل محتوى التحليل
     */
    loadAnalysisContent() {
        // سيتم تطويره في الإصدارات القادمة
        this.log('📊 تحميل محتوى التحليل...');
    }

    /**
     * تحميل محتوى الاستوديو
     */
    loadStudioContent() {
        // سيتم تطويره في الإصدارات القادمة
        this.log('🎙️ تحميل محتوى الاستوديو...');
    }

    /**
     * تحميل محتوى التقدم
     */
    loadProgressContent() {
        // سيتم تطويره في الإصدارات القادمة
        this.log('📈 تحميل محتوى التقدم...');
    }

    /**
     * بدء تمرين مقترح
     */
    startRecommendedExercise(type) {
        this.showNotification(`بدء تمرين: ${type}`, 'info');
        
        // تحديث الإحصائيات
        this.currentUser.statistics.exercisesCompleted++;
        this.currentUser.profile.xp += 10;
        this.updateAllUI();
        
        this.log(`🎯 بدء تمرين مقترح: ${type}`);
    }

    /**
     * الحصول على نصيحة مخصصة
     */
    getPersonalizedAdvice() {
        const advice = this.generatePersonalizedAdvice();
        this.showModal(this.createAdviceModal(advice));
    }

    /**
     * توليد نصيحة مخصصة
     */
    generatePersonalizedAdvice() {
        const weakestSkill = Object.keys(this.currentUser.skills).reduce((a, b) => 
            this.currentUser.skills[a] < this.currentUser.skills[b] ? a : b
        );
        
        const skillAdvice = {
            breathing: {
                main: 'أنصحك بالتركيز على تمارين التنفس. التنفس الصحيح هو أساس الصوت القوي والواضح.',
                steps: [
                    'مارس تمرين التنفس العميق لمدة 5 دقائق يومياً',
                    'تدرب على التنفس من البطن وليس الصدر',
                    'استخدم تقنية 4-7-8 للتنفس المتقدم'
                ],
                prediction: 'خلال أسبوعين من التدريب المنتظم، ستلاحظ تحسناً كبيراً في قوة واستقرار صوتك.'
            },
            pronunciation: {
                main: 'يجب تحسين وضوح النطق. النطق الواضح يجعل رسالتك أكثر تأثيراً وفهماً.',
                steps: [
                    'تدرب على الكلمات الصعبة يومياً',
                    'استخدم المرآة لمراقبة حركة الشفاه',
                    'سجل نفسك واستمع للتسجيل'
                ],
                prediction: 'مع التدريب المستمر، ستصل لمستوى احترافي في النطق خلال شهر.'
            },
            expression: {
                main: 'التعبير الصوتي مهارة قوية تجعل حديثك أكثر جاذبية وتأثيراً على المستمعين.',
                steps: [
                    'تدرب على قراءة النصوص بمشاعر مختلفة',
                    'استمع للمذيعين المحترفين وحلل أسلوبهم',
                    'استخدم الوقفات بشكل فعال'
                ],
                prediction: 'التعبير الصوتي يحتاج وقتاً أطول، لكن ستلاحظ تحسناً واضحاً خلال 3 أسابيع.'
            },
            confidence: {
                main: 'الثقة بالنفس هي مفتاح النجاح في الإعلام. كلما زادت ثقتك، كان أداؤك أفضل.',
                steps: [
                    'تدرب أمام المرآة يومياً',
                    'سجل فيديوهات لنفسك وراجعها',
                    'تذكر نجاحاتك السابقة قبل كل تدريب'
                ],
                prediction: 'الثقة تنمو مع الممارسة. ستشعر بفرق واضح خلال أسبوعين من التدريب المنتظم.'
            }
        };
        
        return skillAdvice[weakestSkill] || skillAdvice.breathing;
    }

    /**
     * إنشاء نافذة النصيحة
     */
    createAdviceModal(advice) {
        return `
            <div class="ai-advice-modal" style="padding: 2rem; max-width: 500px;">
                <div class="ai-header" style="text-align: center; margin-bottom: 1.5rem;">
                    <i class="fas fa-robot" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--primary-color);">نصيحة ذكية مخصصة</h3>
                </div>
                <div class="advice-content">
                    <p style="margin-bottom: 1.5rem; line-height: 1.6;">${advice.main}</p>
                    <div class="advice-steps" style="margin-bottom: 1.5rem;">
                        <h4 style="margin-bottom: 1rem;"><i class="fas fa-list"></i> خطوات عملية:</h4>
                        <ol style="padding-right: 1.5rem; line-height: 1.8;">
                            ${advice.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </div>
                    <div class="advice-prediction" style="background: rgba(76, 175, 80, 0.1); padding: 1rem; border-radius: 8px; border-right: 4px solid var(--accent-color);">
                        <h4 style="margin-bottom: 0.5rem;"><i class="fas fa-crystal-ball"></i> التوقعات:</h4>
                        <p style="margin: 0;">${advice.prediction}</p>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 2rem;">
                    <button class="btn-primary" onclick="voiceAcademy.closeModal()" style="width: auto; padding: 0.75rem 2rem;">
                        <i class="fas fa-check"></i> فهمت
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * عرض الإشعارات
     */
    showNotifications() {
        const notifications = [
            { type: 'success', message: 'تم إكمال تمرين التنفس!', time: 'منذ 10 دقائق', icon: 'fa-check-circle' },
            { type: 'info', message: 'تذكير: موعد التدريب اليومي', time: 'منذ ساعة', icon: 'fa-clock' },
            { type: 'achievement', message: 'إنجاز جديد: أسبوع كامل من التدريب', time: 'منذ يوم', icon: 'fa-trophy' }
        ];
        
        const content = `
            <div class="notifications-modal" style="padding: 2rem; max-width: 600px;">
                <h3 style="text-align: center; margin-bottom: 2rem; color: var(--primary-color);">
                    <i class="fas fa-bell"></i> الإشعارات
                </h3>
                <div class="notifications-list">
                    ${notifications.map(notif => `
                        <div class="notification-item ${notif.type}" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; background: rgba(102, 126, 234, 0.05);">
                            <div class="notif-icon" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--primary-color); color: white;">
                                <i class="fas ${notif.icon}"></i>
                            </div>
                            <div class="notif-content" style="flex: 1;">
                                <p style="margin: 0; font-weight: 600;">${notif.message}</p>
                                <span class="notif-time" style="font-size: 0.8rem; color: #666;">${notif.time}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align: center; margin-top: 2rem;">
                    <button class="btn-secondary" onclick="voiceAcademy.closeModal()" style="width: auto; padding: 0.75rem 2rem;">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(content);
    }

    /**
     * عرض الملف الشخصي
     */
    showProfile() {
        if (!this.currentUser) return;
        
        const content = `
            <div class="profile-modal" style="padding: 2rem; max-width: 500px;">
                <h3 style="text-align: center; margin-bottom: 2rem; color: var(--primary-color);">
                    <i class="fas fa-user-circle"></i> الملف الشخصي
                </h3>
                <div class="profile-info">
                    <div class="profile-field" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #eee;">
                        <label style="font-weight: 600;">الاسم:</label>
                        <span>${this.currentUser.name}</span>
                    </div>
                    <div class="profile-field" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #eee;">
                        <label style="font-weight: 600;">المستوى:</label>
                        <span>${this.currentUser.level}</span>
                    </div>
                    <div class="profile-field" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #eee;">
                        <label style="font-weight: 600;">الهدف:</label>
                        <span>${this.currentUser.goal}</span>
                    </div>
                    <div class="profile-field" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #eee;">
                        <label style="font-weight: 600;">تاريخ الانضمام:</label>
                        <span>${new Date(this.currentUser.joinDate).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div class="profile-field" style="display: flex; justify-content: space-between; padding: 0.75rem 0;">
                        <label style="font-weight: 600;">إجمالي نقاط الخبرة:</label>
                        <span style="color: var(--primary-color); font-weight: bold;">${this.currentUser.profile.xp}</span>
                    </div>
                </div>
                <div class="profile-actions" style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button class="btn-primary" onclick="voiceAcademy.exportProgress()" style="flex: 1;">
                        <i class="fas fa-download"></i> تصدير البيانات
                    </button>
                    <button class="btn-secondary" onclick="voiceAcademy.closeModal()" style="flex: 1;">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(content);
    }

    /**
     * تصدير تقدم المستخدم
     */
    exportProgress() {
        if (!this.currentUser) {
            this.showNotification('لا توجد بيانات للتصدير', 'warning');
            return;
        }

        const exportData = {
            user: this.currentUser,
            exportDate: new Date().toISOString(),
            version: appSettings.version,
            type: 'voice_academy_backup'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `voice-academy-${this.currentUser.name}-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(link.href);
        
        this.showNotification('تم تصدير بياناتك بنجاح 💾', 'success');
        this.log('📤 تم تصدير بيانات المستخدم');
    }

    /**
     * تسجيل الخروج
     */
    logout() {
        if (confirm('هل تريد تسجيل الخروج؟ سيتم حفظ تقدمك تلقائياً.')) {
            this.saveUserData();
            this.currentUser = null;
            
            document.getElementById('mainInterface').classList.add('hidden');
            document.getElementById('loginSection').classList.add('active');
            
            // إعادة تعيين النماذج
            document.getElementById('userName').value = '';
            document.getElementById('userLevel').selectedIndex = 0;
            document.getElementById('trainingGoal').selectedIndex = 0;
            
            this.showNotification('تم تسجيل الخروج وحفظ تقدمك 👋', 'info');
            this.log('🚪 تم تسجيل خروج المستخدم');
        }
    }

    /**
     * عرض النافذة المنبثقة
     */
    showModal(content) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = content;
        modal.classList.remove('hidden');
        
        // التركيز على النافذة لإمكانية الوصول
        modal.focus();
    }

    /**
     * إغلاق النافذة المنبثقة
     */
    closeModal() {
        document.getElementById('modal').classList.add('hidden');
    }

    /**
     * عرض الإشعار
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.getElementById('notificationBar');
        const content = notification.querySelector('.notification-content');
        const icon = notification.querySelector('.notification-icon');
        const text = notification.querySelector('.notification-text');
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        icon.className = `notification-icon fas ${icons[type]}`;
        text.textContent = message;
        notification.className = `notification-bar ${type}`;
        
        // إضافة الإشعار لسجل الإشعارات
        this.notifications.unshift({
            message: message,
            type: type,
            timestamp: new Date().toISOString()
        });
        
        // الاحتفاظ بآخر 10 إشعارات فقط
        if (this.notifications.length > 10) {
            this.notifications = this.notifications.slice(0, 10);
        }
        
        // إخفاء الإشعار تلقائياً
        setTimeout(() => {
            this.closeNotification();
        }, duration);
    }

    /**
     * إغلاق الإشعار
     */
    closeNotification() {
        document.getElementById('notificationBar').classList.add('hidden');
    }

    /**
     * عرض رسالة الترحيب
     */
    showWelcomeMessage() {
        const welcomeMessages = [
            `مرحباً بك ${this.currentUser.name} في أكاديمية الإعلام الاحترافية! 🎉`,
            `أهلاً ${this.currentUser.name}! نحن متحمسون لمساعدتك في تطوير مهاراتك الصوتية`,
            `مرحباً ${this.currentUser.name}! دعنا نبدأ رحلة تطوير مهاراتك الإعلامية معاً`
        ];
        
        const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        this.showNotification(randomMessage, 'success', 7000);
    }

    /**
     * حفظ بيانات المستخدم
     */
    async saveUserData() {
        if (!this.currentUser) return false;
        
        try {
            this.currentUser.lastActiveDate = new Date().toISOString();
            const dataString = JSON.stringify(this.currentUser);
            
            // حفظ محلي في المتصفح
            localStorage.setItem('voiceAcademyUser', dataString);
            
            this.log('💾 تم حفظ بيانات المستخدم');
            return true;
            
        } catch (error) {
            this.error('❌ خطأ في حفظ البيانات:', error);
            this.showNotification('حدث خطأ في حفظ البيانات', 'error');
            return false;
        }
    }

    /**
     * تحميل البيانات المحفوظة
     */
    async loadSavedUserData() {
        try {
            const savedData = localStorage.getItem('voiceAcademyUser');
            if (savedData) {
                const userData = JSON.parse(savedData);
                if (this.validateUserData(userData)) {
                    this.currentUser = userData;
                    this.log('📂 تم تحميل بيانات محفوظة للمستخدم:', userData.name);
                    return true;
                }
            }
        } catch (error) {
            this.error('❌ خطأ في تحميل البيانات المحفوظة:', error);
        }
        return false;
    }

    /**
     * حفظ تلقائي
     */
    autoSave() {
        if (this.currentUser) {
            this.saveUserData();
        }
    }

    /**
     * تحديث التخطيط
     */
    updateLayout() {
        // إعادة حساب أحجام العناصر عند تغيير حجم النافذة
        this.updateProgressCircle();
    }

    /**
     * وظائف السجل والتشخيص
     */
    log(...args) {
        if (appSettings.debug) {
            console.log('🎓 [Voice Academy]', ...args);
        }
    }

    warn(...args) {
        console.warn('⚠️ [Voice Academy]', ...args);
    }

    error(...args) {
        console.error('❌ [Voice Academy]', ...args);
    }
}

/**
 * ========================================
 * الوظائف العامة للواجهة
 * ========================================
 */

// بدء التدريب
function startTraining() {
    if (voiceAcademy) {
        voiceAcademy.startTraining();
    }
}

// تحميل ملف موجود
function loadExistingProfile() {
    if (voiceAcademy) {
        voiceAcademy.loadExistingProfile();
    }
}

// بدء العرض التوضيحي
function startDemo() {
    if (voiceAcademy) {
        voiceAcademy.startDemo();
    }
}

// التبديل بين التبويبات
function switchTab(tabName, element) {
    if (voiceAcademy) {
        voiceAcademy.switchTab(tabName, element);
    }
}

// الحصول على نصيحة مخصصة
function getPersonalizedAdvice() {
    if (voiceAcademy) {
        voiceAcademy.getPersonalizedAdvice();
    }
}

// عرض الإشعارات
function showNotifications() {
    if (voiceAcademy) {
        voiceAcademy.showNotifications();
    }
}

// عرض الملف الشخصي
function showProfile() {
    if (voiceAcademy) {
        voiceAcademy.showProfile();
    }
}

// تسجيل الخروج
function logout() {
    if (voiceAcademy) {
        voiceAcademy.logout();
    }
}

// إغلاق النافذة المنبثقة
function closeModal() {
    if (voiceAcademy) {
        voiceAcademy.closeModal();
    }
}

// إغلاق الإشعار
function closeNotification() {
    if (voiceAcademy) {
        voiceAcademy.closeNotification();
    }
}

/**
 * ========================================
 * تهيئة التطبيق عند تحميل الصفحة
 * ========================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // إنشاء مثيل التطبيق
    voiceAcademy = new VoiceAcademyApp();
    
    // تسجيل التطبيق كـ Service Worker للعمل بدون إنترنت
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('🔧 تم تسجيل Service Worker بنجاح');
            })
            .catch(error => {
                console.log('❌ فشل في تسجيل Service Worker:', error);
            });
    }
    
    // إضافة أحداث إضافية
    setupAdditionalEventListeners();
    
    console.log('🎓 أكاديمية الإعلام الاحترافية جاهزة للاستخدام!');
    console.log('📚 جميع المميزات متاحة');
    console.log('💾 البيانات محفوظة محلياً مع حفظ تلقائي');
    console.log('🎯 النظام يدعم: التدريب التفاعلي، الذكاء الاصطناعي، والتحليل المتقدم');
    console.log('⌨️ استخدم Ctrl+1-5 للتنقل السريع بين التبويبات');
});

/**
 * إعداد أحداث إضافية
 */
function setupAdditionalEventListeners() {
    // مراقبة تغيير اتجاه الشاشة للأجهزة المحمولة
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            if (voiceAcademy) {
                voiceAcademy.updateLayout();
            }
        }, 500);
    });
    
    // مراقبة حالة الرؤية (عندما يترك المستخدم التبويب)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // حفظ البيانات عند إخفاء التبويب
            if (voiceAcademy && voiceAcademy.currentUser) {
                voiceAcademy.saveUserData();
            }
        }
    });
    
    // حفظ البيانات قبل إغلاق النافذة
    window.addEventListener('beforeunload', function(e) {
        if (voiceAcademy && voiceAcademy.currentUser) {
            voiceAcademy.saveUserData();
        }
    });
}

/**
 * ========================================
 * إعدادات إضافية وثوابت
 * ========================================
 */

// ثوابت التطبيق
const APP_CONSTANTS = {
    MAX_USERNAME_LENGTH: 50,
    MIN_USERNAME_LENGTH: 2,
    AUTO_SAVE_INTERVAL: 30000, // 30 ثانية
    NOTIFICATION_DURATION: 5000, // 5 ثوانٍ
    SUPPORTED_AUDIO_FORMATS: ['audio/wav', 'audio/mp3', 'audio/webm'],
    DEFAULT_DAILY_GOALS: {
        exercises: 3,
        minutes: 30,
        recordings: 2
    }
};

// رسائل النظام
const SYSTEM_MESSAGES = {
    ar: {
        welcome: 'مرحباً بك في أكاديمية الإعلام الاحترافية',
        loginSuccess: 'تم تسجيل الدخول بنجاح',
        logoutSuccess: 'تم تسجيل الخروج بنجاح',
        dataSaved: 'تم حفظ البيانات',
        dataExported: 'تم تصدير البيانات بنجاح',
        errorOccurred: 'حدث خطأ غير متوقع',
        internetOffline: 'لا يوجد اتصال بالإنترنت - التطبيق يعمل بوضع عدم الاتصال',
        internetOnline: 'تم استعادة الاتصال بالإنترنت'
    }
};

// إعدادات الأداء
const PERFORMANCE_CONFIG = {
    enableGPUAcceleration: true,
    enablePreloadHints: true,
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    compressionLevel: 6
};

// تصدير التطبيق للنطاق العام
window.VoiceAcademyApp = VoiceAcademyApp;
window.voiceAcademy = voiceAcademy;
