/**
 * ========================================
 * نظام التدريب المتكامل - أكاديمية الإعلام
 * Integrated Training System - Voice Academy
 * ========================================
 */

// متغيرات النظام
let trainingSystem = null;
let currentExercise = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

/**
 * فئة نظام التدريب
 */
class TrainingSystem {
    constructor() {
        this.exercises = {};
        this.currentSession = null;
        this.userProgress = {};
        this.audioContext = null;
        this.init();
    }

    /**
     * تهيئة النظام
     */
    async init() {
        try {
            console.log('🏋️ تهيئة نظام التدريب...');
            
            // تحميل التمارين
            await this.loadExercises();
            
            // تهيئة الصوت
            await this.initAudio();
            
            console.log('✅ تم تهيئة نظام التدريب بنجاح');
        } catch (error) {
            console.error('❌ خطأ في تهيئة نظام التدريب:', error);
        }
    }

    /**
     * تحميل التمارين
     */
    async loadExercises() {
        this.exercises = {
            breathing: {
                id: 'breathing',
                name: 'تمارين التنفس',
                description: 'تمارين لتحسين التحكم في التنفس والصوت',
                difficulty: 'easy',
                duration: 10,
                steps: [
                    'اجلس بوضعية مستقيمة ومريحة',
                    'ضع يدك على صدرك والأخرى على بطنك',
                    'تنفس ببطء من الأنف لمدة 4 ثوانٍ',
                    'احبس النفس لمدة 7 ثوانٍ',
                    'أخرج الهواء من الفم لمدة 8 ثوانٍ',
                    'كرر التمرين 5 مرات'
                ],
                tips: [
                    'تأكد من أن البطن يرتفع أكثر من الصدر',
                    'لا تجهد نفسك في البداية',
                    'التنفس يجب أن يكون هادئاً ومنتظماً'
                ]
            },
            pronunciation: {
                id: 'pronunciation',
                name: 'تمارين النطق',
                description: 'تحسين وضوح النطق ومخارج الحروف',
                difficulty: 'medium',
                duration: 15,
                texts: [
                    'خالد خرج خميس من خلف خزانة خشبية خضراء',
                    'سبعة سمك سمين سبحوا في سبعة سنين',
                    'قال قاسم لقيس: قم قبل قدوم قطار قريب',
                    'بطة بيضاء في بئر بعيد بكت ببكاء بليغ',
                    'ثلاثة ثيران ثقيلة ثرثرت ثم ثارت'
                ],
                tips: [
                    'انطق كل حرف بوضوح',
                    'لا تتسرع في القراءة',
                    'استخدم المرآة لمراقبة حركة شفتيك'
                ]
            },
            expression: {
                id: 'expression',
                name: 'تمارين التعبير',
                description: 'تطوير القدرة على التعبير العاطفي بالصوت',
                difficulty: 'medium',
                duration: 20,
                scenarios: [
                    {
                        text: 'مرحباً بكم في برنامج الأخبار المسائي',
                        emotion: 'formal',
                        description: 'اقرأ بنبرة رسمية ومهنية'
                    },
                    {
                        text: 'كان يا ما كان في قديم الزمان...',
                        emotion: 'storytelling',
                        description: 'اقرأ كأنك تحكي قصة للأطفال'
                    },
                    {
                        text: 'وأخيراً حقق فريقنا الفوز المنتظر!',
                        emotion: 'excited',
                        description: 'اقرأ بحماس وفرحة'
                    },
                    {
                        text: 'نعتذر لكم عن هذا التأخير غير المتوقع',
                        emotion: 'apologetic',
                        description: 'اقرأ بنبرة اعتذار صادقة'
                    }
                ],
                tips: [
                    'استشعر المشاعر قبل القراءة',
                    'غير نبرة صوتك حسب السياق',
                    'استخدم الوقفات للتأثير'
                ]
            },
            confidence: {
                id: 'confidence',
                name: 'تمارين الثقة',
                description: 'بناء الثقة بالنفس والتغلب على الخوف',
                difficulty: 'medium',
                duration: 15,
                activities: [
                    {
                        name: 'العرض التقديمي',
                        text: 'قدم نفسك في دقيقتين كما لو كنت في مقابلة عمل',
                        duration: 120
                    },
                    {
                        name: 'الإعلان التجاري',
                        text: 'اعمل إعلاناً لمنتج تحبه في 30 ثانية',
                        duration: 30
                    },
                    {
                        name: 'النشرة الإخبارية',
                        text: 'اقرأ خبراً مهماً كمذيع محترف',
                        duration: 60
                    }
                ],
                tips: [
                    'انظر للكاميرا (أو المرآة) مباشرة',
                    'حافظ على وضعية الجسم المستقيمة',
                    'تكلم بوضوح وثقة'
                ]
            },
            advanced: {
                id: 'advanced',
                name: 'التحدي المتقدم',
                description: 'تمرين شامل لجميع المهارات',
                difficulty: 'hard',
                duration: 30,
                challenge: {
                    title: 'تقديم برنامج إذاعي',
                    description: 'قدم برنامجاً إذاعياً لمدة 3 دقائق يتضمن:',
                    requirements: [
                        'مقدمة ترحيبية (30 ثانية)',
                        'قراءة خبر مهم (60 ثانية)',
                        'فقرة تفاعلية (60 ثانية)',
                        'خاتمة وشكر (30 ثانية)'
                    ],
                    criteria: [
                        'وضوح النطق',
                        'تنويع النبرة',
                        'الثقة والحضور',
                        'الانسجام والتدفق'
                    ]
                },
                tips: [
                    'حضّر النص مسبقاً',
                    'تدرب على التوقيتات',
                    'استخدم تقنيات التنفس'
                ]
            }
        };
    }

