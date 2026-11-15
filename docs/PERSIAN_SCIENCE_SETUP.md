# راه‌اندازی Persian Science

این نسخه بر پایهٔ کد اصلی AIPOCH ساخته می‌شود. وضعیت واقعی تکمیل و آزمون‌ها را در
[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) ببینید؛ این سورس هنوز انتشار
نهایی یا نصب‌کنندهٔ تأییدشدهٔ ویندوز نیست.

## دریافت در پوشهٔ ویندوز

با نصب Git و Node.js 24، این فرمان‌ها را در PowerShell اجرا کنید. زیرپوشهٔ جداگانه
باعث می‌شود فایل‌های لوگو و فونت فعلی شما در پوشهٔ «هارنس ساینس» حفظ شوند:

```powershell
git clone https://github.com/Ho3seinTork/Persian-Science.git "$env:USERPROFILE\Desktop\هارنس ساینس\Persian-Science"
Set-Location "$env:USERPROFILE\Desktop\هارنس ساینس\Persian-Science"
npm ci
npm run dev
```

اگر قبلاً این ریپو را در همان مسیر دریافت کرده‌اید، دوباره clone نکنید. ابتدا
`git status` را بررسی و تغییرات محلی را حفظ کنید؛ سپس `git pull --ff-only` بزنید.

راه دیگر، استخراج آرشیو سورس در زیرپوشهٔ تازه است. آرشیو شامل `node_modules`،
کلید API یا دادهٔ پژوهشی نیست؛ نصب وابستگی‌ها همچنان لازم است.

## ساخت و آزمون

```sh
npm ci
npm run build:packages
npm run typecheck
npm run lint
npm test
npm run build:web
npm run dev:web
```

نسخهٔ وب هم به سرویس Node، پایگاه داده و اجزای بومی پروژه نیاز دارد. ساخت موفق
فایل‌های رابط کاربری به‌تنهایی به معنی آماده بودن کل برنامه نیست.
برای پیش‌نیازهای Windows، از جمله Rust و ابزارهای C++ لازم برای میزبان Notebook،
[راهنمای اصلی توسعه](development-quick-reference.md) را ببینید.

## دسترسی شبکه

نصب معمول علاوه بر رجیستری npm و GitHub، به `binaries.prisma.sh` برای موتور و
checksumهای Prisma و به `statics.aipoch.com` برای اجزای بومی پین‌شده نیاز دارد.
در محیط ابری فعلی دو دامنهٔ اخیر مسدود بودند. دسترسی را در تنظیمات محیط مجاز کنید
و سپس `npm ci` را دوباره اجرا کنید. بررسی TLS و checksumها را خاموش نکنید.

مدل سفارشی یا محلی را از تنظیمات موجود برنامه پیکربندی کنید. کلیدهای سرویس‌ها
در Git، آرشیو سورس یا گفت‌وگو قرار نمی‌گیرند. حفظ تنظیمات مدل و قالب‌های داخلی
پروژه باعث سازگاری با قابلیت‌های موجود می‌شود.
