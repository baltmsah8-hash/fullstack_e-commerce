# Woo_Store

متجر إلكتروني لعرض المنتجات وشرائها، مع حسابات للمستخدمين ولوحة تحكم لإدارة المنتجات والطلبات والمستخدمين.

## روابط المشروع

| الرابط | العنوان |
| --- | --- |
| الموقع المباشر | [أضف رابط الموقع هنا](#) |
| مستودع المشروع | [أضف رابط المستودع هنا](#) |
| واجهة المتجر | [أضف رابط الواجهة هنا](#) |
| واجهة الخادم API | [أضف رابط الـAPI هنا](#) |

## المميزات

- استعراض المنتجات حسب الفئة وعرض تفاصيل المنتج.
- إنشاء حساب وتسجيل الدخول وإدارة الملف الشخصي.
- سلة تسوق وإتمام الطلبات والدفع عبر Stripe.
- متابعة طلبات المستخدم.
- لوحة تحكم لإدارة المنتجات والطلبات والمستخدمين.
- رفع صور المنتجات وتحويلها إلى WebP.
- صفحة تواصل ونظام إشعارات للإدارة.

## التقنيات المستخدمة

- **Frontend:** Next.js 16، React 19، TypeScript، Tailwind CSS.
- **Backend:** Node.js، Express 5، TypeScript.
- **Database:** MongoDB مع Mongoose.
- **Payments:** Stripe.

## هيكل المشروع

```text
.
├── frontend/     # تطبيق Next.js وصفحات المتجر ولوحة التحكم
└── backend/      # خادم Express وواجهات API ونماذج MongoDB
```

## التشغيل محلياً

تأكد من تثبيت Node.js وnpm، وتجهيز قاعدة بيانات MongoDB ومفاتيح Stripe عند الحاجة للدفع.

### 1. إعداد الخادم

أنشئ ملف `backend/.env` وأضف الإعدادات المطلوبة:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
AUTH_TOKEN=your_auth_cookie_name
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NODE_ENV=development
```

ثم ثبّت اعتماديات الخادم وشغّله:

```bash
cd backend
npm install
npm run dev
```

يعمل الخادم افتراضياً على `http://localhost:5000`.

### 2. إعداد الواجهة

أنشئ ملف `frontend/.env.local` واضبط عناوين واجهات API لتشير إلى الخادم المحلي. أسماء المتغيرات المستخدمة:

```env
NEXT_PUBLIC_REGISTER_API=
NEXT_PUBLIC_LOGIN_API=
NEXT_PUBLIC_LOGOUT_API=
NEXT_PUBLIC_PROFILE_API=
NEXT_PUBLIC_ADMIN_LOGIN_API=
NEXT_PUBLIC_COUTER_API=
NEXT_PUBLIC_ALL_USERS_API=
NEXT_PUBLIC_REMOVE_USER_API=
NEXT_PUBLIC_CHANGE_ROLE_API=
NEXT_PUBLIC_ADD_PRODUCTS_API=
NEXT_PUBLIC_REMOVE_PRODUCTS_API=
NEXT_PUBLIC_PRODUCTS_API=
NEXT_PUBLIC_IMAGE_BASE_URL=
NEXT_PUBLIC_ADD_CART_API=
NEXT_PUBLIC_REMOVE_CART_API=
NEXT_PUBLIC_GET_CART_API=
NEXT_PUBLIC_CLEAR_CART_API=
NEXT_PUBLIC_PLACE_ORDER_API=
NEXT_PUBLIC_USER_ORDER_API=
NEXT_PUBLIC_STATUS_ORDER_API=
NEXT_PUBLIC_LIST_ORDER_API=
NEXT_PUBLIC_CONTACT_API=
NEXT_PUBLIC_GET_NOTIFICATION_API=
NEXT_PUBLIC_UPDATE_NOTIFICATION_API=
NEXT_PUBLIC_CLEAR_NOTIFICATION_API=
```

بعد ضبط العناوين، ثبّت اعتماديات الواجهة وشغّلها في نافذة طرفية منفصلة:

```bash
cd frontend
npm install
npm run dev
```

افتح `http://localhost:3000` لزيارة المتجر. لا تضع مفاتيح سرية ضمن متغيرات `NEXT_PUBLIC_*`، ولا ترفع ملفات البيئة إلى المستودع.

## أوامر مفيدة

| المجلد | الأمر | الغرض |
| --- | --- | --- |
| `frontend` | `npm run dev` | تشغيل الواجهة أثناء التطوير |
| `frontend` | `npm run build` | إنشاء نسخة الإنتاج |
| `frontend` | `npm run lint` | فحص الواجهة باستخدام ESLint |
| `backend` | `npm run dev` | تشغيل الخادم أثناء التطوير |
| `backend` | `npm run build` | بناء الخادم باستخدام TypeScript |
| `backend` | `npm test` | بناء الخادم وتشغيل الاختبارات |

## المهام القادمة

- [ ] إضافة اختيار عدد القطع لكل منتج في المتجر والسلة.
- [ ] إضافة نظام بحث داخل صفحة المنتجات.

## المساهمة

لإضافة تحسين أو الإبلاغ عن مشكلة، افتح Issue أو Pull Request في مستودع المشروع بعد إضافة رابطه في قسم **روابط المشروع**.
