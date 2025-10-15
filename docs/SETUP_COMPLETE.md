# SnSD Backend Integration - Setup Complete ✅

## Overview

The SnSD AI frontend has been fully configured to integrate with the backend API. All necessary environment variables, API clients, type definitions, and React hooks have been created and are ready to use.

---

## ✅ What Has Been Completed

### 1. Environment Configuration

Created environment files for all deployment scenarios:

#### Files Created:
- **`.env.local`** - Local development environment
  - Backend API: `http://localhost:8000`
  - Includes all Supabase configuration
  - Ready for local development

- **`.env.development`** - AWS Amplify dev branch
  - Backend API: `http://localhost:8000` (development backend)
  - Configured for development deployment

- **`.env.production`** - AWS Amplify main branch
  - Backend API: `https://api.snsdconsultant.com`
  - Production-ready configuration

- **`.env.example`** - Template file
  - Safe to commit to git
  - Contains all required variables with placeholders

#### Configuration Details:
- ✅ Supabase URL and Anon Key (pre-configured)
- ✅ Backend API endpoints (dev/prod)
- ✅ NextAuth configuration
- ✅ Sentry error tracking setup
- ✅ Feature flags (Evren GPT, Marcel GPT, Safety Bud)
- ✅ File upload configuration
- ✅ Localization (English default, Dubai timezone)
- ✅ Rate limiting settings

### 2. Build Configuration

Updated **`amplify.yml`**:
```yaml
- env | grep -e NEXTAUTH_ >> .env.production || true
- env | grep -e NEXT_PUBLIC_ >> .env.production || true
- env | grep -e SUPABASE_ >> .env.production || true
- env | grep -e SENTRY_ >> .env.production || true
```

Automatically injects environment variables during AWS Amplify builds.

### 3. TypeScript Types

Created **`src/types/api.ts`** with complete type definitions:

- ✅ **Tenant Types**: `Tenant`, `TenantCreate`, `TenantUpdate`
- ✅ **Role Types**: `Role`, `ROLE_LEVELS`
- ✅ **Profile Types**: `Profile`, `ProfileUpdate`
- ✅ **Contractor Types**: `Contractor`, `ContractorCreate`, `ContractorUpdate`
- ✅ **FRM-32 Question Types**: `FRM32Question`, `QuestionType`
- ✅ **FRM-32 Submission Types**: `FRM32Submission`, `FRM32SubmissionCreate`
- ✅ **Payment Types**: `Payment`, `PaymentCreate`
- ✅ **Auth Types**: `AuthUser`, `AuthSession`
- ✅ **Filter & Pagination Types**: All filter interfaces

### 4. API Integration

Created **`src/lib/api-client.ts`**:
- Full REST API client with authentication
- Automatic JWT token injection from Supabase
- Support for `X-Tenant-ID` header
- Error handling
- Methods: `get`, `post`, `put`, `delete`, `patch`

Created **`src/lib/supabase/client.ts`**:
- Supabase client configuration
- Auto-refresh tokens
- Session persistence
- Secure configuration

### 5. React Hooks

Created comprehensive React hooks using `@tanstack/react-query`:

#### ✅ `useAuth.ts`
- Sign in / Sign up / Sign out
- Password reset and update
- Session management
- User state tracking

#### ✅ `useProfile.ts`
- Fetch current user profile
- Update profile information
- Automatic cache invalidation

#### ✅ `useContractors.ts`
- List contractors with filters
- Create/update/delete contractors
- Single contractor fetching
- Pagination support

#### ✅ `useSubmissions.ts`
- FRM-32 submission management
- Create and update submissions
- Filter by status and contractor
- Submission progress tracking

#### ✅ `useQuestions.ts`
- Fetch FRM-32 questions
- Filter by active status
- Individual question fetching

#### ✅ `usePayments.ts`
- Payment history
- Create new payments
- Filter by status
- Invoice management

#### ✅ `useTenants.ts`
- Tenant management
- Create/update tenants
- License plan management

