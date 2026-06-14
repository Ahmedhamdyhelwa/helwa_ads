# 📊 Ads Dashboard — دليل الإعداد والنشر

داشبورد لمتابعة إعلانات فيسبوك مع لينك خاص لكل عميل، يتجدد تلقائياً كل ساعة.

---

## 🏗 هيكل المشروع

```
/dashboard/[accountId]   → لينك العميل (مثال: yoursite.com/dashboard/384151190910004)
/admin                   → لوحة الإدارة (إضافة/حذف حسابات، نسخ روابط)
/api/insights/[id]       → API بيجيب البيانات من Facebook
/api/accounts            → API لإدارة الحسابات
```

---

## 🔑 الخطوة 1: الحصول على Facebook Access Token

1. افتح [developers.facebook.com](https://developers.facebook.com) وسجّل دخول
2. أنشئ **New App** → نوع "Business"
3. أضف **Marketing API** من قائمة المنتجات
4. من **Tools → Graph API Explorer**:
   - اختر تطبيقك
   - اضغط "Generate Access Token"
   - اختر permissions: `ads_read`, `ads_management`, `read_insights`
5. حوّل التوكن لـ **Long-Lived Token** (صالح 60 يوم):
   ```
   GET https://graph.facebook.com/v19.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id=YOUR_APP_ID
     &client_secret=YOUR_APP_SECRET
     &fb_exchange_token=YOUR_SHORT_TOKEN
   ```

> 💡 للتجديد التلقائي: استخدم **System User Token** من Business Manager — صالح إلى الأبد.

---

## 🚀 الخطوة 2: Deploy على Vercel (مجاني)

### أ) رفع الكود على GitHub

```bash
# في مجلد المشروع:
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/YOUR_USERNAME/ads-dashboard.git
git push -u origin main
```

### ب) ربط Vercel

1. افتح [vercel.com](https://vercel.com) وسجّل دخول بـ GitHub
2. اضغط **New Project** → اختر الـ repo
3. Framework: **Next.js** (اكتشفه تلقائياً)
4. في **Environment Variables** أضف:

| Key | Value |
|-----|-------|
| `FB_ACCESS_TOKEN` | توكن فيسبوك الطويل |
| `ADMIN_PASSWORD` | كلمة مرور من اختيارك |
| `REVALIDATE_SECONDS` | `3600` (ساعة) |

5. اضغط **Deploy** ✅

---

## 📤 الخطوة 3: إرسال الروابط للعملاء

بعد الـ deploy، افتح:
```
https://your-vercel-url.vercel.app/admin
```

من هناك:
- تشوف كل الحسابات الموجودة
- تنسخ لينك كل عميل بضغطة زر
- تضيف حسابات جديدة فوراً بدون أي كود

**مثال لينك عميل:**
```
https://your-vercel-url.vercel.app/dashboard/384151190910004
```

---

## ➕ إضافة حساب جديد

### من الـ Admin Panel (الأسهل):
1. افتح `/admin`
2. أدخل Account ID + الاسم + اللون
3. اضغط "إضافة وتوليد اللينك"
4. انسخ اللينك وابعته للعميل

### Account ID إزاي تلاقيه؟
في Ads Manager → الـ URL بيكون فيه `act=XXXXXXXXXX` — ده هو الـ ID.

---

## ⏰ التحديث التلقائي

- البيانات بتتحدث **كل ساعة** عن طريق `Cache-Control` header
- لو عايز أسرع: غيّر `REVALIDATE_SECONDS` لـ `1800` (نص ساعة) أو `900` (ربع ساعة)
- الـ SWR في المتصفح كمان بيعمل refresh كل ساعة تلقائياً

---

## 🔒 الأمان

- الـ `/admin` محمي بكلمة مرور
- الـ `/dashboard/[id]` مفيش عليه login — لو عايز تحميه أضف middleware
- البيانات مش بتتخزن في أي مكان، كل حاجة live من Facebook API

---

## 🐛 مشاكل شائعة

| المشكلة | الحل |
|---------|------|
| "FB API error 190" | التوكن انتهى — جدّده |
| "FB API error 100" | الـ Account ID غلط |
| "FB API error 200" | مش عندك permission على الحساب ده |
| بيانات فاضية | تأكد إن الحساب عنده إعلانات في الفترة المحددة |

---

## 📦 Persistent Storage (اختياري)

بشكل افتراضي الحسابات بتتحفظ في `/tmp` على Vercel — ده بيتمسح مع كل deploy جديد.

للحفظ الدائم، أضف **Vercel KV** (مجاني):
1. في Vercel dashboard → Storage → Create KV Database
2. في `lib/accounts.js` استبدل `readFileSync/writeFileSync` بـ KV API

---

## الحسابات المضافة مسبقاً

| ID | الاسم |
|----|-------|
| 1122194555998894 | helwa — سُندس زى شرعى |
| 384151190910004 | LAMSA |
| 843382442117776 | new cus — سُندس زى اسلامى |
| 963562232919645 | Grow.AI |
| 1494373838527835 | New ebn ezz |
| 525067195260662 | حساب EGP |
| 907086809756696 | حساب USD |
