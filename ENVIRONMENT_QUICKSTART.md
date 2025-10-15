# Environment Setup - Quick Start

## 🚀 Get Started in 3 Steps

### 1. Copy the template file

```bash
cp .env.example .env.local
```

### 2. Add your secrets to `.env.local`

Open `.env.local` and replace these values:

```bash
# Get from Supabase Dashboard → Settings → API
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
SUPABASE_JWT_SECRET=your-actual-jwt-secret-here

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-here
```

### 3. Run the app

```bash
pnpm install
pnpm dev
```

That's it! Your app should be running at `http://localhost:3000` 🎉

---

## 📋 Where to Get Keys

### Supabase Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project: `ojkqgvkzumbnmasmajkw`
3. Navigate to: **Settings** → **API**
4. Copy:
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
   - **JWT Secret** → `SUPABASE_JWT_SECRET`

### Generate NextAuth Secret

Run this command:

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET`

---

## 🔧 Optional Configuration

### Enable Sentry (Error Tracking)

```bash
NEXT_PUBLIC_SENTRY_DISABLED=false
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_ORG=your-org
NEXT_PUBLIC_SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
```

### Enable Google Analytics

```bash
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_GA_ID=your-ga-id
```

---

## 📚 Full Documentation

For complete setup instructions, AWS Amplify configuration, and troubleshooting:

👉 See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md)

---

## 🔐 Security Reminders

- ✅ **DO** commit: `.env.example`, `.env.development`, `.env.production`
- ❌ **NEVER** commit: `.env.local`
- 🔒 **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- 🔑 Use different secrets for dev and production

---

## ❓ Need Help?

Check the documentation:
- [Backend API Reference](docs/API_REFERENCE.md)
- [Authentication Guide](docs/AUTHENTICATION.md)
- [Frontend Integration](docs/FRONTEND_INTEGRATION.md)
- [Environment Setup (Full)](docs/ENVIRONMENT_SETUP.md)