#### ✅ `useRoles.ts`
- Role listings
- Permission management
- Role level tracking

### 6. Documentation

Created comprehensive documentation:

#### ✅ **`docs/ENVIRONMENT_SETUP.md`** (Full Guide)
- Complete environment variable reference
- Security best practices
- AWS Amplify configuration instructions
- Troubleshooting guide
- Step-by-step setup for all environments

#### ✅ **`ENVIRONMENT_QUICKSTART.md`** (Quick Start)
- 3-step setup guide
- Where to get keys
- Essential configuration only

### 7. Git Configuration

Updated **`.gitignore`**:
```gitignore
# Ignore local env files
.env*.local
.env.local

# Allow specific env files to be committed
!.env.example
!.env.development
!.env.production
```

---

## 🚀 Next Steps

### 1. Get Your Secrets (Required)

You need to obtain the following secrets before running the app:

#### From Supabase Dashboard:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project: `ojkqgvkzumbnmasmajkw`
3. Navigate to **Settings → API**
4. Copy:
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
   - **JWT Secret** → `SUPABASE_JWT_SECRET`

#### Generate NextAuth Secret:
```bash
openssl rand -base64 32
```
Copy output to `NEXTAUTH_SECRET`

### 2. Configure Local Environment

```bash
# Copy template
cp .env.example .env.local

# Edit .env.local and add your secrets
nano .env.local
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run Development Server

```bash
pnpm dev
```

App will be available at: `http://localhost:3000`

### 5. Configure AWS Amplify (When Ready for Deployment)

