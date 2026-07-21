# Ilovani telefonga yuklash — to'liq qo'llanma

Bu qo'llanma noldan boshlab, YHQ ilovasini Android telefoningizga qanday
o'rnatishni o'rgatadi.

> **Diqqat:** ishlab chiqilgan mashinada Flutter o'rnatilmagan va `app/` da
> `android/` papkasi yo'q. Shuning uchun quyidagi qadamlarni **Flutter o'rnatilgan
> mashinada** bajarasiz. Har bir qadam bir marta qilinadi.

---

## 0. Telefonga ilova qilib o'rnatish — PWA (tavsiya)

Flutter ham, APK ham kerak emas. Serverni ishga tushirasiz, telefon bir Wi-Fi'dagi
manzilni ochadi va ilovani **bosh ekranga o'rnatadi** — o'rnatilgach internetsiz
ishlaydi. Telefon va kompyuter **bir Wi-Fi** tarmoqda bo'lsin.

```bash
npm install                                   # bir marta (workspaces)
node tools/build_viewer.js                    # Dart engine'ni JS bundle'ga (bir marta / engine o'zgarganda)
node tools/sync_engine.js                     # bundle'ni server/web/mobile'ga tarqatish
node tools/sync_content.js                    # ssenariylarni tarqatish
npm run dev:server                            # serverni 4000-portda ishga tushirish
```

Kompyuter IP'sini toping (`ipconfig` → IPv4 Address, masalan `192.168.1.42`),
telefonda **Chrome** bilan oching:

```
http://192.168.1.42:4000/
```

- Sahifada **"📲 Ilovani o'rnatish"** tugmasini bosing (yoki Chrome menyusi →
  "Add to Home screen" / "Bosh ekranga qo'shish"). Ilova alohida oyna sifatida,
  o'z belgisi bilan o'rnatiladi.
- Bir marta onlayn ochilgach ssenariylar keshlanadi va **internetsiz** ishlaydi
  (server kompyuterda o'chsa ham, o'rnatilgan ilova keshdan ochiladi).

> **Muhim (HTTPS talabi):** brauzerlar PWA'ni **o'rnatish** va **offline** (service
> worker) imkonini faqat **xavfsiz manzil**da beradi — ya'ni `https://…` yoki
> `http://localhost`. Oddiy `http://192.168.x.x` (Wi-Fi IP) orqali sahifa **sayt
> sifatida ishlaydi**, lekin "o'rnatish" tugmasi chiqmaydi va offline yoqilmaydi.
> To'liq o'rnatish uchun bittasini tanlang:
> - **Tez HTTPS tunnel:** `npx cloudflared tunnel --url http://localhost:4000` —
>   bergan `https://…trycloudflare.com` manzilini telefonda oching, "o'rnatish"
>   chiqadi. (yoki `ngrok http 4000`).
> - **Hostingga chiqarish:** serverni Render/Railway kabi bepul HTTPS hostga
>   qo'ying (kod tayyor, faqat deploy).
> - **Sinov uchun:** kompyuterning o'zida `http://localhost:4000/` — bu yerda
>   o'rnatish va offline darrov ishlaydi.

Loop: javob tanlaysiz → animatsiya o'ynaydi → xato javob to'qnashuvda muzlaydi →
"To'g'ri javobni ko'rish". Talabalarni sinash (checkpoint) uchun shu kifoya.

Haqiqiy `.apk` o'rnatiladigan Flutter build kerak bo'lsa — quyida.

---

## 0-b. Muqobil: brauzer viewer (o'rnatishsiz)

```bash
node tools/build_viewer.js
cd editor/public
python -m http.server 8123        # yoki: npx serve -l 8123
```

Telefon brauzerida: `http://192.168.1.42:8123/viewer.html`

---

## 1. Flutter SDK'ni o'rnatish

1. Yuklab oling: <https://docs.flutter.dev/get-started/install/windows>
2. ZIP'ni `C:\src\flutter` ga chiqaring (probel bo'lmagan yo'lga).
3. `C:\src\flutter\bin` ni **PATH** ga qo'shing (Windows → "Edit environment
   variables" → Path → New).
4. Yangi terminal oching va tekshiring:

```bash
flutter --version
flutter doctor
```

`flutter doctor` sizga nima yetishmayotganini aytadi (odatda Android qismi).

---

## 2. Android toolchain'ni o'rnatish

