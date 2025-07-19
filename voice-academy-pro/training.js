.requirements ul, .criteria ul {
                    padding-right: 1.5rem;
                    line-height: 1.8;
                }
                .requirements li, .criteria li {
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
                    <p><strong>المدة:</strong> ${exercise.duration} دقائق</p>
                    <p><strong>المستوى:</strong> ${this.getDifficultyText(exercise.difficulty)}</p>
                </div>
                <div class="exercise-controls">
                    <button class="btn-primary" onclick="trainingSystem.startRecording()">
                        <i class="fas fa-microphone"></i> بدء التسجيل
                    </button>
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال التمرين
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * الحصول على نص الصعوبة
     */
    getDifficultyText(difficulty) {
        const difficulties = {
            'easy': 'سهل',
            'medium': 'متوسط',
            'hard': 'صعب'
        };
        return difficulties[difficulty] || 'غير محدد';
    }

    /**
     * بدء دليل التنفس
     */
    startBreathingGuide() {
        const circle = document.getElementById('breathingCircle');
        const text = document.getElementById('breathingText');
        
        if (!circle || !text) {
            console.error('عناصر دليل التنفس غير موجودة');
            return;
        }

        let phase = 0; // 0: inhale, 1: hold, 2: exhale
        let count = 0;
        let cycle = 0;
        const maxCycles = 5;

        const breathingCycle = () => {
            if (cycle >= maxCycles) {
                text.textContent = 'ممتاز! انتهى التمرين';
                circle.className = 'breathing-circle';
                setTimeout(() => {
                    this.showCompletionMessage();
                }, 2000);
                return;
            }

            switch (phase) {
                case 0: // Inhale
                    text.textContent = `شهيق (${4 - count})`;
                    circle.className = 'breathing-circle inhale';
                    break;
                case 1: // Hold
                    text.textContent = `احبس النفس (${7 - count})`;
                    circle.className = 'breathing-circle';
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
                        setTimeout(() => {
                            text.textContent = `الدورة ${cycle + 1} من ${maxCycles}`;
                        }, 500);
                    }
                }
            }

            if (cycle < maxCycles) {
                setTimeout(breathingCycle, 1000);
            }
        };

        text.textContent = 'استعد... سنبدأ خلال 3 ثوانٍ';
        setTimeout(() => {
            text.textContent = 'ابدأ الآن';
            setTimeout(breathingCycle, 1000);
        }, 3000);
    }

    /**
     * بدء التسجيل
     */
    async startRecording() {
        try {
            if (isRecording) {
                console.warn('التسجيل قيد التشغيل بالفعل');
                return false;
            }

            recordingStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });

            mediaRecorder = new MediaRecorder(recordingStream, {
                mimeType: this.getSupportedMimeType()
            });

            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { 
                    type: this.getSupportedMimeType() 
                });
                await this.processRecording(audioBlob);
            };
            
            mediaRecorder.onerror = (event) => {
                console.error('خطأ في التسجيل:', event.error);
                this.showError('حدث خطأ أثناء التسجيل');
                this.cleanup();
            };
            
            mediaRecorder.start(1000); // تسجيل كل ثانية
            isRecording = true;
            
            this.updateRecordingUI(true);
            console.log('🎤 بدء التسجيل...');
            
            return true;
        } catch (error) {
            console.error('❌ خطأ في بدء التسجيل:', error);
            this.showError('لا يمكن الوصول للميكروفون. تأكد من منح الإذن.');
            return false;
        }
    }

    /**
     * بدء التسجيل لنص معين
     */
    async startRecordingForText(textIndex) {
        const success = await this.startRecording();
        if (success) {
            // تحديث واجهة النص المحدد
            const textItem = document.querySelector(`[data-index="${textIndex}"]`);
            if (textItem) {
                textItem.style.borderColor = '#f44336';
                textItem.style.backgroundColor = '#fff3e0';
            }
        }
    }

    /**
     * إيقاف التسجيل
     */
    stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            this.cleanup();
            this.updateRecordingUI(false);
            console.log('⏹️ تم إيقاف التسجيل');
            return true;
        }
        return false;
    }

    /**
     * تنظيف موارد التسجيل
     */
    cleanup() {
        if (recordingStream) {
            recordingStream.getTracks().forEach(track => track.stop());
            recordingStream = null;
        }
        isRecording = false;
        mediaRecorder = null;
    }

    /**
     * تحديث واجهة التسجيل
     */
    updateRecordingUI(recording) {
        const recordingStatus = document.getElementById('recordingStatus');
        
        if (recordingStatus) {
            recordingStatus.style.display = recording ? 'flex' : 'none';
        }

        // إعادة تعيين ألوان النصوص
        if (!recording) {
            document.querySelectorAll('.text-item').forEach(item => {
                item.style.borderColor = 'transparent';
                item.style.backgroundColor = '#f8f9fa';
            });
        }
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
            
            // عرض رسالة نجاح
            this.showNotification('تم حفظ التسجيل بنجاح! 🎉', 'success');
            
            // محاكاة تحليل التسجيل
            setTimeout(async () => {
                const analysisResult = await this.analyzeRecording(audioBlob);
                this.showAnalysisResults(analysisResult);
            }, 1000);
            
        } catch (error) {
            console.error('❌ خطأ في معالجة التسجيل:', error);
            this.showError('حدث خطأ في معالجة التسجيل');
        }
    }

    /**
     * تحليل التسجيل (محاكاة)
     */
    async analyzeRecording(audioBlob) {
        // محاكاة وقت التحليل
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const scores = {
            pronunciation: Math.floor(Math.random() * 30) + 70,
            fluency: Math.floor(Math.random() * 25) + 75,
            confidence: Math.floor(Math.random() * 35) + 65,
            expression: Math.floor(Math.random() * 20) + 80
        };

        const overallScore = Math.round(
            Object.values(scores).reduce((sum, score) => sum + score, 0) / 4
        );
        
        return {
            overallScore: overallScore,
            scores: scores,
            feedback: this.generateFeedback(overallScore),
            recommendations: this.generateRecommendations(scores),
            duration: Math.floor(audioBlob.size / 16000), // تقدير تقريبي
            timestamp: new Date().toISOString()
        };
    }

    /**
     * توليد التغذية الراجعة
     */
    generateFeedback(score) {
        if (score >= 90) return 'أداء ممتاز! صوتك واضح ومؤثر بشكل رائع 🌟';
        if (score >= 80) return 'أداء جيد جداً! هناك تحسن ملحوظ في مهاراتك 👏';
        if (score >= 70) return 'أداء جيد مع إمكانية للتطوير. استمر في التدريب 💪';
        if (score >= 60) return 'أداء مقبول، ركز على النقاط المحددة للتحسين 📈';
        return 'بداية جيدة! التدريب المستمر سيحسن أداءك بشكل كبير 🚀';
    }

    /**
     * توليد التوصيات
     */
    generateRecommendations(scores) {
        const recommendations = [];
        
        if (scores.pronunciation < 75) {
            recommendations.push('ركز على وضوح مخارج الحروف');
        }
        if (scores.fluency < 70) {
            recommendations.push('تدرب على انسيابية الكلام');
        }
        if (scores.confidence < 65) {
            recommendations.push('اعمل على زيادة الثقة في الصوت');
        }
        if (scores.expression < 60) {
            recommendations.push('طور مهارات التعبير العاطفي');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('أداء ممتاز! حافظ على هذا المستوى');
        }
        
        return recommendations;
    }

    /**
     * عرض نتائج التحليل
     */
    showAnalysisResults(results) {
        const resultsHTML = `
            <div class="analysis-results">
                <div class="results-header">
                    <h3><i class="fas fa-chart-line"></i> نتائج التحليل الذكي</h3>
                    <div class="overall-score">
                        <span class="score-value">${results.overallScore}</span>
                        <span class="score-label">النتيجة الإجمالية</span>
                    </div>
                </div>
                
                <div class="detailed-scores">
                    ${Object.entries(results.scores).map(([skill, score]) => {
                        const skillNames = {
                            pronunciation: 'النطق',
                            fluency: 'الطلاقة',
                            confidence: 'الثقة',
                            expression: 'التعبير'
                        };
                        return `
                            <div class="score-item">
                                <span class="score-name">${skillNames[skill]}</span>
                                <div class="score-bar">
                                    <div class="score-fill" style="width: ${score}%"></div>
                                </div>
                                <span class="score-number">${score}%</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="feedback-section">
                    <h4><i class="fas fa-comment"></i> التغذية الراجعة:</h4>
                    <p class="feedback-text">${results.feedback}</p>
                </div>
                
                <div class="recommendations-section">
                    <h4><i class="fas fa-lightbulb"></i> التوصيات:</h4>
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
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    padding: 2rem;
                    border-radius: 15px;
                    margin: 1rem 0;
                    border: 1px solid #dee2e6;
                }
                .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .results-header h3 {
                    margin: 0;
                    color: #495057;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .overall-score {
                    text-align: center;
                    background: white;
                    padding: 1rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .score-value {
                    display: block;
                    font-size: 3rem;
                    font-weight: bold;
                    color: #667eea;
                    line-height: 1;
                }
                .score-label {
                    display: block;
                    font-size: 0.9rem;
                    color: #6c757d;
                    margin-top: 0.5rem;
                }
                .detailed-scores {
                    margin: 2rem 0;
                }
                .score-item {
                    display: flex;
                    align-items: center;
                    margin: 1rem 0;
                    gap: 1rem;
                    background: white;
                    padding: 1rem;
                    border-radius: 8px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
                }
                .score-name {
                    width: 80px;
                    font-weight: 600;
                    color: #495057;
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
                    border-radius: 10px;
                }
                .score-number {
                    width: 50px;
                    text-align: right;
                    font-weight: bold;
                    color: #667eea;
                }
                .feedback-section, .recommendations-section {
                    margin: 1.5rem 0;
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
                }
                .feedback-section h4, .recommendations-section h4 {
                    color: #495057;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .feedback-text {
                    color: #495057;
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin: 0;
                }
                .recommendations-section ul {
                    margin: 0;
                    padding-right: 1.5rem;
                    line-height: 1.8;
                }
                .recommendations-section li {
                    color: #495057;
                    margin-bottom: 0.5rem;
                }
                .results-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .results-actions button {
                    min-width: 150px;
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
     * ممارسة سيناريو
     */
    async practiceScenario(scenarioIndex) {
        const scenario = currentExercise.scenarios[scenarioIndex];
        if (!scenario) return;

        this.showNotification(`جاري التحضير لتسجيل: ${scenario.emotion}`, 'info');
        
        // إعطاء المستخدم وقت للاستعداد
        setTimeout(async () => {
            await this.startRecording();
        }, 2000);
    }

    /**
     * بدء نشاط الثقة
     */
    async startConfidenceActivity(activityIndex) {
        const activity = currentExercise.activities[activityIndex];
        if (!activity) return;

        const countdownHTML = `
            <div class="activity-countdown">
                <h3>${activity.name}</h3>
                <p>${activity.text}</p>
                <div class="countdown-timer" id="countdownTimer">
                    <span id="countdownNumber">3</span>
                </div>
                <p>استعد للبدء...</p>
            </div>
            <style>
                .activity-countdown {
                    text-align: center;
                    padding: 2rem;
                }
                .countdown-timer {
                    font-size: 4rem;
                    font-weight: bold;
                    color: #667eea;
                    margin: 2rem 0;
                }
            </style>
        `;

        const exerciseContent = document.querySelector('.exercise-content');
        if (exerciseContent) {
            exerciseContent.innerHTML = countdownHTML;
        }

        // العد التنازلي
        let countdown = 3;
        const countdownElement = document.getElementById('countdownNumber');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdownElement) {
                countdownElement.textContent = countdown;
            }
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                if (countdownElement) {
                    countdownElement.textContent = 'ابدأ الآن!';
                    countdownElement.style.color = '#4CAF50';
                }
                
                setTimeout(async () => {
                    await this.startRecording();
                    // إيقاف التسجيل تلقائياً بعد المدة المحددة
                    setTimeout(() => {
                        this.stopRecording();
                    }, activity.duration * 1000);
                }, 1000);
            }
        }, 1000);
    }

    /**
     * بدء التحدي المتقدم
     */
    startChallenge() {
        const timerDisplay = document.getElementById('challengeTimer');
        const startBtn = document.querySelector('[onclick="trainingSystem.startChallenge()"]');
        const stopBtn = document.getElementById('stopChallengeBtn');
        
        if (!timerDisplay) return;

        let timeLeft = 180; // 3 دقائق
        
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'inline-flex';
        
        this.startRecording();
        
        const timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                this.stopRecording();
                this.showCompletionMessage();
                if (startBtn) startBtn.style.display = 'inline-flex';
                if (stopBtn) stopBtn.style.display = 'none';
            }
        }, 1000);

        // حفظ المؤقت للإيقاف اليدوي
        this.challengeTimer = timerInterval;
    }

    /**
     * إيقاف التحدي
     */
    stopChallenge() {
        if (this.challengeTimer) {
            clearInterval(this.challengeTimer);
            this.challengeTimer = null;
        }
        
        this.stopRecording();
        
        const startBtn = document.querySelector('[onclick="trainingSystem.startChallenge()"]');
        const stopBtn = document.getElementById('stopChallengeBtn');
        
        if (startBtn) startBtn.style.display = 'inline-flex';
        if (stopBtn) stopBtn.style.display = 'none';
        
        this.showNotification('تم إيقاف التحدي', 'info');
    }

    /**
     * إكمال التمرين
     */
    completeExercise() {
        try {
            // إيقاف أي تسجيل جاري
            if (isRecording) {
                this.stopRecording();
            }
            
            // إيقاف أي مؤقت جاري
            if (this.challengeTimer) {
                clearInterval(this.challengeTimer);
                this.challengeTimer = null;
            }
            
            if (this.currentSession) {
                this.currentSession.endTime = Date.now();
                this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
                
                // حفظ التقدم
                this.saveProgress();
                
                // تحديث نقاط المستخدم
                this.updateUserPoints();
            }
            
            // عرض رسالة النجاح
            this.showSuccessMessage();
            
            // إغلاق التمرين
            setTimeout(() => {
                this.closeExercise();
            }, 3000);
            
        } catch (error) {
            console.error('❌ خطأ في إكمال التمرين:', error);
        }
    }

    /**
     * عرض رسالة الإكمال
     */
    showCompletionMessage() {
        const completionHTML = `
            <div class="completion-message">
                <div class="completion-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>ممتاز! تم إكمال التمرين بنجاح</h3>
                <p>لقد أظهرت تقدماً رائعاً في هذا التمرين</p>
                <div class="completion-actions">
                    <button class="btn-primary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-trophy"></i> إنهاء والحصول على النقاط
                    </button>
                </div>
            </div>
            <style>
                .completion-message {
                    text-align: center;
                    padding: 3rem 2rem;
                }
                .completion-icon {
                    font-size: 4rem;
                    color: #4CAF50;
                    margin-bottom: 1rem;
                    animation: bounce 0.6s ease;
                }
                .completion-message h3 {
                    color: #4CAF50;
                    margin-bottom: 1rem;
                }
                .completion-message p {
                    color: #666;
                    margin-bottom: 2rem;
                }
                @keyframes bounce {
                    0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
                    40%, 43% { transform: translateY(-20px); }
                    70% { transform: translateY(-10px); }
                    90% { transform: translateY(-4px); }
                }
            </style>
        `;

        const exerciseContent = document.querySelector('.exercise-content');
        if (exerciseContent) {
            exerciseContent.innerHTML = completionHTML;
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
        
        try {
            localStorage.setItem(progressKey, JSON.stringify(progress));
            console.log('💾 تم حفظ تقدم التمرين');
        } catch (error) {
            console.error('خطأ في حفظ التقدم:', error);
        }
    }

    /**
     * تحديث نقاط المستخدم
     */
    updateUserPoints() {
        if (window.voiceAcademy && window.voiceAcademy.currentUser) {
            const points = this.calculatePoints();
            window.voiceAcademy.currentUser.profile.xp += points;
            window.voiceAcademy.currentUser.statistics.exercisesCompleted++;
            window.voiceAcademy.currentUser.statistics.totalSessions++;
            window.voiceAcademy.updateAllUI();
            window.voiceAcademy.saveUserData();
            
            console.log(`🏆 تم إضافة ${points} نقطة للمستخدم`);
        }
    }

    /**
     * حساب النقاط
     */
    calculatePoints() {
        if (!this.currentSession) return 0;
        
        const basePoints = 20;
        const difficultyMultiplier = {
            'easy': 1,
            'medium': 1.5,
            'hard': 2.5
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
        const exerciseName = currentExercise ? currentExercise.name : 'التمرين';
        const message = `🎉 تهانينا! لقد أكملت "${exerciseName}" بنجاح وحصلت على ${points} نقطة!`;
        
        this.showNotification(message, 'success', 5000);
    }

    /**
     * إغلاق التمرين
     */
    closeExercise() {
        // إيقاف أي تسجيل جاري
        if (isRecording) {
            this.stopRecording();
        }
        
        // إيقاف أي مؤقت جاري
        if (this.challengeTimer) {
            clearInterval(this.challengeTimer);
            this.challengeTimer = null;
        }
        
        // إزالة النافذة
        const modal = document.querySelector('.exercise-modal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modal.remove();
            }, 300);
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
        this.showNotification(message, 'error');
    }

    /**
     * عرض إشعار
     */
    showNotification(message, type = 'info', duration = 4000) {
        if (window.voiceAcademy && typeof window.voiceAcademy.showNotification === 'function') {
            window.voiceAcademy.showNotification(message, type, duration);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
            // عرض إشعار بسيط في المتصفح
            if (typeof alert !== 'undefined') {
                alert(message);
            }
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
            try {
                const progress = localStorage.getItem(`exercise_${exerciseId}`);
                if (progress) {
                    const data = JSON.parse(progress);
                    if (data.completed) {
                        stats.completedExercises++;
                        stats.totalTime += data.duration || 0;
                    }
                }
            } catch (error) {
                console.warn('خطأ في قراءة تقدم التمرين:', exerciseId);
            }
        });
        
        return stats;
    }

    /**
     * إعادة تعيين تقدم التمارين
     */
    resetProgress() {
        Object.keys(this.exercises).forEach(exerciseId => {
            localStorage.removeItem(`exercise_${exerciseId}`);
        });
        console.log('🔄 تم إعادة تعيين تقدم جميع التمارين');
    }

    /**
     * التحقق من توفر التمرين
     */
    isExerciseAvailable(exerciseId) {
        return exerciseId in this.exercises;
    }

    /**
     * الحصول على معلومات التمرين
     */
    getExerciseInfo(exerciseId) {
        return this.exercises[exerciseId] || null;
    }

    /**
     * الحصول على قائمة جميع التمارين
     */
    getAllExercises() {
        return Object.values(this.exercises);
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
    try {
        if (!trainingSystem) {
            trainingSystem = new TrainingSystem();
            
            // انتظار التهيئة
            let attempts = 0;
            while (!trainingSystem.isInitialized && attempts < 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (trainingSystem.isInitialized) {
                console.log('✅ تم تهيئة نظام التدريب بنجاح');
            } else {
                console.warn('⚠️ تهيئة نظام التدريب استغرقت وقتاً أطول من المتوقع');
            }
        }
        return trainingSystem;
    } catch (error) {
        console.error('❌ خطأ في تهيئة نظام التدريب:', error);
        return null;
    }
}

/**
 * بدء تمرين معين
 */
async function startTrainingExercise(exerciseId) {
    try {
        if (!trainingSystem) {
            console.log('🔄 تهيئة نظام التدريب...');
            await initializeTrainingSystem();
        }
        
        if (trainingSystem && trainingSystem.isInitialized) {
            return await trainingSystem.startExercise(exerciseId);
        } else {
            console.error('❌ نظام التدريب غير متوفر');
            return false;
        }
    } catch (error) {
        console.error('❌ خطأ في بدء التمرين:', error);
        return false;
    }
}

/**
 * الحصول على قائمة التمارين المتاحة
 */
function getAvailableExercises() {
    if (!trainingSystem || !trainingSystem.isInitialized) {
        console.warn('⚠️ نظام التدريب غير مهيأ');
        return {};
    }
    return trainingSystem.exercises;
}

/**
 * التحقق من حالة نظام التدريب
 */
function getTrainingSystemStatus() {
    return {
        isInitialized: trainingSystem && trainingSystem.isInitialized,
        isRecording: isRecording,
        currentExercise: currentExercise ? currentExercise.id : null,
        hasAudioSupport: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        supportedMimeTypes: [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/wav',
            'audio/mp4'
        ].filter(type => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type))
    };
}