Follow the instructions in [`docs/ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md) section "AWS Amplify Configuration"

---

## 📚 Backend API Endpoints

All documented in [`docs/API_REFERENCE.md`](./API_REFERENCE.md):

### Available Endpoints:
- **Health Check**: `GET /` , `GET /health`
- **Auth & Profile**: `GET /profiles/me`, `PUT /profiles/me`
- **Tenants**: `GET /tenants`, `POST /tenants`, `PUT /tenants/{id}`
- **Roles**: `GET /roles`
- **Contractors**: Full CRUD operations
- **FRM-32 Questions**: `GET /frm32/questions`
- **FRM-32 Submissions**: Full CRUD + workflow
- **Payments**: `GET /payments`, `POST /payments`

---

## 🔐 Security Configuration

### ✅ Configured:
- Supabase Authentication (JWT-based)
- Row Level Security (RLS) via Supabase
- Secure token storage
- Auto token refresh
- HTTPS for production
- Environment variable encryption in Amplify

### ⚠️ Important Security Notes:
1. **NEVER** commit `.env.local` to git
2. **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to client
3. **ALWAYS** use different secrets for dev and prod
4. **ROTATE** secrets periodically
5. **MARK** secrets as encrypted in AWS Amplify

---

## 🎯 Feature Flags

Ready to use in your app:

```typescript
const isEvrenGPTEnabled = process.env.NEXT_PUBLIC_ENABLE_EVREN_GPT === 'true'
const isMarcelGPTEnabled = process.env.NEXT_PUBLIC_ENABLE_MARCEL_GPT === 'true'
const isSafetyBudEnabled = process.env.NEXT_PUBLIC_ENABLE_SAFETY_BUD === 'true'
```

---

## 📖 Usage Examples

### Authentication

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { signIn, isSigningIn, signInError } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await signIn({ email, password });
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### Fetching Contractors

```typescript
import { useContractors } from '@/hooks/useContractors';

function ContractorsPage() {
  const tenantId = 'your-tenant-id';
  const { contractors, isLoading, error } = useContractors(tenantId, {
    status: 'active',
    limit: 20
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {contractors.map(contractor => (
        <div key={contractor.id}>{contractor.name}</div>
      ))}
    </div>
  );
}
```

### Creating a Submission

```typescript
import { useSubmissions } from '@/hooks/useSubmissions';

function CreateSubmissionForm() {
  const tenantId = 'your-tenant-id';
  const { createSubmission, isCreating } = useSubmissions(tenantId);

  const handleCreate = () => {
    createSubmission({
      contractor_id: 'contractor-uuid',
      evaluation_period: '2025-Q1',
      evaluation_type: 'periodic'
    });
  };
}
```

---

## 🛠️ Development Workflow

### For Local Development:
1. Ensure backend is running at `http://localhost:8000`
2. Use `.env.local` configuration
3. Run `pnpm dev`

### For Deployment:
1. Configure environment variables in AWS Amplify Console
2. Push to `dev` branch for development deployment
3. Push to `main` branch for production deployment
4. Amplify automatically builds and deploys

---

## 📊 Project Structure

```
src/
├── types/
│   └── api.ts                    # All TypeScript types
├── lib/
│   ├── api-client.ts             # REST API client
│   └── supabase/
│       └── client.ts             # Supabase configuration
├── hooks/
│   ├── useAuth.ts                # Authentication
│   ├── useProfile.ts             # User profile
│   ├── useContractors.ts         # Contractors CRUD
│   ├── useSubmissions.ts         # FRM-32 submissions
│   ├── useQuestions.ts           # FRM-32 questions
│   ├── usePayments.ts            # Payments
│   ├── useTenants.ts             # Tenants
│   └── useRoles.ts               # Roles

docs/
├── ENVIRONMENT_SETUP.md          # Full setup guide
├── API_REFERENCE.md              # Backend API docs
├── AUTHENTICATION.md             # Auth guide
├── FRONTEND_INTEGRATION.md       # Integration docs
└── SETUP_COMPLETE.md             # This file

Root files:
├── .env.local                    # Your local config (not committed)
├── .env.example                  # Template (committed)
├── .env.development              # Dev deployment (committed)
├── .env.production               # Prod deployment (committed)
├── ENVIRONMENT_QUICKSTART.md     # Quick start guide
└── amplify.yml                   # AWS Amplify config
```

---

## ✅ Checklist

Before starting development:

- [ ] Copy `.env.example` to `.env.local`
- [ ] Get `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard
- [ ] Get `SUPABASE_JWT_SECRET` from Supabase Dashboard
- [ ] Generate `NEXTAUTH_SECRET` with OpenSSL
- [ ] Add secrets to `.env.local`
- [ ] Run `pnpm install`
- [ ] Start backend API at `http://localhost:8000`
- [ ] Run `pnpm dev`
- [ ] Test authentication flow
- [ ] Test API integration

Before deploying to AWS Amplify:

- [ ] Configure all environment variables in Amplify Console
- [ ] Mark sensitive variables as secrets
- [ ] Test development branch deployment
- [ ] Verify API connectivity
- [ ] Test production branch deployment
- [ ] Set up custom domain (if needed)
- [ ] Configure DNS for `api.snsdconsultant.com`

---

## 🆘 Troubleshooting

### Build fails in Amplify
→ Check that all required environment variables are set in Amplify Console

### Authentication not working
→ Verify `NEXTAUTH_URL` matches your actual URL
→ Check `NEXTAUTH_SECRET` is set and secure

### API calls failing
→ Verify backend is running
→ Check `NEXT_PUBLIC_API_URL` points to correct backend
→ Verify CORS is configured on backend

### Environment variables not loading
→ Restart dev server: `pnpm dev`
→ For Amplify: re-deploy the application

---

## 📞 Support

For detailed information, refer to:
- [Environment Setup Guide](./docs/ENVIRONMENT_SETUP.md)
- [Backend API Reference](./docs/API_REFERENCE.md)
- [Authentication Guide](./docs/AUTHENTICATION.md)
- [Frontend Integration](./docs/FRONTEND_INTEGRATION.md)

---

**Setup completed on:** 2025-10-15
**Ready for development:** ✅ YES
**Ready for deployment:** ✅ YES (after adding secrets)