Eng oson yo'l — **Android Studio** (Android SDK, platform-tools, drayverlar hammasi
bir joyda):

1. O'rnating: <https://developer.android.com/studio>
2. Ishga tushiring → SDK Manager → "Android SDK" o'rnatilganini tasdiqlang.
3. Litsenziyalarni qabul qiling:

```bash
flutter doctor --android-licenses      # hammasiga "y"
flutter doctor                          # Android qatori endi ✓ bo'lishi kerak
```

---

## 3. Loyihada `android/` papkasini generatsiya qilish

`app/` da hozircha faqat `lib/` va `pubspec.yaml` bor — platforma fayllari yo'q.
Ularni bir marta generatsiya qilish kerak:

```bash
cd app
flutter create --platforms=android .
```

Bu `android/` papkasini qo'shadi, mavjud `lib/` va assetlarga tegmaydi.

> **Tekshiring:** `flutter create` `pubspec.yaml` ni o'zgartirgan bo'lishi mumkin.
> Loyiha git'da, shuning uchun ko'ring va keraksiz o'zgarishni qaytaring:
> ```bash
> cd .. && git diff app/pubspec.yaml
> git checkout app/pubspec.yaml     # agar engine_dart path yoki assets buzilgan bo'lsa
> ```

---

## 4. Kontent assetlarini joylash

Sahnalar `/content` dan ilova ichiga ko'chiriladi (bu allaqachon bajarilgan,
lekin har kontent o'zgarganda qayta yuriladi):

```bash
node tools/sync_content.js
```

---

## 5. Ilovani telefonda ishga tushirish

### Variant A — USB bilan (eng qulay, tavsiya)

1. Telefonda **Developer options** ni yoqing: Settings → About phone → "Build
   number" ga 7 marta bosing.
2. **USB debugging** ni yoqing: Settings → Developer options → USB debugging.
3. Telefonni USB bilan ulang, "Allow USB debugging?" so'roviga rozi bo'ling.
4. Ulanganini tasdiqlang va ishga tushiring:

```bash
flutter devices                 # telefoningiz ro'yxatda bo'lishi kerak
cd app
flutter run                     # debug rejimda o'rnatadi va ochadi
```

`flutter run` da hot reload bor — kod o'zgartirsangiz `r` bosib yangilaysiz.
Bu ishlab chiqish uchun eng tez yo'l.

### Variant B — APK fayl yasab, qo'lda o'rnatish (USB shart emas)

```bash
cd app
flutter build apk --release
```

Natija:

```
app/build/app/outputs/flutter-apk/app-release.apk
```

Bu faylni telefonga tashlang (Telegram "Saved Messages", Google Drive, yoki USB
xotira), telefonda oching, "noma'lum manbalardan o'rnatish" ga ruxsat bering.

> **Hajm:** birinchi release APK ~15-25 MB bo'ladi. Faqat o'z telefoningiz uchun
> bo'lsa, kichraytirish (`--split-per-abi`) shart emas.

---

## Muammolar bo'lsa

| Belgi | Sabab / yechim |
|---|---|
| `flutter doctor` da Android ✗ | Android Studio + `flutter doctor --android-licenses` |
| `flutter devices` telefonni ko'rmaydi | USB debugging o'chiq, yoki drayver yo'q; kabelni almashtiring |
| `flutter build` da kompilyatsiya xatosi | Flutter qatlami bu mashinada build qilinmagan; xato matnini menga yuboring, tuzatamiz |
| APK o'rnatilmaydi | "Install unknown apps" ruxsati; eski versiyani avval o'chiring |

> **Halol ogohlantirish:** `app/lib/` kodi yozilgan, lekin bu mashinada Flutter
> yo'qligi sababli **hech qachon kompilyatsiya qilib ko'rilmagan**. Birinchi
> `flutter run` / `flutter build` da import yoki widget xatolari chiqishi mumkin.
> Engine (232 test) to'liq tekshirilgan; Flutter qatlami emas. Xato chiqsa, matnini
> yuboring — tez tuzatamiz.

---

## Qisqa xulosa (Flutter o'rnatilgach)

```bash
# bir martalik sozlash
cd app && flutter create --platforms=android .
cd .. && node tools/sync_content.js

# har safar ishga tushirish
cd app && flutter run                    # USB bilan, hot reload
# yoki
cd app && flutter build apk --release    # APK fayl
```
