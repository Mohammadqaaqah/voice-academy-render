/**
 * ========================================
 * معالج الصوت البسيط - أكاديمية الإعلام
 * Simple Audio Processing - Voice Academy
 * ========================================
 */

// متغيرات عامة
let audioProcessor = null;
let isAudioReady = false;

/**
 * فئة معالج الصوت
 */
class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.mediaRecorder = null;
        this.recordingStream = null;
        this.isRecording = false;
        this.chunks = [];
        this.init();
    }

    /**
     * تهيئة معالج الصوت
     */
    async init() {
        try {
            console.log('🎵 تهيئة معالج الصوت...');
            
            // تهيئة AudioContext
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('✅ تم تهيئة AudioContext بنجاح');
            }
            
            isAudioReady = true;
            console.log('✅ معالج الصوت جاهز للاستخدام');
            
        } catch (error) {
            console.warn('⚠️ خطأ في تهيئة معالج الصوت:', error);
        }
    }

    /**
     * طلب إذن الميكروفون
     */
    async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('✅ تم الحصول على إذن الميكروفون');
            
            // إيقاف التسجيل المؤقت
            stream.getTracks().forEach(track => track.stop());
            return true;
            
        } catch (error) {
            console.error('❌ فشل في الحصول على إذن الميكروفون:', error);
            return false;
        }
    }

    /**
     * بدء التسجيل
     */
    async startRecording() {
        try {
            if (this.isRecording) {
                console.warn('⚠️ التسجيل قيد التشغيل بالفعل');
                return false;
            }

            // الحصول على تدفق الصوت
            this.recordingStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // إنشاء MediaRecorder
            this.mediaRecorder = new MediaRecorder(this.recordingStream, {
                mimeType: this.getSupportedMimeType()
            });

            // إعداد أحداث التسجيل
            this.setupRecordingEvents();

            // بدء التسجيل
            this.chunks = [];
            this.mediaRecorder.start();
            this.isRecording = true;

            console.log('🎤 بدء التسجيل...');
            return true;

        } catch (error) {
            console.error('❌ خطأ في بدء التسجيل:', error);
            return false;
        }
    }

    /**
     * إيقاف التسجيل
     */
    stopRecording() {
        return new Promise((resolve) => {
            if (!this.isRecording || !this.mediaRecorder) {
                console.warn('⚠️ لا يوجد تسجيل نشط');
                resolve(null);
                return;
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.chunks, { 
                    type: this.getSupportedMimeType() 
                });
                
                this.cleanup();
                console.log('⏹️ تم إيقاف التسجيل');
                resolve(audioBlob);
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * إعداد أحداث التسجيل
     */
    setupRecordingEvents() {
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.chunks.push(event.data);
            }
        };

        this.mediaRecorder.onerror = (event) => {
            console.error('❌ خطأ في التسجيل:', event.error);
            this.cleanup();
        };
    }

    /**
     * تنظيف الموارد
     */
    cleanup() {
        if (this.recordingStream) {
            this.recordingStream.getTracks().forEach(track => track.stop());
            this.recordingStream = null;
        }
        
        this.mediaRecorder = null;
        this.isRecording = false;
        this.chunks = [];
    }

    /**
     * الحصول على نوع MIME المدعوم
     */
    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/wav',
            'audio/mp4',
            'audio/mpeg'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return 'audio/webm'; // افتراضي
    }

    /**
     * تحليل الصوت (محاكاة)
     */
    async analyzeAudio(audioBlob) {
        try {
            console.log('🔍 تحليل الصوت...');
            
            // محاكاة وقت التحليل
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // نتائج تحليل محاكاة
            const analysis = {
                duration: this.getAudioDuration(audioBlob),
                quality: Math.floor(Math.random() * 30) + 70, // 70-100
                volume: Math.floor(Math.random() * 40) + 60,  // 60-100
                clarity: Math.floor(Math.random() * 35) + 65, // 65-100
                timestamp: new Date().toISOString()
            };
            
            console.log('✅ تم تحليل الصوت:', analysis);
            return analysis;
            
        } catch (error) {
            console.error('❌ خطأ في تحليل الصوت:', error);
            return null;
        }
    }

    /**
     * الحصول على مدة الصوت
     */
    getAudioDuration(audioBlob) {
        // محاكاة حساب المدة
        return Math.floor(audioBlob.size / 16000); // تقدير تقريبي
    }

    /**
     * تشغيل الصوت
     */
    playAudio(audioBlob) {
        try {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
            };
            
            audio.play();
            console.log('▶️ تشغيل الصوت...');
            return audio;
            
        } catch (error) {
            console.error('❌ خطأ في تشغيل الصوت:', error);
            return null;
        }
    }

    /**
     * تحويل الصوت إلى Base64
     */
    audioToBase64(audioBlob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(audioBlob);
        });
    }

    /**
     * الحصول على معلومات الحالة
     */
    getStatus() {
        return {
            isReady: isAudioReady,
            isRecording: this.isRecording,
            hasAudioContext: !!this.audioContext,
            supportedMimeType: this.getSupportedMimeType()
        };
    }
}

/**
 * ========================================
 * وظائف مساعدة عامة
 * ========================================
 */

/**
 * تهيئة معالج الصوت
 */
async function initializeAudioProcessor() {
    if (!audioProcessor) {
        audioProcessor = new AudioProcessor();
        await audioProcessor.init();
    }
    return audioProcessor;
}

/**
 * فحص دعم الصوت
 */
function checkAudioSupport() {
    const support = {
        mediaDevices: !!navigator.mediaDevices,
        getUserMedia: !!navigator.mediaDevices?.getUserMedia,
        mediaRecorder: !!window.MediaRecorder,
        audioContext: !!(window.AudioContext || window.webkitAudioContext)
    };
    
    console.log('🔧 دعم الصوت:', support);
    return support;
}

/**
 * ========================================
 * تصدير للنطاق العام
 * ========================================
 */

// تصدير للنطاق العام
if (typeof window !== 'undefined') {
    window.AudioProcessor = AudioProcessor;
    window.initializeAudioProcessor = initializeAudioProcessor;
    window.checkAudioSupport = checkAudioSupport;
    window.audioProcessor = audioProcessor;
    
    // فحص دعم الصوت عند التحميل
    document.addEventListener('DOMContentLoaded', () => {
        checkAudioSupport();
        initializeAudioProcessor();
    });
}

// تصدير للـ Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AudioProcessor,
        initializeAudioProcessor,
        checkAudioSupport
    };
}

console.log('🎵 تم تحميل معالج الصوت البسيط');