/**
 * تنظيف نظام التدريب
 */
function cleanupTrainingSystem() {
    if (trainingSystem) {
        if (isRecording) {
            trainingSystem.stopRecording();
        }
        trainingSystem.closeExercise();
    }
    
    // تنظيف المتغيرات العامة
    currentExercise = null;
    mediaRecorder = null;
    audioChunks = [];
    isRecording = false;
    recordingStream = null;
    
    console.log('🧹 تم تنظيف نظام التدريب');
}

/**
 * معالج الأخطاء العام
 */
function handleTrainingError(error, context = '') {
    console.error(`❌ خطأ في نظام التدريب ${context}:`, error);
    
    // تنظيف حالة غير مرغوب فيها
    if (isRecording) {
        try {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            if (recordingStream) {
                recordingStream.getTracks().forEach(track => track.stop());
            }
        } catch (cleanupError) {
            console.warn('تحذير أثناء التنظيف:', cleanupError);
        }
        isRecording = false;
    }
    
    // عرض رسالة خطأ للمستخدم
    const message = context ? `خطأ في ${context}: ${error.message}` : error.message;
    if (window.voiceAcademy && typeof window.voiceAcademy.showNotification === 'function') {
        window.voiceAcademy.showNotification(message, 'error');
    }
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
    window.getTrainingSystemStatus = getTrainingSystemStatus;
    window.cleanupTrainingSystem = cleanupTrainingSystem;
    window.trainingSystem = trainingSystem;
    
    // تهيئة تلقائية عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeTrainingSystem, 1000);
        });
    } else {
        // إذا كان المستند محملاً بالفعل
        setTimeout(initializeTrainingSystem, 1000);
    }
    
    // تنظيف عند إغلاق الصفحة
    window.addEventListener('beforeunload', cleanupTrainingSystem);
    
    // معالجة الأخطاء العامة
    window.addEventListener('error', (event) => {
        if (event.error && event.error.message.includes('training')) {
            handleTrainingError(event.error, 'تحميل الصفحة');
        }
    });
}

