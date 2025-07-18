# 🎙️ أكاديمية الإعلام الاحترافية

## منصة تدريب متقدمة مدعومة بالذكاء الاصطناعي لتطوير المهارات الصوتية والإلقاء

[![النسخة](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Mohammadqaaqah/voice-academy)
[![الترخيص](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![الحالة](https://img.shields.io/badge/status-active-brightgreen.svg)](https://voice-academy-pro.onrender.com)
[![العربية](https://img.shields.io/badge/language-العربية-red.svg)](README.md)

---

## 🌟 **نظرة عامة**

أكاديمية الإعلام الاحترافية هي منصة تدريب متطورة تستخدم تقنيات الذكاء الاصطناعي لتطوير المهارات الصوتية والإلقاء للمهتمين بمجال الإعلام والتواصل. تقدم المنصة تجربة تدريبية شاملة تشمل التحليل الذكي للأداء الصوتي، والتوصيات المخصصة، والتدريب التفاعلي.

### 🎯 **الهدف**

تمكين المتدربين من تطوير مهاراتهم الصوتية والإعلامية من خلال:
- **تحليل ذكي** للأداء الصوتي باستخدام الذكاء الاصطناعي
- **تدريب مخصص** يتكيف مع مستوى كل متدرب
- **تقييم شامل** للنطق والطلاقة والثقة والتعبير
- **بيئة تدريب آمنة** للتطوير والممارسة

---

## ✨ **المميزات الرئيسية**

### 🤖 **الذكاء الاصطناعي المتقدم**
- تحليل شامل للأداء الصوتي في الوقت الفعلي
- تقييم النطق ووضوح المخارج
- كشف العواطف والتعبير في الصوت
- توليد توصيات مخصصة لكل متدرب

### 🎚️ **معالجة الصوت الاحترافية**
- تسجيل عالي الجودة مع إلغاء الضوضاء
- مؤثرات صوتية متقدمة (صدى، رنين، تطبيع)
- تصور صوتي مباشر وتفاعلي
- دعم تنسيقات متعددة (WebM, MP4, WAV)

### 📊 **التحليل والتقارير**
- تحليل مفصل للنطق والطلاقة والثقة
- مقارنة مع المعايير المهنية
- تتبع التطور عبر الوقت
- تقارير شاملة قابلة للتصدير

### 🎮 **التدريب التفاعلي**
- تمارين التنفس المتقدمة
- سيناريوهات تدريبية متنوعة
- الاستوديو الافتراضي للممارسة
- ألعاب تعليمية تفاعلية

---

## 🚀 **البدء السريع**

### 📋 **المتطلبات**

- Node.js >= 18.0.0
- npm >= 8.0.0
- متصفح حديث يدعم Web Audio API
- ميكروفون للتسجيل

### 💻 **التثبيت المحلي**

```bash
# 1. استنساخ المستودع
git clone https://github.com/Mohammadqaaqah/voice-academy.git
cd voice-academy/voice-academy-pro

# 2. تثبيت التبعيات
npm install

# 3. تشغيل الخادم المحلي
npm start

# 4. فتح المتصفح على
# http://localhost:3000
```

### 🌐 **النشر على Render**

1. **إنشاء حساب على [Render](https://render.com)**

2. **ربط مستودع GitHub:**
   - اذهب إلى Dashboard
   - اضغط "New" ← "Web Service"
   - اختر مستودعك من GitHub

3. **إعدادات النشر:**
   ```
   Build Command: npm install
   Start Command: npm start
   Environment: Node
   ```

4. **متغيرات البيئة (اختيارية):**
   ```
   NODE_ENV=production
   PORT=3000
   ```

5. **النشر:** اضغط "Create Web Service"

---

## 🏗️ **هيكل المشروع**

```
voice-academy-pro/
├── 📄 index.html              # الواجهة الرئيسية
├── 🎨 styles.css              # ملف التصميم
├── ⚡ app.js                  # التطبيق الرئيسي
├── 🤖 ai-analysis.js          # محرك الذكاء الاصطناعي
├── 🎵 audio-processing.js     # معالج الصوت
├── 📦 package.json            # إعدادات المشروع
├── 🖥️ server.js               # خادم Express
├── 📱 manifest.json           # ملف PWA
├── 📖 README.md               # هذا الملف
└── 📄 LICENSE                 # ترخيص MIT
```

### 📁 **وصف الملفات**

| الملف | الوصف |
|-------|--------|
| `index.html` | الواجهة الرئيسية مع جميع العناصر والتبويبات |
| `styles.css` | تصميم متجاوب مع تأثيرات متقدمة ودعم الوضع المظلم |
| `app.js` | منطق التطبيق الأساسي وإدارة المستخدمين |
| `ai-analysis.js` | محرك التحليل الذكي والتوصيات المخصصة |
| `audio-processing.js` | معالجة وتسجيل الصوت مع المؤثرات |
| `server.js` | خادم Express للنشر والـ API |

---

## 🎯 **كيفية الاستخدام**

### 1️⃣ **البداية**
- سجل دخولك بإدخال اسمك ومستوى خبرتك
- اختر هدفك من التدريب (إذاعة، بودكاست، عروض تقديمية، إلخ)

### 2️⃣ **لوحة التحكم**
- راجع إحصائياتك وتقدمك اليومي
- احصل على توصيات ذكية مخصصة
- تفاعل مع المساعد الذكي للحصول على نصائح

### 3️⃣ **التدريب**
- ابدأ بتمارين التنفس لتقوية الأساس
- تدرب على النطق الواضح والمخارج الصحيحة
- طور مهارات التعبير والتنغيم
- اعمل على بناء الثقة والحضور

### 4️⃣ **التحليل الذكي**
- سجل صوتك للحصول على تحليل فوري
- راجع النتائج المفصلة والتوصيات
- قارن أداءك مع المعايير المهنية
- تتبع تطورك عبر الوقت

### 5️⃣ **الاستوديو**
- تدرب على سيناريوهات واقعية
- استخدم المؤثرات الصوتية الاحترافية
- سجل وحرر تسجيلاتك
- شارك إنجازاتك

---

## 🛠️ **التقنيات المستخدمة**

### Frontend
- **HTML5** - هيكل الصفحة مع دعم الصوت
- **CSS3** - تصميم متجاوب مع متغيرات CSS
- **JavaScript ES6+** - منطق التطبيق المتقدم
- **Web Audio API** - معالجة الصوت في المتصفح
- **MediaRecorder API** - تسجيل الصوت عالي الجودة
- **Canvas API** - رسم التصور الصوتي

### Backend
- **Node.js** - بيئة تشغيل JavaScript
- **Express.js** - إطار عمل الخادم
- **CORS** - السماح بالطلبات من مصادر مختلفة
- **Helmet** - حماية أمنية للخادم
- **Compression** - ضغط الاستجابات

### AI & Analysis
- **محرك تحليل مخصص** - تحليل الصوت والنطق
- **خوارزميات إحصائية** - تقييم الأداء
- **نظام توصيات ذكي** - اقتراحات مخصصة
- **تعلم الأنماط** - تتبع تطور المستخدم

---

## 📊 **الأداء والمتطلبات**

### 🚀 **مؤشرات الأداء**
- ⚡ زمن التحميل: < 3 ثوانٍ
- 🎵 زمن الاستجابة للصوت: < 100ms
- 📱 دعم جميع الأجهزة (موبايل، تابلت، سطح المكتب)
- 🌐 يعمل بدون إنترنت (PWA)

### 💾 **استهلاك الموارد**
- RAM: ~50MB للجلسة العادية
- Storage: ~2MB لحفظ البيانات محلياً
- Bandwidth: ~1MB/دقيقة تسجيل

### 🔧 **المتطلبات التقنية**
- متصفحات مدعومة: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- دقة الشاشة: 320px+ (دعم كامل للموبايل)
- ميكروفون مطلوب للتدريب الصوتي

---

## 🤝 **المساهمة**

نرحب بمساهماتكم لتطوير المنصة! 

### 📝 **كيفية المساهمة**

1. **Fork المستودع**
2. **إنشاء فرع جديد:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **إضافة التغييرات:**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **رفع التغييرات:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **إنشاء Pull Request**

### 🐛 **الإبلاغ عن الأخطاء**

- استخدم [GitHub Issues](https://github.com/Mohammadqaaqah/voice-academy/issues)
- اكتب وصفاً مفصلاً للمشكلة
- أرفق لقطات شاشة إن أمكن
- اذكر متصفحك ونظام التشغيل

### 💡 **اقتراح مميزات جديدة**

- افتح [Discussion](https://github.com/Mohammadqaaqah/voice-academy/discussions)
- اشرح الميزة المقترحة بالتفصيل
- اذكر الفائدة للمستخدمين

---

## 📄 **الترخيص**

هذا المشروع مرخص تحت [رخصة MIT](LICENSE) - راجع ملف LICENSE للتفاصيل.

```
MIT License

Copyright (c) 2024 Mohammad Qaaqah

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👨‍💻 **المطور**

**Mohammad Qaaqah**
- GitHub: [@Mohammadqaaqah](https://github.com/Mohammadqaaqah)
- Email: your.email@example.com
- LinkedIn: [Mohammad Qaaqah](https://linkedin.com/in/mohammadqaaqah)

---

## 🙏 **شكر وتقدير**

- **مجتمع المطورين العرب** للدعم والتشجيع
- **مكتبات الويب مفتوحة المصدر** المستخدمة في المشروع
- **المختبرين والمستخدمين الأوائل** للملاحظات القيمة

---

## 🔗 **روابط مفيدة**

- 🌐 **الموقع المباشر:** [voice-academy-pro.onrender.com](https://voice-academy-pro.onrender.com)
- 📖 **الوثائق:** [GitHub Wiki](https://github.com/Mohammadqaaqah/voice-academy/wiki)
- 🐛 **الإبلاغ عن مشاكل:** [GitHub Issues](https://github.com/Mohammadqaaqah/voice-academy/issues)
- 💬 **المناقشات:** [GitHub Discussions](https://github.com/Mohammadqaaqah/voice-academy/discussions)

---

## 📈 **الإحصائيات**

![GitHub stars](https://img.shields.io/github/stars/Mohammadqaaqah/voice-academy?style=social)
![GitHub forks](https://img.shields.io/github/forks/Mohammadqaaqah/voice-academy?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/Mohammadqaaqah/voice-academy?style=social)

---

<div align="center">

**🎙️ أكاديمية الإعلام الاحترافية - حيث يبدأ التميز الصوتي**

Made with ❤️ in Jordan 🇯🇴

[⬆ العودة للأعلى](#-أكاديمية-الإعلام-الاحترافية)

</div>
