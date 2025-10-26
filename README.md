### قدم‌های سریع برای شخصی‌سازی
- **AVATAR_URL**: آدرس تصویر پروفایل را جایگزین کنید.  
- **YOUR_NAME / YOUR_DISPLAY_NAME**: نام یا نمایش‌داده‌شده را با نام خودتان عوض کنید.  
- **YOUR_HANDLE**: هندل کوتاه (مثلاً @alirezaxeon) را قرار دهید.  
- **YOUR_BIO_LINE**: خط بیو (مثلاً Frontend developer • Cloudflare Worker enthusiast) را وارد کنید.  
- **YOUR_INSTAGRAM / YOUR_TELEGRAM / YOUR_GITHUB_USERNAME**: نام کاربری شبکه‌ها را جایگزین کنید.  
- **your.email@example.com**: آدرس ایمیل را به ایمیل خود تغییر دهید.  
- در HTML/JS هرجایی که `YOUR_` یا `your.email@example.com` دیده می‌شود را اصلاح کنید.

---

### مثال از AVATAR_URL و نمونه‌ی پر شده برای یک شبکه اجتماعی
- مثال AVATAR_URL (میزبانی در GitHub + jsDelivr):  
  https://cdn.jsdelivr.net/gh/alirezaxeon/my-repo@main/assets/avatar.jpg
- نمونه‌ی پر شده برای اینستاگرام داخل لینک‌ها:  
  - href: https://instagram.com/alirezaxeon  
  - data-app: instagram://user?username=alirezaxeon

---

### راه‌اندازی سریع از طریق داشبورد Cloudflare (بدون ابزار خط فرمان)
- وارد حساب Cloudflare شوید و به بخش **Workers** بروید.  
- گزینه‌ی ایجاد Worker جدید (Create a Worker) را انتخاب کنید.  
- محتوای کامل فایل worker.js را از مخزن یا ویرایشگر کپی کنید و در ویرایشگر آنلاین Cloudflare جای‌گذاری کنید.  
- تغییرات لازم را اعمال کنید (درون ویرایشگر: مقدار AVATAR_URL و متن‌ها را با اطلاعات خود جایگزین کنید).  
- فایل را ذخیره و منتشر (Save and Deploy) کنید.  
- آدرس منتشرشده (worker subdomain) را باز کنید تا کارت دیجیتال شما نمایش داده شود.
