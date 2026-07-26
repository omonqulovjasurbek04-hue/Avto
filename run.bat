@echo off
title AVTO (YHQ) - Loyihani Boshqarish Paneli
:: UTF-8 kodirovkasini yoqish (O'zbekcha harflar terminalda to'g'ri ko'rinishi uchun)
chcp 65001 > nul
cls

:menu
cls
echo ====================================================================
echo             AVTO (YHQ) LOYIHASINI BOSHQARISH PANELI
echo ====================================================================
echo  [1] Backend-ni birinchi marta sozlash (Init, .env, DB Push, Seed)
echo  [2] Backend-ni ishga tushirish (Port: 4000)
echo  [3] Frontend-ni ishga tushirish (Port: 3000)
echo  [4] Mobile (Expo)-ni ishga tushirish
echo  [5] Hammasini alohida oynalarda BIR VAQTDA ishga tushirish
echo  [6] Chiqish
echo ====================================================================
set /p choice="Tanlovingizni kiriting [1-6]: "

if "%choice%"=="1" goto setup_backend
if "%choice%"=="2" goto run_backend
if "%choice%"=="3" goto run_frontend
if "%choice%"=="4" goto run_mobile
if "%choice%"=="5" goto run_all
if "%choice%"=="6" goto exit
echo.
echo [XATO] Noto'g'ri tanlov! Iltimos, 1 dan 6 gacha son kiriting.
timeout /t 2 > nul
goto menu

:setup_backend
cls
echo ====================================================================
echo  [SOZLASH] Backend-ni sozlash boshlandi...
echo ====================================================================
cd backend

:: Node modules o'rnatish
echo [1/5] Node paketlari o'rnatilmoqda...
call npm install
if %errorlevel% neq 0 (
    echo [XATO] Paketlarni o'rnatishda xatolik yuz berdi.
    cd ..
    pause
    goto menu
)

:: .env faylini nusxalash
if not exist .env (
    echo [2/5] .env fayli topilmadi. .env.example dan nusxa olinmoqda...
    copy .env.example .env
    echo.
    echo [DIQQAT] backend/.env fayli yaratildi. 
    echo Iltimos, davom etishdan oldin .env faylidagi DATABASE_URL ni sozlang!
    echo.
    pause
) else (
    echo [2/5] .env fayli allaqachon mavjud.
)

:: Prisma Client generatsiya qilish
echo [3/5] Prisma Client generatsiya qilinmoqda...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [XATO] Prisma generate xatolik yuz berdi.
    cd ..
    pause
    goto menu
)

:: Bazani migratsiya qilish (push)
echo [4/5] Ma'lumotlar bazasiga sxemani yozish (db push)...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [XATO] DB Push bajarishda xatolik. Bazaga ulanishni tekshiring!
    cd ..
    pause
    goto menu
)

:: Ma'lumotlarni seed qilish (birlamchi kontentni yuklash)
echo [5/5] Birlamchi ma'lumotlar bazaga seed qilinmoqda (seed.mjs)...
call npm run db:seed
if %errorlevel% neq 0 (
    echo [XATO] Ma'lumotlarni seed qilishda xatolik yuz berdi.
    cd ..
    pause
    goto menu
)

cd ..
echo.
echo ====================================================================
echo [MUVAFFAQIYATLI] Backend to'liq sozlandi va ma'lumotlar seed qilindi!
echo ====================================================================
pause
goto menu

:run_backend
cls
echo ====================================================================
echo  [ISHGA TUSHIRISH] Backend Server ishga tushirilmoqda (Port: 4000)...
echo ====================================================================
cd backend
call npm run dev
cd ..
pause
goto menu

:run_frontend
cls
echo ====================================================================
echo  [ISHGA TUSHIRISH] Frontend Web App ishga tushirilmoqda (Port: 3000)...
echo ====================================================================
cd frontend
call npm run dev
cd ..
pause
goto menu

:run_mobile
cls
echo ====================================================================
echo  [ISHGA TUSHIRISH] Mobile Expo loyihasi ishga tushirilmoqda...
echo ====================================================================
cd frontend\mobile
call npx expo start
cd ..\..
pause
goto menu

:run_all
cls
echo ====================================================================
echo  [ISHGA TUSHIRISH] Loyiha qismlari alohida oynalarda ochilmoqda...
echo ====================================================================
echo 1. Backend server ishga tushmoqda...
start "AVTO Backend Server (4000)" cmd /k "cd backend && npm run dev"

echo 2. Frontend web ishga tushmoqda...
start "AVTO Frontend Web (3000)" cmd /k "cd frontend && npm run dev"

echo 3. Mobile Expo ishga tushmoqda...
start "AVTO Mobile Expo" cmd /k "cd frontend\mobile && npx expo start"

echo.
echo [OK] Barcha qismlar ishga tushirildi! Loyihalar oynasini yopmang.
echo.
pause
goto menu

:exit
echo.
echo AVTO loyihasi boshqaruv panelidan foydalanganingiz uchun rahmat!
echo Ishingizga omad.
timeout /t 2 > nul
exit
