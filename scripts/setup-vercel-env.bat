@echo off
echo Setting up Vercel environment variables...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI is not installed. Please install it first:
    echo npm i -g vercel
    pause
    exit /b 1
)

echo Setting Supabase configuration...
echo https://gyudwjzjztbgdjwdafxg.supabase.co | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dWR3anpqenRiZ2Rqd2RhZnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDMwOTUsImV4cCI6MjA3MjgxOTA5NX0._FSVzxUBEoykp0LYKs8767X9mHXboP6LK7j6N1QMuT0 | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dWR3anpqenRiZ2Rqd2RhZnhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI0MzA5NSwiZXhwIjoyMDcyODE5MDk1fQ.sPPX_CLWTR6OeU_sj8geMMLPE4UrlgLoto_sdVc_bsc | vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo Setting database configuration...
echo postgresql://postgres:Akash%%401234@db.tyymopgkofdscyyghvyp.supabase.co:5432/postgres | vercel env add DATABASE_URL production

echo Setting app configuration...
echo production | vercel env add NODE_ENV production
echo $2a$10$Dx4r3dUCFfZk8/dmA4zbF/bmE+NvG49idyzwVQ/5ZdhMQwb/LH0bE/f4ljyHbvK+vMaqgvN0HjyxameL66ToIdtEbg== | vercel env add JWT_SECRET production

echo Setting AI provider configuration...
echo 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 | vercel env add HUGGINGFACE_API_KEY production
echo 9G8lEb3bftStUoB3JHShHYA1Ija6RXP8vNsOssh3 | vercel env add COHERE_API_KEY production
echo huggingface | vercel env add DEFAULT_AI_PROVIDER production

echo Setting Google Maps configuration...
echo AIzaSyDe9PcYT1EB2-p4uumsQ4hx2jOVM61Hrow | vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production

echo.
echo Environment variables setup complete!
echo Run 'vercel --prod' to deploy with these variables.
echo.
echo Please manually set NEXT_PUBLIC_APP_URL after deployment:
echo vercel env add NEXT_PUBLIC_APP_URL production
echo Enter your Vercel app URL (e.g., https://your-app.vercel.app)
echo.
echo To verify your environment variables:
echo vercel env ls

pause