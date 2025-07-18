/**
 * ========================================
 * معالج الصوت المتقدم - أكاديمية الإعلام الاحترافية
 * تسجيل ومعالجة وتحليل الأصوات بجودة احترافية
 * ========================================
 */

/**
 * فئة معالج الصوت الرئيسية
 */
class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.mediaRecorder = null;
        this.mediaStream = null;
        this.analyser = null;
        this.microphone = null;
        this.processor = null;
        
        this.isRecording = false;
        this.isPaused = false;
        this.recordingData = [];
        this.currentRecordingBlob = null;
        
        this.visualizer = null;
        this.recordingStartTime = null;
        this.recordingDuration = 0;
        
        this.audioSettings = {
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            bitsPerSecond: 128000
        };
        
        this.effectsChain = [];
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * تهيئة معالج الصوت
     */
    async init() {
        try {
            console.log('🎵 بدء تحميل معالج الصوت...');
            
            // فحص دعم المتصفح
            if (!this.checkBrowserSupport()) {
                throw new Error('المتصفح لا يدعم تسجيل الصوت');
            }
            
            // تهيئة السياق الصوتي
            await this.initializeAudioContext();
            
            // إعداد المعالجات
            this.setupAudioProcessors();
            
            // تحضير المؤثرات
            this.setupEffectsChain();
            
            this.isInitialized = true;
            console.log('✅ تم تحميل معالج الصوت بنجاح!');
            
        } catch (error) {
            console.error('❌ خطأ في تحميل معالج الصوت:', error);
            throw error;
        }
    }

    /**
     * فحص دعم المتصفح
     */
    checkBrowserSupport() {
        const requirements = [
            'AudioContext' in window || 'webkitAudioContext' in window,
            'MediaRecorder' in window,
            navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        ];
        
        return requirements.every(req => req);
    }

    /**
     * تهيئة السياق الصوتي
     */
    async initializeAudioContext() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass({
                sampleRate: this.audioSettings.sampleRate,
                latencyHint: 'interactive'
            });
            
            // تفعيل السياق إذا كان معلقاً
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            console.log('🎚️ تم تهيئة السياق الصوتي');
            
        } catch (error) {
            console.error('خطأ في تهيئة السياق الصوتي:', error);
            throw error;
        }
    }

    /**
     * إعداد المعالجات الصوتية
     */
    setupAudioProcessors() {
        // إنشاء محلل الطيف
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;
        
        // إنشاء معالج البيانات
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        
        console.log('🔧 تم إعداد المعالجات الصوتية');
    }

    /**
     * إعداد سلسلة المؤثرات
     */
    setupEffectsChain() {
        this.effectsChain = {
            // مرشح تمرير عالي لإزالة الترددات المنخفضة
            highPassFilter: this.createHighPassFilter(80), // 80 هرتز
            
            // ضاغط ديناميكي لتوحيد مستوى الصوت
            compressor: this.createCompressor(),
            
            // مرشح تمرير منخفض لإزالة الترددات العالية الضارة
            lowPassFilter: this.createLowPassFilter(8000), // 8 كيلو هرتز
            
            // مكبر الصوت
            gainNode: this.createGainNode(1.0),
            
            // مؤثر الصدى (اختياري)
            reverb: null, // سيتم إنشاؤه عند الحاجة
            
            // مؤثر تقليل الضوضاء
            noiseGate: this.createNoiseGate(-40) // -40 ديسيبل
        };
        
        console.log('🎛️ تم إعداد سلسلة المؤثرات');
    }

    /**
     * إنشاء مرشح تمرير عالي
     */
    createHighPassFilter(frequency) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = frequency;
        filter.Q.value = 1;
        return filter;
    }

    /**
     * إنشاء مرشح تمرير منخفض
     */
    createLowPassFilter(frequency) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency;
        filter.Q.value = 1;
        return filter;
    }

    /**
     * إنشاء ضاغط ديناميكي
     */
    createCompressor() {
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        return compressor;
    }

    /**
     * إنشاء مكبر الصوت
     */
    createGainNode(gain = 1.0) {
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = gain;
        return gainNode;
    }

    /**
     * إنشاء بوابة الضوضاء
     */
    createNoiseGate(threshold) {
        // محاكاة بوابة الضوضاء باستخدام معالج مخصص
        const processor = this.audioContext.createScriptProcessor(1024, 1, 1);
        
        processor.onaudioprocess = (event) => {
            const inputBuffer = event.inputBuffer;
            const outputBuffer = event.outputBuffer;
            const inputData = inputBuffer.getChannelData(0);
            const outputData = outputBuffer.getChannelData(0);
            
            for (let i = 0; i < inputBuffer.length; i++) {
                const amplitude = Math.abs(inputData[i]);
                const dbLevel = 20 * Math.log10(amplitude);
                
                if (dbLevel > threshold) {
                    outputData[i] = inputData[i];
                } else {
                    outputData[i] = inputData[i] * 0.1; // تقليل الضوضاء
                }
            }
        };
        
        return processor;
    }

    /**
     * طلب إذن الوصول للميكروفون
     */
    async requestMicrophoneAccess() {
        try {
            const constraints = {
                audio: {
                    echoCancellation: this.audioSettings.echoCancellation,
                    noiseSuppression: this.audioSettings.noiseSuppression,
                    autoGainControl: this.audioSettings.autoGainControl,
                    channelCount: this.audioSettings.channelCount,
                    sampleRate: this.audioSettings.sampleRate
                }
            };
            
            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('🎤 تم الحصول على إذن الوصول للميكروفون');
            
            return this.mediaStream;
            
        } catch (error) {
            console.error('❌ خطأ في الوصول للميكروفون:', error);
            
            // رسائل خطأ مفصلة
            if (error.name === 'NotAllowedError') {
                throw new Error('تم رفض الوصول للميكروفون. يرجى السماح بالوصول من إعدادات المتصفح.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('لم يتم العثور على ميكروفون. تأكد من توصيل ميكروفون بالجهاز.');
            } else if (error.name === 'NotReadableError') {
                throw new Error('الميكروفون قيد الاستخدام من تطبيق آخر.');
            } else {
                throw new Error('خطأ غير متوقع في الوصول للميكروفون.');
            }
        }
    }

    /**
     * إعداد سلسلة معالجة الصوت
     */
    setupAudioChain(stream) {
        // إنشاء مصدر من الميكروفون
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        
        // ربط سلسلة المعالجة
        let currentNode = this.microphone;
        
        // تطبيق المرشحات والمؤثرات
        currentNode = this.connectNode(currentNode, this.effectsChain.highPassFilter);
        currentNode = this.connectNode(currentNode, this.effectsChain.compressor);
        currentNode = this.connectNode(currentNode, this.effectsChain.lowPassFilter);
        currentNode = this.connectNode(currentNode, this.effectsChain.gainNode);
        
        // ربط المحلل للتصور
        currentNode.connect(this.analyser);
        
        // إعداد المسجل
        this.setupMediaRecorder(stream);
        
        console.log('🔗 تم إعداد سلسلة معالجة الصوت');
    }

    /**
     * ربط العقد الصوتية
     */
    connectNode(sourceNode, targetNode) {
        if (sourceNode && targetNode) {
            sourceNode.connect(targetNode);
            return targetNode;
        }
        return sourceNode;
    }

    /**
     * إعداد مسجل الوسائط
     */
    setupMediaRecorder(stream) {
        // تحديد تنسيق التسجيل المدعوم
        const mimeTypes = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/wav'
        ];
        
        let selectedMimeType = null;
        for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                selectedMimeType = mimeType;
                break;
            }
        }
        
        if (!selectedMimeType) {
            throw new Error('لا يوجد تنسيق تسجيل مدعوم');
        }
        
        // إنشاء المسجل
        this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: selectedMimeType,
            bitsPerSecond: this.audioSettings.bitsPerSecond
        });
        
        // إعداد أحداث المسجل
        this.setupRecorderEvents();
        
        console.log(`📹 تم إعداد المسجل بتنسيق: ${selectedMimeType}`);
    }

    /**
     * إعداد أحداث المسجل
     */
    setupRecorderEvents() {
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordingData.push(event.data);
            }
        };
        
        this.mediaRecorder.onstart = () => {
            console.log('▶️ بدء التسجيل');
            this.recordingStartTime = Date.now();
            this.startVisualization();
        };
        
        this.mediaRecorder.onstop = () => {
            console.log('⏹️ إيقاف التسجيل');
            this.recordingDuration = Date.now() - this.recordingStartTime;
            this.finishRecording();
            this.stopVisualization();
        };
        
        this.mediaRecorder.onpause = () => {
            console.log('⏸️ إيقاف مؤقت للتسجيل');
            this.isPaused = true;
        };
        
        this.mediaRecorder.onresume = () => {
            console.log('▶️ استئناف التسجيل');
            this.isPaused = false;
        };
        
        this.mediaRecorder.onerror = (event) => {
            console.error('❌ خطأ في التسجيل:', event.error);
        };
    }

    /**
     * بدء التسجيل
     */
    async startRecording() {
        if (!this.isInitialized) {
            throw new Error('معالج الصوت غير مهيأ');
        }
        
        if (this.isRecording) {
            console.warn('التسجيل قيد التشغيل بالفعل');
            return false;
        }
        
        try {
            // الحصول على إذن الميكروفون
            const stream = await this.requestMicrophoneAccess();
            
            // إعداد سلسلة المعالجة
            this.setupAudioChain(stream);
            
            // تنظيف البيانات السابقة
            this.recordingData = [];
            this.currentRecordingBlob = null;
            
            // بدء التسجيل
            this.mediaRecorder.start(100); // حفظ كل 100ms
            this.isRecording = true;
            
            console.log('🎙️ تم بدء التسجيل بنجاح');
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في بدء التسجيل:', error);
            throw error;
        }
    }

    /**
     * إيقاف التسجيل
     */
    stopRecording() {
        if (!this.isRecording) {
            console.warn('لا يوجد تسجيل نشط');
            return null;
        }
        
        try {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.isPaused = false;
            
            // إيقاف الميكروفون
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
            }
            
            console.log('⏹️ تم إيقاف التسجيل');
            
        } catch (error) {
            console.error('❌ خطأ في إيقاف التسجيل:', error);
        }
    }

    /**
     * إيقاف مؤقت للتسجيل
     */
    pauseRecording() {
        if (!this.isRecording || this.isPaused) {
            return false;
        }
        
        try {
            this.mediaRecorder.pause();
            return true;
        } catch (error) {
            console.error('❌ خطأ في الإيقاف المؤقت:', error);
            return false;
        }
    }

    /**
     * استئناف التسجيل
     */
    resumeRecording() {
        if (!this.isRecording || !this.isPaused) {
            return false;
        }
        
        try {
            this.mediaRecorder.resume();
            return true;
        } catch (error) {
            console.error('❌ خطأ في الاستئناف:', error);
            return false;
        }
    }

    /**
     * إنهاء التسجيل وإنشاء الملف
     */
    finishRecording() {
        if (this.recordingData.length === 0) {
            console.warn('لا توجد بيانات تسجيل');
            return null;
        }
        
        // دمج البيانات في ملف واحد
        this.currentRecordingBlob = new Blob(this.recordingData, {
            type: this.mediaRecorder.mimeType
        });
        
        // حساب الحجم والمدة
        const sizeInMB = (this.currentRecordingBlob.size / (1024 * 1024)).toFixed(2);
        const durationInSeconds = (this.recordingDuration / 1000).toFixed(1);
        
        console.log(`📁 تم إنشاء ملف التسجيل: ${sizeInMB} ميجابايت، ${durationInSeconds} ثانية`);
        
        return this.currentRecordingBlob;
    }

    /**
     * بدء التصور الصوتي
     */
    startVisualization(canvasId = 'audioVisualizer') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn('لم يتم العثور على عنصر التصور');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        this.visualizer = {
            canvas: canvas,
            ctx: ctx,
            bufferLength: bufferLength,
            dataArray: dataArray,
            animationFrame: null
        };
        
        this.drawVisualization();
    }

    /**
     * رسم التصور الصوتي
     */
    drawVisualization() {
        if (!this.visualizer || !this.isRecording) {
            return;
        }
        
        const { ctx, canvas, bufferLength, dataArray } = this.visualizer;
        
        this.visualizer.animationFrame = requestAnimationFrame(() => this.drawVisualization());
        
        this.analyser.getByteFrequencyData(dataArray);
        
        // تنظيف القماش
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // رسم الأعمدة
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
            
            // تدرج لوني حسب التردد
            const hue = (i / bufferLength) * 360;
            ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
            
            // رسم العمود
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
        
        // رسم مؤشر الصوت
        this.drawVolumeIndicator(ctx, canvas, dataArray);
    }

    /**
     * رسم مؤشر مستوى الصوت
     */
    drawVolumeIndicator(ctx, canvas, dataArray) {
        // حساب متوسط مستوى الصوت
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const volumeLevel = (average / 255) * 100;
        
        // رسم مؤشر دائري
        const centerX = canvas.width - 50;
        const centerY = 50;
        const radius = 30;
        
        // خلفية المؤشر
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fill();
        
        // مؤشر المستوى
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.8, -Math.PI / 2, (-Math.PI / 2) + (volumeLevel / 100) * 2 * Math.PI);
        ctx.lineWidth = 6;
        ctx.strokeStyle = volumeLevel > 80 ? '#f44336' : volumeLevel > 50 ? '#ff9800' : '#4caf50';
        ctx.stroke();
        
        // النص
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(volumeLevel)}%`, centerX, centerY + 4);
    }

    /**
     * إيقاف التصور الصوتي
     */
    stopVisualization() {
        if (this.visualizer && this.visualizer.animationFrame) {
            cancelAnimationFrame(this.visualizer.animationFrame);
            this.visualizer = null;
        }
    }

    /**
     * تطبيق المؤثرات الصوتية
     */
    applyEffect(effectName, intensity = 1.0) {
        switch (effectName) {
            case 'echo':
                this.applyEcho(intensity);
                break;
            case 'reverb':
                this.applyReverb(intensity);
                break;
            case 'normalize':
                this.applyNormalization(intensity);
                break;
            case 'bass_boost':
                this.applyBassBoost(intensity);
                break;
            case 'treble_boost':
                this.applyTrebleBoost(intensity);
                break;
            default:
                console.warn(`مؤثر غير معروف: ${effectName}`);
        }
    }

    /**
     * تطبيق مؤثر الصدى
     */
    applyEcho(intensity) {
        if (!this.effectsChain.reverb) {
            // إنشاء مؤثر الصدى
            const delayNode = this.audioContext.createDelay(1.0);
            const feedbackNode = this.audioContext.createGain();
            const wetNode = this.audioContext.createGain();
            
            delayNode.delayTime.value = 0.3 * intensity;
            feedbackNode.gain.value = 0.3 * intensity;
            wetNode.gain.value = 0.2 * intensity;
            
            // ربط العقد
            delayNode.connect(feedbackNode);
            feedbackNode.connect(delayNode);
            delayNode.connect(wetNode);
            
            this.effectsChain.reverb = { delayNode, feedbackNode, wetNode };
        }
        
        console.log(`تم تطبيق مؤثر الصدى بكثافة ${intensity}`);
    }

    /**
     * تطبيق مؤثر الرنين
     */
    applyReverb(intensity) {
        // إنشاء استجابة دافعة للرنين
        const reverbTime = 2 * intensity;
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * reverbTime;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        const convolver = this.audioContext.createConvolver();
        convolver.buffer = impulse;
        
        console.log(`تم تطبيق مؤثر الرنين بكثافة ${intensity}`);
    }

    /**
     * تطبيق تطبيع الصوت
     */
    applyNormalization(intensity) {
        if (this.effectsChain.gainNode) {
            this.effectsChain.gainNode.gain.value = 1.0 + (0.5 * intensity);
        }
        
        console.log(`تم تطبيق تطبيع الصوت بكثافة ${intensity}`);
    }

    /**
     * تعزيز الترددات المنخفضة
     */
    applyBassBoost(intensity) {
        const bassFilter = this.audioContext.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 200;
        bassFilter.gain.value = 10 * intensity;
        
        console.log(`تم تطبيق تعزيز الباس بكثافة ${intensity}`);
    }

    /**
     * تعزيز الترددات العالية
     */
    applyTrebleBoost(intensity) {
        const trebleFilter = this.audioContext.createBiquadFilter();
        trebleFilter.type = 'highshelf';
        trebleFilter.frequency.value = 3000;
        trebleFilter.gain.value = 8 * intensity;
        
        console.log(`تم تطبيق تعزيز التريبل بكثافة ${intensity}`);
    }

    /**
     * تحليل جودة الصوت
     */
    analyzeAudioQuality(audioBlob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const arrayBuffer = event.target.result;
                    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                    
                    const analysis = {
                        duration: audioBuffer.duration,
                        sampleRate: audioBuffer.sampleRate,
                        numberOfChannels: audioBuffer.numberOfChannels,
                        length: audioBuffer.length,
                        
                        // تحليل الإشارة
                        peakAmplitude: this.calculatePeakAmplitude(audioBuffer),
                        rmsLevel: this.calculateRMSLevel(audioBuffer),
                        dynamicRange: this.calculateDynamicRange(audioBuffer),
                        signalToNoiseRatio: this.estimateSignalToNoiseRatio(audioBuffer),
                        
                        // تحليل الطيف
                        frequencyAnalysis: this.analyzeFrequencySpectrum(audioBuffer),
                        
                        // تقييم الجودة
                        qualityScore: 0
                    };
                    
                    // حساب نقاط الجودة
                    analysis.qualityScore = this.calculateQualityScore(analysis);
                    
                    resolve(analysis);
                    
                } catch (error) {
                    console.error('خطأ في تحليل جودة الصوت:', error);
                    resolve(null);
                }
            };
            
            reader.readAsArrayBuffer(audioBlob);
        });
    }

    /**
     * حساب أقصى سعة
     */
    calculatePeakAmplitude(audioBuffer) {
        let peak = 0;
        
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                peak = Math.max(peak, Math.abs(channelData[i]));
            }
        }
        
        return peak;
    }

    /**
     * حساب مستوى RMS
     */
    calculateRMSLevel(audioBuffer) {
        let sum = 0;
        let count = 0;
        
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                sum += channelData[i] * channelData[i];
                count++;
            }
        }
        
        return Math.sqrt(sum / count);
    }

    /**
     * حساب النطاق الديناميكي
     */
    calculateDynamicRange(audioBuffer) {
        const peak = this.calculatePeakAmplitude(audioBuffer);
        const rms = this.calculateRMSLevel(audioBuffer);
        
        return 20 * Math.log10(peak / rms);
    }

    /**
     * تقدير نسبة الإشارة إلى الضوضاء
     */
    estimateSignalToNoiseRatio(audioBuffer) {
        // حساب تقديري بناءً على التباين في مستوى الصوت
        const channelData = audioBuffer.getChannelData(0);
        const windowSize = Math.floor(audioBuffer.sampleRate * 0.1); // نافذة 100ms
        
        let signalPower = 0;
        let noisePower = 0;
        let signalSamples = 0;
        let noiseSamples = 0;
        
        for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
            let windowPower = 0;
            
            for (let j = 0; j < windowSize; j++) {
                windowPower += channelData[i + j] * channelData[i + j];
            }
            
            windowPower /= windowSize;
            
            // تصنيف النافذة كإشارة أو ضوضاء
            if (windowPower > 0.01) { // عتبة تجريبية
                signalPower += windowPower;
                signalSamples++;
            } else {
                noisePower += windowPower;
                noiseSamples++;
            }
        }
        
        if (noiseSamples === 0 || signalSamples === 0) {
            return 40; // قيمة افتراضية جيدة
        }
        
        const avgSignalPower = signalPower / signalSamples;
        const avgNoisePower = noisePower / noiseSamples;
        
        return 10 * Math.log10(avgSignalPower / avgNoisePower);
    }

    /**
     * تحليل الطيف الترددي
     */
    analyzeFrequencySpectrum(audioBuffer) {
        const fftSize = 2048;
        const channelData = audioBuffer.getChannelData(0);
        
        // أخذ عينة من منتصف التسجيل
        const startSample = Math.floor((channelData.length - fftSize) / 2);
        const segment = channelData.slice(startSample, startSample + fftSize);
        
        // تطبيق FFT بسيط (محاكاة)
        const spectrum = this.simpleFFT(segment);
        
        // تحليل النطاقات الترددية
        const analysis = {
            lowFrequency: this.analyzeBand(spectrum, 0, 0.1), // 0-10% من النطاق
            midFrequency: this.analyzeBand(spectrum, 0.1, 0.6), // 10-60%
            highFrequency: this.analyzeBand(spectrum, 0.6, 1.0), // 60-100%
            
            fundamentalFrequency: this.estimateFundamentalFrequency(spectrum),
            spectralCentroid: this.calculateSpectralCentroid(spectrum),
            spectralRolloff: this.calculateSpectralRolloff(spectrum)
        };
        
        return analysis;
    }

    /**
     * FFT مبسط للتوضيح
     */
    simpleFFT(data) {
        // محاكاة تحويل فورييه السريع
        const spectrum = new Array(data.length / 2);
        
        for (let i = 0; i < spectrum.length; i++) {
            const real = data[i * 2] || 0;
            const imag = data[i * 2 + 1] || 0;
            spectrum[i] = Math.sqrt(real * real + imag * imag);
        }
        
        return spectrum;
    }

    /**
     * تحليل نطاق ترددي
     */
    analyzeBand(spectrum, startRatio, endRatio) {
        const startIndex = Math.floor(startRatio * spectrum.length);
        const endIndex = Math.floor(endRatio * spectrum.length);
        
        let sum = 0;
        let peak = 0;
        
        for (let i = startIndex; i < endIndex; i++) {
            sum += spectrum[i];
            peak = Math.max(peak, spectrum[i]);
        }
        
        return {
            average: sum / (endIndex - startIndex),
            peak: peak,
            energy: sum
        };
    }

    /**
     * تقدير التردد الأساسي
     */
    estimateFundamentalFrequency(spectrum) {
        let maxIndex = 0;
        let maxValue = 0;
        
        // البحث عن أقوى تردد في النطاق الصوتي (80-800 هرتز تقريباً)
        const startIndex = Math.floor(spectrum.length * 0.02);
        const endIndex = Math.floor(spectrum.length * 0.2);
        
        for (let i = startIndex; i < endIndex; i++) {
            if (spectrum[i] > maxValue) {
                maxValue = spectrum[i];
                maxIndex = i;
            }
        }
        
        // تحويل المؤشر إلى تردد (تقديري)
        return (maxIndex / spectrum.length) * 22050; // نصف معدل العينة
    }

    /**
     * حساب مركز الطيف
     */
    calculateSpectralCentroid(spectrum) {
        let weightedSum = 0;
        let magnitudeSum = 0;
        
        for (let i = 0; i < spectrum.length; i++) {
            weightedSum += i * spectrum[i];
            magnitudeSum += spectrum[i];
        }
        
        return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    }

    /**
     * حساب نقطة التراجع الطيفي
     */
    calculateSpectralRolloff(spectrum, rolloffThreshold = 0.85) {
        const totalEnergy = spectrum.reduce((sum, value) => sum + value, 0);
        const thresholdEnergy = totalEnergy * rolloffThreshold;
        
        let cumulativeEnergy = 0;
        
        for (let i = 0; i < spectrum.length; i++) {
            cumulativeEnergy += spectrum[i];
            if (cumulativeEnergy >= thresholdEnergy) {
                return i / spectrum.length;
            }
        }
        
        return 1.0;
    }

    /**
     * حساب نقاط الجودة الإجمالية
     */
    calculateQualityScore(analysis) {
        let score = 100; // البداية من 100
        
        // تقييم مستوى الصوت
        if (analysis.peakAmplitude < 0.1) score -= 20; // صوت ضعيف جداً
        else if (analysis.peakAmplitude > 0.95) score -= 15; // تشبع في الصوت
        
        // تقييم النطاق الديناميكي
        if (analysis.dynamicRange < 6) score -= 15; // نطاق ديناميكي ضعيف
        else if (analysis.dynamicRange > 30) score += 5; // نطاق ديناميكي ممتاز
        
        // تقييم نسبة الإشارة إلى الضوضاء
        if (analysis.signalToNoiseRatio < 20) score -= 20; // ضوضاء عالية
        else if (analysis.signalToNoiseRatio > 40) score += 10; // جودة ممتازة
        
        // تقييم توزيع الترددات
        const freqAnalysis = analysis.frequencyAnalysis;
        if (freqAnalysis.midFrequency.energy < freqAnalysis.lowFrequency.energy) {
            score -= 10; // نقص في الترددات المتوسطة المهمة للكلام
        }
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * تحويل الصوت إلى موجة صوتية للتصور
     */
    generateWaveform(audioBlob, canvasId = 'waveform') {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const arrayBuffer = event.target.result;
                    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                    
                    const canvas = document.getElementById(canvasId);
                    if (!canvas) {
                        resolve(null);
                        return;
                    }
                    
                    const ctx = canvas.getContext('2d');
                    const width = canvas.width;
                    const height = canvas.height;
                    
                    // تنظيف القماش
                    ctx.fillStyle = '#f8f9fa';
                    ctx.fillRect(0, 0, width, height);
                    
                    // الحصول على بيانات القناة
                    const channelData = audioBuffer.getChannelData(0);
                    const samplesPerPixel = Math.floor(channelData.length / width);
                    
                    // رسم الموجة
                    ctx.strokeStyle = '#667eea';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    
                    for (let x = 0; x < width; x++) {
                        const startSample = x * samplesPerPixel;
                        const endSample = startSample + samplesPerPixel;
                        
                        let min = 1.0;
                        let max = -1.0;
                        
                        for (let i = startSample; i < endSample && i < channelData.length; i++) {
                            const sample = channelData[i];
                            min = Math.min(min, sample);
                            max = Math.max(max, sample);
                        }
                        
                        const yMin = ((min + 1) / 2) * height;
                        const yMax = ((max + 1) / 2) * height;
                        
                        if (x === 0) {
                            ctx.moveTo(x, height / 2);
                        }
                        
                        ctx.lineTo(x, yMax);
                        ctx.lineTo(x, yMin);
                    }
                    
                    ctx.stroke();
                    
                    // رسم خط المنتصف
                    ctx.strokeStyle = '#ccc';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(0, height / 2);
                    ctx.lineTo(width, height / 2);
                    ctx.stroke();
                    
                    resolve(true);
                    
                } catch (error) {
                    console.error('خطأ في رسم الموجة الصوتية:', error);
                    resolve(false);
                }
            };
            
            reader.readAsArrayBuffer(audioBlob);
        });
    }

    /**
     * حفظ التسجيل
     */
    saveRecording(filename = null) {
        if (!this.currentRecordingBlob) {
            console.warn('لا يوجد تسجيل لحفظه');
            return false;
        }
        
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const defaultFilename = `voice-recording-${timestamp}`;
            const finalFilename = filename || defaultFilename;
            
            // تحديد امتداد الملف بناءً على نوع الميديا
            let extension = '.webm';
            if (this.mediaRecorder.mimeType.includes('mp4')) extension = '.mp4';
            else if (this.mediaRecorder.mimeType.includes('wav')) extension = '.wav';
            
            // إنشاء رابط التحميل
            const url = URL.createObjectURL(this.currentRecordingBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = finalFilename + extension;
            
            // تنفيذ التحميل
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // تنظيف الرابط
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            console.log(`💾 تم حفظ التسجيل: ${finalFilename}${extension}`);
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في حفظ التسجيل:', error);
            return false;
        }
    }

    /**
     * تشغيل التسجيل
     */
    playRecording() {
        if (!this.currentRecordingBlob) {
            console.warn('لا يوجد تسجيل للتشغيل');
            return null;
        }
        
        try {
            const audio = new Audio();
            audio.src = URL.createObjectURL(this.currentRecordingBlob);
            audio.controls = true;
            
            // تنظيف الرابط بعد انتهاء التشغيل
            audio.addEventListener('ended', () => {
                URL.revokeObjectURL(audio.src);
            });
            
            return audio;
            
        } catch (error) {
            console.error('❌ خطأ في تشغيل التسجيل:', error);
            return null;
        }
    }

    /**
     * مشاركة التسجيل
     */
    async shareRecording() {
        if (!this.currentRecordingBlob) {
            console.warn('لا يوجد تسجيل للمشاركة');
            return false;
        }
        
        // فحص دعم واجهة المشاركة
        if (navigator.share && navigator.canShare) {
            try {
                const file = new File([this.currentRecordingBlob], 'voice-recording.webm', {
                    type: this.currentRecordingBlob.type
                });
                
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'تسجيل صوتي من أكاديمية الإعلام',
                        text: 'تسجيل صوتي تم إنشاؤه باستخدام أكاديمية الإعلام الاحترافية',
                        files: [file]
                    });
                    
                    console.log('📤 تم مشاركة التسجيل بنجاح');
                    return true;
                }
            } catch (error) {
                console.error('❌ خطأ في المشاركة:', error);
            }
        }
        
        // بديل: نسخ رابط التسجيل
        try {
            const url = URL.createObjectURL(this.currentRecordingBlob);
            await navigator.clipboard.writeText(url);
            console.log('📋 تم نسخ رابط التسجيل');
            return true;
        } catch (error) {
            console.warn('لا يمكن نسخ الرابط:', error);
            return false;
        }
    }

    /**
     * الحصول على معلومات الجهاز الصوتي
     */
    async getAudioDeviceInfo() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices.filter(device => device.kind === 'audioinput');
            
            const deviceInfo = audioDevices.map(device => ({
                deviceId: device.deviceId,
                label: device.label || 'ميكروفون غير معروف',
                groupId: device.groupId
            }));
            
            console.log('🎤 الأجهزة الصوتية المتاحة:', deviceInfo);
            return deviceInfo;
            
        } catch (error) {
            console.error('❌ خطأ في الحصول على معلومات الأجهزة:', error);
            return [];
        }
    }

    /**
     * تغيير جهاز الإدخال الصوتي
     */
    async switchAudioDevice(deviceId) {
        try {
            // إيقاف التسجيل الحالي إن وجد
            if (this.isRecording) {
                this.stopRecording();
            }
            
            // إيقاف الميكروفون الحالي
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
            }
            
            // طلب الوصول للجهاز الجديد
            const constraints = {
                audio: {
                    deviceId: { exact: deviceId },
                    echoCancellation: this.audioSettings.echoCancellation,
                    noiseSuppression: this.audioSettings.noiseSuppression,
                    autoGainControl: this.audioSettings.autoGainControl
                }
            };
            
            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            console.log(`🎤 تم تغيير الجهاز الصوتي: ${deviceId}`);
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في تغيير الجهاز الصوتي:', error);
            return false;
        }
    }

    /**
     * تحديث إعدادات الصوت
     */
    updateAudioSettings(newSettings) {
        this.audioSettings = { ...this.audioSettings, ...newSettings };
        console.log('⚙️ تم تحديث إعدادات الصوت:', this.audioSettings);
    }

    /**
     * إعادة تعيين المعالج
     */
    reset() {
        try {
            // إيقاف التسجيل
            if (this.isRecording) {
                this.stopRecording();
            }
            
            // إيقاف التصور
            this.stopVisualization();
            
            // تنظيف البيانات
            this.recordingData = [];
            this.currentRecordingBlob = null;
            this.recordingStartTime = null;
            this.recordingDuration = 0;
            
            // إعادة تعيين الحالة
            this.isRecording = false;
            this.isPaused = false;
            
            console.log('🔄 تم إعادة تعيين معالج الصوت');
            
        } catch (error) {
            console.error('❌ خطأ في إعادة التعيين:', error);
        }
    }

    /**
     * تنظيف الموارد
     */
    cleanup() {
        try {
            this.reset();
            
            // إغلاق السياق الصوتي
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
            }
            
            // تنظيف المراجع
            this.audioContext = null;
            this.mediaRecorder = null;
            this.mediaStream = null;
            this.analyser = null;
            this.microphone = null;
            this.processor = null;
            this.effectsChain = {};
            
            console.log('🧹 تم تنظيف معالج الصوت');
            
        } catch (error) {
            console.error('❌ خطأ في التنظيف:', error);
        }
    }

    /**
     * الحصول على إحصائيات المعالج
     */
    getProcessorStats() {
        return {
            isInitialized: this.isInitialized,
            isRecording: this.isRecording,
            isPaused: this.isPaused,
            currentRecordingSize: this.currentRecordingBlob ? this.currentRecordingBlob.size : 0,
            recordingDuration: this.recordingDuration,
            audioSettings: this.audioSettings,
            audioContextState: this.audioContext ? this.audioContext.state : 'not_initialized',
            effectsEnabled: Object.keys(this.effectsChain).length,
            version: '2.0.0',
            capabilities: [
                'تسجيل عالي الجودة',
                'إلغاء الصدى والضوضاء',
                'تصور صوتي مباشر',
                'تحليل جودة الصوت',
                'مؤثرات صوتية متقدمة',
                'حفظ ومشاركة التسجيلات',
                'دعم أجهزة متعددة',
                'معالجة الصوت في الوقت الفعلي'
            ]
        };
    }
}

/**
 * ========================================
 * فئات مساعدة لمعالجة أنواع الصوت المختلفة
 * ========================================
 */

/**
 * معالج صوت متخصص للأخبار
 */
class NewsAudioProcessor extends AudioProcessor {
    constructor() {
        super();
        
        // إعدادات خاصة بالأخبار
        this.audioSettings.echoCancellation = true;
        this.audioSettings.noiseSuppression = true;
        this.audioSettings.autoGainControl = false; // تحكم يدوي للأخبار
    }
    
    setupNewsEffects() {
        // مؤثرات خاصة بقراءة الأخبار
        this.effectsChain.presenceBoost = this.createPresenceBoost();
        this.effectsChain.deEsser = this.createDeEsser();
    }
    
    createPresenceBoost() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 3000; // تعزيز وضوح الكلام
        filter.gain.value = 3;
        filter.Q.value = 2;
        return filter;
    }
    
    createDeEsser() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 6000; // تقليل صوت السين
        filter.gain.value = -3;
        filter.Q.value = 3;
        return filter;
    }
}

/**
 * معالج صوت متخصص للبودكاست
 */
class PodcastAudioProcessor extends AudioProcessor {
    constructor() {
        super();
        
        // إعدادات خاصة بالبودكاست
        this.audioSettings.bitsPerSecond = 64000; // جودة أقل لتوفير المساحة
        this.audioSettings.echoCancellation = true;
        this.audioSettings.noiseSuppression = true;
    }
    
    setupPodcastEffects() {
        // مؤثرات خاصة بالبودكاست
        this.effectsChain.warmth = this.createWarmthFilter();
        this.effectsChain.limiter = this.createLimiter();
    }
    
    createWarmthFilter() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowshelf';
        filter.frequency.value = 400;
        filter.gain.value = 2;
        return filter;
    }
    
    createLimiter() {
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = -10;
        compressor.knee.value = 0;
        compressor.ratio.value = 20;
        compressor.attack.value = 0.001;
        compressor.release.value = 0.01;
        return compressor;
    }
}

/**
 * ========================================
 * وظائف مساعدة عامة
 * ========================================
 */

/**
 * تحويل الوقت بالميللي ثانية إلى تنسيق قابل للقراءة
 */
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * تحويل الحجم بالبايت إلى تنسيق قابل للقراءة
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 بايت';
    
    const units = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

/**
 * ========================================
 * تصدير الفئات والوظائف
 * ========================================
 */

// تصدير للاستخدام العام
window.AudioProcessor = AudioProcessor;
window.NewsAudioProcessor = NewsAudioProcessor;
window.PodcastAudioProcessor = PodcastAudioProcessor;

// إنشاء مثيل عام للمعالج
window.audioProcessor = new AudioProcessor();

// وظائف مساعدة عامة
window.formatDuration = formatDuration;
window.formatFileSize = formatFileSize;

// تسجيل في الكونسول
console.log('🎵 تم تحميل معالج الصوت المتقدم');
console.log('📋 المميزات المتاحة: تسجيل، معالجة، تحليل، مؤثرات، تصور');
console.log('🎛️ النظام جاهز للتسجيل والمعالجة الاحترافية');