// تصدير للـ Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TrainingSystem,
        initializeTrainingSystem,
        startTrainingExercise,
        getAvailableExercises,
        getTrainingSystemStatus
    };
}

// رسالة تأكيد التحميل
console.log('🏋️ تم تحميل نظام التدريب المتكامل بنجاح');

// إضافة أنماط CSS للرسوم المتحركة
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0%, 100% { 
                opacity: 1; 
                transform: scale(1);
            }
            50% { 
                opacity: 0.7; 
                transform: scale(1.05);
            }
        }
        
        .exercise-modal {
            animation: fadeIn 0.3s ease !important;
        }
        
        .exercise-container {
            animation: slideInUp 0.3s ease !important;
        }
        
        .breathing-circle {
            transition: all 1s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .recording-indicator i {
            animation: pulse 1s infinite !important;
        }
    `;
    document.head.appendChild(style);
}            pronunciation: {
                id: 'pronunciation',
                name: 'تمارين النطق',
                description: 'تحسين وضوح النطق ومخارج الحروف',
                difficulty: 'medium',
                duration: 15,
                icon: 'fa-spell-check',
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
                icon: 'fa-theater-masks',
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
                icon: 'fa-user-tie',
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
                icon: 'fa-trophy',
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
                // اختبار الوصول للميكروفون
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('🎤 تم تهيئة الميكروفون بنجاح');
                
                // إيقاف التسجيل المؤقت
                stream.getTracks().forEach(track => track.stop());
                return true;
            }
        } catch (error) {
            console.warn('⚠️ لا يمكن الوصول للميكروفون:', error.message);
            return false;
        }
    }

    /**
     * بدء تمرين
     */
    async startExercise(exerciseId) {
        try {
            if (!this.isInitialized) {
                throw new Error('نظام التدريب غير مهيأ');
            }

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
            this.showError('لا يمكن بدء التمرين الآن: ' + error.message);
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
                    <h2><i class="fas ${exercise.icon}"></i> ${exercise.name}</h2>
                    <button class="close-btn" onclick="trainingSystem.closeExercise()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="exercise-content">
                    ${content}
                </div>
            </div>
        `;

        // إضافة الأنماط المضمنة
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
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease;
        `;

        const container = modal.querySelector('.exercise-container');
        container.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 0;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            animation: slideInUp 0.3s ease;
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
                    <p><strong>المستوى:</strong> ${this.getDifficultyText(exercise.difficulty)}</p>
                </div>
                
                <div class="breathing-guide">
                    <div class="breathing-circle" id="breathingCircle">
                        <span id="breathingText">استعد</span>
                    </div>
                    <div class="breathing-instructions">
                        <p>اتبع دائرة التنفس واستمع للإرشادات</p>
                    </div>
                </div>
                
                <div class="exercise-steps">
                    <h3><i class="fas fa-list-ol"></i> خطوات التمرين:</h3>
                    <ol>
                        ${exercise.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                
                <div class="exercise-tips">
                    <h3><i class="fas fa-lightbulb"></i> نصائح مهمة:</h3>
                    <ul>
                        ${exercise.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="exercise-controls">
                    <button class="btn-primary" onclick="trainingSystem.startBreathingGuide()">
                        <i class="fas fa-play"></i> بدء التمرين المُوجه
                    </button>
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال التمرين
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
                    margin: 0 auto 1rem;
                    color: white;
                    font-size: 1.2rem;
                    font-weight: bold;
                    transition: transform 1s ease;
                    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
                }
                .breathing-circle.inhale {
                    transform: scale(1.3);
                    box-shadow: 0 12px 48px rgba(102, 126, 234, 0.5);
                }
                .breathing-circle.exhale {
                    transform: scale(0.8);
                    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
                }
                .breathing-instructions {
                    color: #666;
                    font-style: italic;
                }
                .exercise-description {
                    background: #f8f9fa;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                    border-left: 4px solid #667eea;
                }
                .exercise-steps, .exercise-tips {
                    margin: 1.5rem 0;
                }
                .exercise-steps h3, .exercise-tips h3 {
                    color: #667eea;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .exercise-steps ol, .exercise-tips ul {
                    padding-right: 1.5rem;
                    line-height: 1.8;
                }
                .exercise-controls {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                    justify-content: center;
                }
                .exercise-controls button {
                    min-width: 150px;
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
                    <p><strong>المستوى:</strong> ${this.getDifficultyText(exercise.difficulty)}</p>
                </div>
                
                <div class="pronunciation-texts">
                    <h3><i class="fas fa-book-open"></i> النصوص للتدريب:</h3>
                    <div id="pronunciationTexts">
                        ${exercise.texts.map((text, index) => `
                            <div class="text-item" data-index="${index}">
                                <div class="text-content">"${text}"</div>
                                <div class="text-controls">
                                    <button class="btn-small btn-primary" onclick="trainingSystem.startRecordingForText(${index})">
                                        <i class="fas fa-microphone"></i> تسجيل
                                    </button>
                                    <button class="btn-small btn-secondary" onclick="trainingSystem.playTextAudio(${index})" disabled>
                                        <i class="fas fa-play"></i> تشغيل
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="recording-status" id="recordingStatus" style="display: none;">
                    <div class="recording-indicator">
                        <i class="fas fa-circle" style="color: #f44336; animation: pulse 1s infinite;"></i>
                        <span>جاري التسجيل...</span>
                    </div>
                    <button class="btn-danger" onclick="trainingSystem.stopRecording()">
                        <i class="fas fa-stop"></i> إيقاف التسجيل
                    </button>
                </div>
                
                <div class="exercise-tips">
                    <h3><i class="fas fa-lightbulb"></i> نصائح:</h3>
                    <ul>
                        ${exercise.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="exercise-controls">
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال التمرين
                    </button>
                </div>
            </div>
            
            <style>
                .text-item {
                    background: #f8f9fa;
                    padding: 1.5rem;
                    margin: 1rem 0;
                    border-radius: 12px;
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                }
                .text-item:hover {
                    border-color: #667eea;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
                }
                .text-content {
                    font-size: 1.2rem;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                    color: #2c3e50;
                    font-weight: 500;
                }
                .text-controls {
                    display: flex;
                    gap: 0.5rem;
                }
                .btn-small {
                    padding: 0.5rem 1rem;
                    font-size: 0.9rem;
                }
                .recording-status {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 1rem;
                    margin: 1rem 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .recording-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    color: #856404;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
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
                    <p><strong>المستوى:</strong> ${this.getDifficultyText(exercise.difficulty)}</p>
                </div>
                
                <div class="expression-scenarios">
                    <h3><i class="fas fa-drama"></i> السيناريوهات:</h3>
                    <div id="expressionScenarios">
                        ${exercise.scenarios.map((scenario, index) => `
                            <div class="scenario-item" data-index="${index}">
                                <div class="scenario-text">"${scenario.text}"</div>
                                <div class="scenario-emotion">
                                    <strong>النبرة المطلوبة:</strong> ${scenario.description}
                                </div>
                                <div class="scenario-controls">
                                    <button class="btn-small btn-primary" onclick="trainingSystem.practiceScenario(${index})">
                                        <i class="fas fa-microphone"></i> تسجيل بهذه النبرة
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="exercise-tips">
                    <h3><i class="fas fa-lightbulb"></i> نصائح:</h3>
                    <ul>
                        ${exercise.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="exercise-controls">
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال التمرين
                    </button>
                </div>
            </div>
            
            <style>
                .scenario-item {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1.5rem;
                    margin: 1rem 0;
                    border-radius: 15px;
                    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
                    transition: transform 0.3s ease;
                }
                .scenario-item:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
                }
                .scenario-text {
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    line-height: 1.5;
                }
                .scenario-emotion {
                    background: rgba(255,255,255,0.2);
                    padding: 0.75rem;
                    border-radius: 8px;
                    margin: 1rem 0;
                    font-size: 0.95rem;
                }
                .scenario-controls {
                    text-align: center;
                }
                .scenario-controls .btn-small {
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    transition: all 0.3s ease;
                }
                .scenario-controls .btn-small:hover {
                    background: rgba(255,255,255,0.3);
                    transform: scale(1.05);
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
                    <p><strong>المستوى:</strong> ${this.getDifficultyText(exercise.difficulty)}</p>
                </div>
                
                <div class="confidence-activities">
                    <h3><i class="fas fa-trophy"></i> الأنشطة:</h3>
                    <div id="confidenceActivities">
                        ${exercise.activities.map((activity, index) => `
                            <div class="activity-item" data-index="${index}">
                                <div class="activity-header">
                                    <h4><i class="fas fa-star"></i> ${activity.name}</h4>
                                    <span class="activity-duration">${activity.duration} ثانية</span>
                                </div>
                                <p class="activity-description">${activity.text}</p>
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
                    <h3><i class="fas fa-lightbulb"></i> نصائح:</h3>
                    <ul>
                        ${exercise.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="exercise-controls">
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال التمرين
                    </button>
                </div>
            </div>
            
            <style>
                .activity-item {
                    background: white;
                    border: 2px solid #e9ecef;
                    padding: 1.5rem;
                    margin: 1rem 0;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                .activity-item:hover {
                    border-color: #667eea;
                    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.1);
                }
                .activity-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .activity-header h4 {
                    color: #667eea;
                    margin: 0;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .activity-duration {
                    background: #e3f2fd;
                    color: #1976d2;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                .activity-description {
                    color: #555;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }
                .activity-controls {
                    text-align: center;
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
                    <p><strong>المستوى:</strong> ${this.getDifficultyText(exercise.difficulty)}</p>
                </div>
                
                <div class="challenge-details">
                    <h3><i class="fas fa-crown"></i> ${exercise.challenge.title}</h3>
                    <p class="challenge-description">${exercise.challenge.description}</p>
                    
                    <div class="requirements">
                        <h4><i class="fas fa-clipboard-list"></i> المتطلبات:</h4>
                        <ul>
                            ${exercise.challenge.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="criteria">
                        <h4><i class="fas fa-check-square"></i> معايير التقييم:</h4>
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
                        <button class="btn-danger" onclick="trainingSystem.stopChallenge()" style="display: none;" id="stopChallengeBtn">
                            <i class="fas fa-stop"></i> إيقاف
                        </button>
                    </div>
                </div>
                
                <div class="exercise-tips">
                    <h3><i class="fas fa-lightbulb"></i> نصائح:</h3>
                    <ul>
                        ${exercise.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="exercise-controls">
                    <button class="btn-secondary" onclick="trainingSystem.completeExercise()">
                        <i class="fas fa-check"></i> إكمال التمرين
                    </button>
                </div>
            </div>
            
            <style>
                .challenge-details {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin: 1rem 0;
                    border: 1px solid #dee2e6;
                }
                .challenge-description {
                    font-size: 1.1rem;
                    color: #495057;
                    margin-bottom: 1.5rem;
                }
                .timer-display {
                    font-size: 4rem;
                    font-weight: bold;
                    text-align: center;
                    color: #667eea;
                    margin: 2rem 0;
                    font-family: 'Courier New', monospace;
                    background: #f8f9fa;
                    padding: 1rem;
                    border-radius: 12px;
                    border: 2px solid #e9ecef;
                }
                .timer-controls {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .requirements, .criteria {
                    margin: 1.5rem 0;
                }
                .requirements h4, .criteria h4 {
                    color: #667eea;
                    margin-bottom: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .requirements ul, .criteria ul {
                    padding-right: 1.5rem;
                    line-height: 1./**
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
let recordingStream = null;

/**
 * فئة نظام التدريب
 */
class TrainingSystem {
    constructor() {
        this.exercises = {};
        this.currentSession = null;
        this.userProgress = {};
        this.audioContext = null;
        this.isInitialized = false;
        this.init();
    }

    /**
     * تهيئة النظام
     */
    async init() {
        try {
            console.log('🏋️ تهيئة نظام التدريب...');
            
            // تحميل التمارين
            this.loadExercises();
            
            // تهيئة الصوت
            await this.initAudio();
            
            this.isInitialized = true;
            console.log('✅ تم تهيئة نظام التدريب بنجاح');
        } catch (error) {
            console.error('❌ خطأ في تهيئة نظام التدريب:', error);
        }
    }

    /**
     * تحميل التمارين
     */
    loadExercises() {
        this.exercises = {
            breathing: {
                id: 'breathing',
                name: 'تمارين التنفس',
                description: 'تمارين لتحسين التحكم في التنفس والصوت',
                difficulty: 'easy',
                duration: 10,
                icon: 'fa-lungs',
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