    /**
     * تهيئة الصوت
     */
    async initAudio() {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('🎤 تم تهيئة الميكروفون بنجاح');
                
                // إيقاف التسجيل المؤقت
                stream.getTracks().forEach(track => track.stop());
                return true;
            }
        } catch (error) {
            console.warn('⚠️ لا يمكن الوصول للميكروفون:', error);
            return false;
        }
    }

    /**
     * بدء تمرين
     */
    async startExercise(exerciseId) {
        try {
            const exercise = this.exercises[exerciseId];
            if (!exercise) {
                throw new Error('تمرين غير موجود');
            }

            currentExercise = exercise;
            this.currentSession = {
                exerciseId: exerciseId,
                startTime: Date.now(),
                steps: [],
                recordings: []
            };

            console.log(`🎯 بدء تمرين: ${exercise.name}`);
            
            // عرض واجهة التمرين
            this.showExerciseInterface(exercise);
            
            return true;
        } catch (error) {
            console.error('❌ خطأ في بدء التمرين:', error);
            this.showError('لا يمكن بدء التمرين الآن');
            return false;
        }
    }

    /**
     * عرض واجهة التمرين
     */
    showExerciseInterface(exercise) {
        const content = this.createExerciseContent(exercise);
        
        // إنشاء نافذة التمرين
        const modal = document.createElement('div');
        modal.className = 'exercise-modal';
        modal.innerHTML = `
            <div class="exercise-container">
                <div class="exercise-header">
                    <h2><i class="fas fa-dumbbell"></i> ${exercise.name}</h2>
                    <button class="close-btn" onclick="trainingSystem.closeExercise()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="exercise-content">
                    ${content}
                </div>
            </div>
        `;

        // إضافة الأنماط
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const container = modal.querySelector('.exercise-container');
        container.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 2rem;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(modal);
    }

    /**
     * إنشاء محتوى التمرين
     */
    createExerciseContent(exercise) {
        switch (exercise.id) {
            case 'breathing':
                return this.createBreathingExercise(exercise);
            case 'pronunciation':
                return this.createPronunciationExercise(exercise);
            case 'expression':
                return this.createExpressionExercise(exercise);
            case 'confidence':
                return this.createConfidenceExercise(exercise);
            case 'advanced':
                return this.createAdvancedExercise(exercise);
            default:
                return this.createGenericExercise(exercise);
        }
    }

    /**
     * تمرين التنفس
     */
    createBreathingExercise(exercise) {
        return `
            <div class="breathing-exercise">
                <div class="exercise-description">
                    <p>${exercise.description}</p>
                    <p><strong>المدة:</strong> ${exercise.duration} دقائق</p>
                </div>
                
                <div class="breathing-guide">
                    <div class="breathing-circle" id="breathingCircle">
                        <span id="breathingText">استعد</span>
                    </div>
                </div>
                
                <div class="exercise-steps">
                    <h3>الخطوات:</h3>
                    <ol>
                        ${exercise.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                
                <div class="exercise-tips">
                    <h3>نصائح:</h3>
                    <ul>
                        ${exercise.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="exercise-controls">
                    <button class="btn-primary" onclick="trainingSystem.startBreathingGuide()">
                        <i class="fas fa-play"></i> بدء التمرين
                    </button>
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال
                    </button>
                </div>
            </div>
            
            <style>
                .breathing-guide {
                    text-align: center;
                    margin: 2rem 0;
                }
                .breathing-circle {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto;
                    color: white;
                    font-size: 1.2rem;
                    font-weight: bold;
                    transition: transform 0.3s ease;
                }
                .breathing-circle.inhale {
                    transform: scale(1.3);
                }
                .breathing-circle.exhale {
                    transform: scale(0.8);
                }
            </style>
        `;
    }

    /**
     * تمرين النطق
     */
    createPronunciationExercise(exercise) {
        return `
            <div class="pronunciation-exercise">
                <div class="exercise-description">
                    <p>${exercise.description}</p>
                    <p><strong>المدة:</strong> ${exercise.duration} دقائق</p>
                </div>
                
                <div class="pronunciation-texts">
                    <h3>النصوص للتدريب:</h3>
                    <div id="pronunciationTexts">
                        ${exercise.texts.map((text, index) => `
                            <div class="text-item" data-index="${index}">
                                <div class="text-content">${text}</div>
                                <div class="text-controls">
                                    <button class="btn-small btn-primary" onclick="trainingSystem.practiceText(${index})">
                                        <i class="fas fa-microphone"></i> تسجيل
                                    </button>
                                    <button class="btn-small btn-secondary" onclick="trainingSystem.playback(${index})">
                                        <i class="fas fa-play"></i> تشغيل
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="exercise-tips">
                    <h3>نصائح:</h3>
                    <ul>
                        ${exercise.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="exercise-controls">
                    <button class="btn-primary" onclick="trainingSystem.startRecording()">
                        <i class="fas fa-microphone"></i> بدء التسجيل
                    </button>
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال
                    </button>
                </div>
            </div>
            
            <style>
                .text-item {
                    background: #f8f9fa;
                    padding: 1rem;
                    margin: 1rem 0;
                    border-radius: 8px;
                    border-left: 4px solid #667eea;
                }
                .text-content {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }
                .text-controls {
                    display: flex;
                    gap: 0.5rem;
                }
                .btn-small {
                    padding: 0.5rem 1rem;
                    font-size: 0.9rem;
                }
            </style>
        `;
    }

    /**
     * تمرين التعبير
     */
    createExpressionExercise(exercise) {
        return `
            <div class="expression-exercise">
                <div class="exercise-description">
                    <p>${exercise.description}</p>
                    <p><strong>المدة:</strong> ${exercise.duration} دقائق</p>
                </div>
                
                <div class="expression-scenarios">
                    <h3>السيناريوهات:</h3>
                    <div id="expressionScenarios">
                        ${exercise.scenarios.map((scenario, index) => `
                            <div class="scenario-item" data-index="${index}">
                                <div class="scenario-text">"${scenario.text}"</div>
                                <div class="scenario-emotion">
                                    <strong>النبرة:</strong> ${scenario.description}
                                </div>
                                <div class="scenario-controls">
                                    <button class="btn-small btn-primary" onclick="trainingSystem.practiceScenario(${index})">
                                        <i class="fas fa-microphone"></i> تسجيل
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="exercise-tips">
                    <h3>نصائح:</h3>
                    <ul>
                        ${exercise.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="exercise-controls">
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال
                    </button>
                </div>
            </div>
            
            <style>
                .scenario-item {
                    background: #f8f9fa;
                    padding: 1.5rem;
                    margin: 1rem 0;
                    border-radius: 12px;
                    border: 2px solid #e9ecef;
                    transition: all 0.3s ease;
                }
                .scenario-item:hover {
                    border-color: #667eea;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
                }
                .scenario-text {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #2c3e50;
                }
                .scenario-emotion {
                    color: #667eea;
                    margin-bottom: 1rem;
                }
            </style>
        `;
    }

    /**
     * تمرين الثقة
     */
    createConfidenceExercise(exercise) {
        return `
            <div class="confidence-exercise">
                <div class="exercise-description">
                    <p>${exercise.description}</p>
                    <p><strong>المدة:</strong> ${exercise.duration} دقائق</p>
                </div>
                
                <div class="confidence-activities">
                    <h3>الأنشطة:</h3>
                    <div id="confidenceActivities">
                        ${exercise.activities.map((activity, index) => `
                            <div class="activity-item" data-index="${index}">
                                <h4>${activity.name}</h4>
                                <p>${activity.text}</p>
                                <div class="activity-duration">
                                    <strong>المدة المطلوبة:</strong> ${activity.duration} ثانية
                                </div>
                                <div class="activity-controls">
                                    <button class="btn-primary" onclick="trainingSystem.startConfidenceActivity(${index})">
                                        <i class="fas fa-video"></i> بدء النشاط
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="exercise-tips">
                    <h3>نصائح:</h3>
                    <ul>
                        ${exercise.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="exercise-controls">
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال
                    </button>
                </div>
            </div>
            
            <style>
                .activity-item {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1.5rem;
                    margin: 1rem 0;
                    border-radius: 15px;
                    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
                }
                .activity-item h4 {
                    margin-bottom: 1rem;
                    font-size: 1.3rem;
                }
                .activity-duration {
                    background: rgba(255,255,255,0.2);
                    padding: 0.5rem;
                    border-radius: 5px;
                    margin: 1rem 0;
                }
            </style>
        `;
    }

    /**
     * التمرين المتقدم
     */
    createAdvancedExercise(exercise) {
        return `
            <div class="advanced-exercise">
                <div class="exercise-description">
                    <p>${exercise.description}</p>
                    <p><strong>المدة:</strong> ${exercise.duration} دقائق</p>
                </div>
                
                <div class="challenge-details">
                    <h3>${exercise.challenge.title}</h3>
                    <p>${exercise.challenge.description}</p>
                    
                    <div class="requirements">
                        <h4>المتطلبات:</h4>
                        <ul>
                            ${exercise.challenge.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="criteria">
                        <h4>معايير التقييم:</h4>
                        <ul>
                            ${exercise.challenge.criteria.map(criterion => `<li>${criterion}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="challenge-timer">
                    <div class="timer-display" id="challengeTimer">03:00</div>
                    <div class="timer-controls">
                        <button class="btn-primary" onclick="trainingSystem.startChallenge()">
                            <i class="fas fa-play"></i> بدء التحدي
                        </button>
                        <button class="btn-danger" onclick="trainingSystem.stopChallenge()">
                            <i class="fas fa-stop"></i> إيقاف
                        </button>
                    </div>
                </div>
                
                <div class="exercise-tips">
                    <h3>نصائح:</h3>
                    <ul>
                        ${exercise.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="exercise-controls">
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال
                    </button>
                </div>
            </div>
            
            <style>
                .challenge-details {
                    background: #f8f9fa;
                    padding: 1.5rem;
                    border-radius: 10px;
                    margin: 1rem 0;
                }
                .timer-display {
                    font-size: 3rem;
                    font-weight: bold;
                    text-align: center;
                    color: #667eea;
                    margin: 1rem 0;
                }
                .timer-controls {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .requirements, .criteria {
                    margin: 1rem 0;
                }
                .requirements h4, .criteria h4 {
                    color: #667eea;
                    margin-bottom: 0.5rem;
                }
            </style>
        `;
    }

    /**
     * تمرين عام
     */
    createGenericExercise(exercise) {
        return `
            <div class="generic-exercise">
                <div class="exercise-description">
                    <p>${exercise.description}</p>
                </div>
                <div class="exercise-controls">
                    <button class="btn-primary" onclick="trainingSystem.startRecording()">
                        <i class="fas fa-microphone"></i> بدء التسجيل
                    </button>
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * بدء دليل التنفس
     */
    startBreathingGuide() {
        const circle = document.getElementById('breathingCircle');
        const text = document.getElementById('breathingText');
        let phase = 0; // 0: inhale, 1: hold, 2: exhale
        let count = 0;
        let cycle = 0;
        const maxCycles = 5;

        const breathingCycle = () => {
            if (cycle >= maxCycles) {
                text.textContent = 'انتهى التمرين!';
                circle.className = 'breathing-circle';
                return;
            }

            switch (phase) {
                case 0: // Inhale
                    text.textContent = `شهيق (${4 - count})`;
                    circle.className = 'breathing-circle inhale';
                    break;
                case 1: // Hold
                    text.textContent = `احبس (${7 - count})`;
                    break;
                case 2: // Exhale
                    text.textContent = `زفير (${8 - count})`;
                    circle.className = 'breathing-circle exhale';
                    break;
            }

            count++;
            
            if ((phase === 0 && count > 4) || (phase === 1 && count > 7) || (phase === 2 && count > 8)) {
                phase = (phase + 1) % 3;
                count = 0;
                if (phase === 0) {
                    cycle++;
                    if (cycle < maxCycles) {
                        text.textContent = `الدورة ${cycle + 1} من ${maxCycles}`;
                    }
                }
            }

            if (cycle < maxCycles) {
                setTimeout(breathingCycle, 1000);
            }
        };

        text.textContent = 'استعد...';
        setTimeout(() => {
            breathingCycle();
        }, 2000);
    }

    /**
     * بدء التسجيل
     */
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                this.processRecording(audioBlob);
            };
            
            mediaRecorder.start();
            isRecording = true;
            
            // تحديث واجهة المستخدم
            this.updateRecordingUI(true);
            
            console.log('🎤 بدء التسجيل...');
            
        } catch (error) {
            console.error('❌ خطأ في بدء التسجيل:', error);
            this.showError('لا يمكن الوصول للميكروفون');
        }
    }

    /**
     * إيقاف التسجيل
     */
    stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            isRecording = false;
            
            // تحديث واجهة المستخدم
            this.updateRecordingUI(false);
            
            console.log('⏹️ تم إيقاف التسجيل');
        }
    }

    /**
     * تحديث واجهة التسجيل
     */
    updateRecordingUI(recording) {
        const buttons = document.querySelectorAll('.exercise-controls button');
        buttons.forEach(button => {
            if (button.textContent.includes('تسجيل') || button.textContent.includes('بدء')) {
                if (recording) {
                    button.innerHTML = '<i class="fas fa-stop"></i> إيقاف التسجيل';
                    button.onclick = () => this.stopRecording();
                    button.className = 'btn-danger';
                } else {
                    button.innerHTML = '<i class="fas fa-microphone"></i> بدء التسجيل';
                    button.onclick = () => this.startRecording();
                    button.className = 'btn-primary';
                }
            }
        });
    }

    /**
     * معالجة التسجيل
     */
    async processRecording(audioBlob) {
        try {
            console.log('🔄 معالجة التسجيل...');
            
            // حفظ التسجيل في الجلسة
            if (this.currentSession) {
                this.currentSession.recordings.push({
                    timestamp: Date.now(),
                    duration: audioBlob.size,
                    blob: audioBlob
                });
            }
            
            // محاكاة تحليل التسجيل
            const analysisResult = await this.analyzeRecording(audioBlob);
            
            // عرض النتائج
            this.showAnalysisResults(analysisResult);
            
        } catch (error) {
            console.error('❌ خطأ في معالجة التسجيل:', error);
            this.showError('حدث خطأ في معالجة التسجيل');
        }
    }

    /**
     * تحليل التسجيل
     */
    async analyzeRecording(audioBlob) {
        // محاكاة التحليل
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
            overallScore: Math.floor(Math.random() * 30) + 70,
            scores: {
                pronunciation: Math.floor(Math.random() * 30) + 70,
                fluency: Math.floor(Math.random() * 25) + 75,
                confidence: Math.floor(Math.random() * 35) + 65,
                expression: Math.floor(Math.random() * 20) + 80
            },
            feedback: this.generateFeedback(),
            recommendations: [
                'تدرب على إبطاء سرعة الكلام قليلاً',
                'ركز على مخارج الحروف الصعبة',
                'استخدم تمارين التنفس قبل التسجيل'
            ]
        };
    }

    /**
     * توليد التغذية الراجعة
     */
    generateFeedback() {
        const feedbacks = [
            'أداء ممتاز! واصل هذا المستوى الرائع',
            'أداء جيد مع إمكانية للتحسين',
            'تحسن ملحوظ، استمر في التدريب',
            'أداء مقبول، ركز على النقاط المحددة',
            'بداية جيدة، التدريب المستمر سيحسن أداءك'
        ];
        
        return feedbacks[Math.floor(Math.random() * feedbacks.length)];
    }

    /**
     * عرض نتائج التحليل
     */
    showAnalysisResults(results) {
        const resultsHTML = `
            <div class="analysis-results">
                <div class="results-header">
                    <h3><i class="fas fa-chart-line"></i> نتائج التحليل</h3>
                    <div class="overall-score">
                        <span class="score-value">${results.overallScore}</span>
                        <span class="score-label">النتيجة الإجمالية</span>
                    </div>
                </div>
                
                <div class="detailed-scores">
                    <div class="score-item">
                        <span class="score-name">النطق</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${results.scores.pronunciation}%"></div>
                        </div>
                        <span class="score-number">${results.scores.pronunciation}%</span>
                    </div>
                    <div class="score-item">
                        <span class="score-name">الطلاقة</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${results.scores.fluency}%"></div>
                        </div>
                        <span class="score-number">${results.scores.fluency}%</span>
                    </div>
                    <div class="score-item">
                        <span class="score-name">الثقة</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${results.scores.confidence}%"></div>
                        </div>
                        <span class="score-number">${results.scores.confidence}%</span>
                    </div>
                    <div class="score-item">
                        <span class="score-name">التعبير</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${results.scores.expression}%"></div>
                        </div>
                        <span class="score-number">${results.scores.expression}%</span>
                    </div>
                </div>
                
                <div class="feedback-section">
                    <h4>التغذية الراجعة:</h4>
                    <p class="feedback-text">${results.feedback}</p>
                </div>
                
                <div class="recommendations-section">
                    <h4>التوصيات:</h4>
                    <ul>
                        ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="results-actions">
                    <button class="btn-primary" onclick="trainingSystem.tryAgain()">
                        <i class="fas fa-redo"></i> جرب مرة أخرى
                    </button>
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال التمرين
                    </button>
                </div>
            </div>
            
            <style>
                .analysis-results {
                    background: #f8f9fa;
                    padding: 2rem;
                    border-radius: 15px;
                    margin: 1rem 0;
                }
                .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .overall-score {
                    text-align: center;
                }
                .score-value {
                    display: block;
                    font-size: 3rem;
                    font-weight: bold;
                    color: #667eea;
                }
                .score-label {
                    display: block;
                    font-size: 0.9rem;
                    color: #666;
                }
                .score-item {
                    display: flex;
                    align-items: center;
                    margin: 1rem 0;
                    gap: 1rem;
                }
                .score-name {
                    width: 80px;
                    font-weight: 600;
                }
                .score-bar {
                    flex: 1;
                    height: 20px;
                    background: #e9ecef;
                    border-radius: 10px;
                    overflow: hidden;
                }
                .score-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    transition: width 1s ease;
                }
                .score-number {
                    width: 50px;
                    text-align: right;
                    font-weight: bold;
                    color: #667eea;
                }
                .feedback-section, .recommendations-section {
                    margin: 1.5rem 0;
                }
                .feedback-text {
                    background: #e3f2fd;
                    padding: 1rem;
                    border-radius: 8px;
                    border-left: 4px solid #2196F3;
                }
                .results-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                }
            </style>
        `;
        
        // استبدال محتوى التمرين بالنتائج
        const exerciseContent = document.querySelector('.exercise-content');
        if (exerciseContent) {
            exerciseContent.innerHTML = resultsHTML;
        }
    }

    /**
     * إعادة المحاولة
     */
    tryAgain() {
        if (currentExercise) {
            this.showExerciseInterface(currentExercise);
        }
    }

    /**
     * إكمال التمرين
     */
    completeExercise() {
        try {
            if (this.currentSession) {
                this.currentSession.endTime = Date.now();
                this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
                
                // حفظ التقدم
                this.saveProgress();
                
                // تحديث نقاط المستخدم
                this.updateUserPoints();
            }
            
            // إغلاق التمرين
            this.closeExercise();
            
            // عرض رسالة النجاح
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('❌ خطأ في إكمال التمرين:', error);
        }
    }

    /**
     * حفظ التقدم
     */
    saveProgress() {
        if (!this.currentSession) return;
        
        const progressKey = `exercise_${this.currentSession.exerciseId}`;
        const progress = {
            completed: true,
            completedAt: Date.now(),
            duration: this.currentSession.duration,
            recordings: this.currentSession.recordings.length
        };
        
        localStorage.setItem(progressKey, JSON.stringify(progress));
        console.log('💾 تم حفظ تقدم التمرين');
    }

    /**
     * تحديث نقاط المستخدم
     */
    updateUserPoints() {
        if (window.voiceAcademy && window.voiceAcademy.currentUser) {
            const points = this.calculatePoints();
            window.voiceAcademy.currentUser.profile.xp += points;
            window.voiceAcademy.currentUser.statistics.exercisesCompleted++;
            window.voiceAcademy.updateAllUI();
            window.voiceAcademy.saveUserData();
        }
    }

    /**
     * حساب النقاط
     */
    calculatePoints() {
        if (!this.currentSession) return 0;
        
        const basePoints = 10;
        const difficultyMultiplier = {
            'easy': 1,
            'medium': 1.5,
            'hard': 2
        };
        
        const exercise = this.exercises[this.currentSession.exerciseId];
        const multiplier = difficultyMultiplier[exercise.difficulty] || 1;
        
        return Math.round(basePoints * multiplier);
    }

    /**
     * عرض رسالة النجاح
     */
    showSuccessMessage() {
        const points = this.calculatePoints();
        const message = `تهانينا! لقد أكملت التمرين بنجاح وحصلت على ${points} نقطة! 🎉`;
        
        if (window.voiceAcademy) {
            window.voiceAcademy.showNotification(message, 'success', 7000);
        } else {
            alert(message);
        }
    }

    /**
     * إغلاق التمرين
     */
    closeExercise() {
        // إيقاف أي تسجيل جاري
        if (isRecording) {
            this.stopRecording();
        }
        
        // إزالة النافذة
        const modal = document.querySelector('.exercise-modal');
        if (modal) {
            modal.remove();
        }
        
        // تنظيف المتغيرات
        currentExercise = null;
        this.currentSession = null;
        
        console.log('✅ تم إغلاق التمرين');
    }

    /**
     * عرض خطأ
     */
    showError(message) {
        if (window.voiceAcademy) {
            window.voiceAcademy.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    /**
     * الحصول على إحصائيات التدريب
     */
    getTrainingStats() {
        const stats = {
            totalExercises: Object.keys(this.exercises).length,
            completedExercises: 0,
            totalTime: 0,
            averageScore: 0
        };
        
        // حساب التمارين المكتملة
        Object.keys(this.exercises).forEach(exerciseId => {
            const progress = localStorage.getItem(`exercise_${exerciseId}`);
            if (progress) {
                const data = JSON.parse(progress);
                if (data.completed) {
                    stats.completedExercises++;
                    stats.totalTime += data.duration || 0;
                }
            }
        });
        
        return stats;
    }
}

/**
 * ========================================
 * وظائف مساعدة عامة
 * ========================================
 */

/**
 * تهيئة نظام التدريب
 */
async function initializeTrainingSystem() {
    if (!trainingSystem) {
        trainingSystem = new TrainingSystem();
    }
    return trainingSystem;
}

/**
 * بدء تمرين معين
 */
async function startTrainingExercise(exerciseId) {
    if (!trainingSystem) {
        await initializeTrainingSystem();
    }
    return trainingSystem.startExercise(exerciseId);
}

/**
 * الحصول على قائمة التمارين
 */
function getAvailableExercises() {
    if (!trainingSystem) {
        return {};
    }
    return trainingSystem.exercises;
}

/**
 * ========================================
 * تصدير للنطاق العام
 * ========================================
 */

// تصدير للنطاق العام
if (typeof window !== 'undefined') {
    window.TrainingSystem = TrainingSystem;
    window.initializeTrainingSystem = initializeTrainingSystem;
    window.startTrainingExercise = startTrainingExercise;
    window.getAvailableExercises = getAvailableExercises;
    window.trainingSystem = trainingSystem;
    
    // تهيئة تلقائية عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
        initializeTrainingSystem();
    });
}

// تصدير للـ Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TrainingSystem,
        initializeTrainingSystem,
        startTrainingExercise,
        getAvailableExercises
    };
}
