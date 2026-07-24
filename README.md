# CareNest — Senior Residence Management System

CareNest is a web-first senior residence management platform for resident records, admissions, clinical care, staffing, daily operations, reporting, communication, and facility administration.

![Status](https://img.shields.io/badge/status-active%20prototype-f59e0b)
![Web](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)
![API](https://img.shields.io/badge/NestJS-10-e0234e?logo=nestjs)
![Database](https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql)

> **Project status:** Active prototype. Several core workflows are backed by PostgreSQL, while some operational screens currently store demonstration data in the browser. Authentication and authorization require hardening before production use.

## Table of contents

- [About the project](#about-the-project)
- [Current implementation status](#current-implementation-status)
- [Key features](#key-features)
- [User roles](#user-roles)
- [Role-based access control](#role-based-access-control)
- [Technology stack](#technology-stack)
- [System architecture](#system-architecture)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [Running the application](#running-the-application)
- [Running with Docker](#running-with-docker)
- [Default development accounts](#default-development-accounts)
- [Available scripts](#available-scripts)
- [API documentation](#api-documentation)
- [Database overview](#database-overview)
- [Authentication and security](#authentication-and-security)
- [Testing](#testing)
- [Code quality](#code-quality)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Privacy and data handling](#privacy-and-data-handling)
- [Browser and device support](#browser-and-device-support)
- [Accessibility](#accessibility)
- [Roadmap](#roadmap)
- [Known issues](#known-issues)
- [Future enhancements](#future-enhancements)
- [Contributing](#contributing)
- [Git workflow](#git-workflow)
- [Commit convention](#commit-convention)
- [License](#license)
- [Author and contact](#author-and-contact)
- [Acknowledgements](#acknowledgements)

## About the project

CareNest is intended for residential-care administrators, care managers, caregivers, nurses, doctors, HR teams, and resident-linked guests. Its main objective is to provide one operational workspace for resident information, admissions, care planning, medication, health checks, staff, shifts, and related administrative work.

The code includes a `Facility` entity and facility relationships for residents and staff. Branch names also appear in admissions and staff records. However, there is no dedicated database-backed `Branch` entity and most queries are not scoped by facility, so production-grade multi-branch tenancy is **not yet implemented**.

The project addresses:

- Fragmented resident and admission records.
- Coordination of care plans, medication, daily health checks, tasks, and shifts.
- Staff account and resident-linked guest access.
- Operational visibility through dashboards and exports.
- Consistent personal preferences and session management.

## Current implementation status

### Implemented

- [x] npm workspace and Turborepo monorepo.
- [x] Next.js staff portal with responsive navigation and theming.
- [x] NestJS REST API with `/api/v1` prefix and Swagger UI.
- [x] PostgreSQL schema through Prisma ORM.
- [x] Credential login with salted `scrypt` password hashes and signed JWT access tokens.
- [x] Database-backed residents, admissions, care plans, medication, medication stock, daily health reports, tasks, shifts, staff, guest accounts, preferences, and login sessions.
- [x] Dashboard summary API.
- [x] Client-side CSV, spreadsheet-compatible XLS, and PDF report exports.
- [x] Docker Compose services for PostgreSQL, Redis, and MinIO.

### Partially implemented

- [~] **Authorization:** roles and permissions are defined and returned at login, but there is no server-side permission guard. Only resident reads and settings routes currently require JWT authentication.
- [~] **Multi-branch support:** facility and branch fields exist, but queries are not consistently isolated by facility or branch.
- [~] **Audit logs:** navigation, clicks, and submissions are recorded in browser `localStorage`; this is not an immutable server audit trail.
- [~] **Branches, schedule, announcements, billing, and messages:** functional browser interfaces persist data locally rather than through API/database modules.
- [~] **Reports:** exports are functional, but analytics are calculated in the browser from available API data.
- [~] **File handling:** profile photos can be stored as data URLs in the staff record; billing receipts are stored in browser data. The configured S3 client is not used by an upload service.
- [~] **Redis:** a lazy Redis client is registered but is not consumed by application services.
- [~] **Mobile app:** a Flutter shift screen fetches residents, but mobile authentication and a complete navigation/workflow implementation are absent.
- [~] **Notifications:** preference controls exist and Firebase initializes defensively in Flutter, but delivery workflows and platform configuration are not included.
- [~] **Incidents and documents:** Prisma entities and resident-detail reads exist, but there are no dedicated API controllers or management pages.

### Planned or not implemented

- [ ] Database-backed rooms and beds.
- [ ] Appointments, meals and nutrition, activities, visitors, and transportation modules.
- [ ] Inventory and maintenance modules.
- [ ] Dedicated daily-care recording.
- [ ] Server-backed messages, announcements, schedules, branches, billing, audit logs, and notification delivery.
- [ ] Production-ready file upload and object-storage workflows.
- [ ] Complete server-side RBAC, facility isolation, and session revocation enforcement.
- [ ] Automated tests, CI/CD, application container images, and production deployment configuration.

## Key features

### Authentication and accounts

- Email/password login.
- Development role selector on the login page.
- Eight-hour JWT access tokens.
- Remember-me storage in `localStorage`; session-only login in `sessionStorage`.
- Staff account creation and status management.
- Resident-linked guest account creation.
- Role-prefixed employee IDs such as `SA-001`, `NU-001`, and `GU-001`.

### Dashboard

- Active-resident, task, completion, and incident summary counts.
- Resident attention list and operational overview.
- Configurable dashboard widget visibility.

### Residents and admissions

- Resident list, search, details, and status changes.
- Multi-section admission form.
- Generated admission IDs using `ADM-<year>-<sequence>`.
- Allergies, dietary requirements, contacts, medical/admission JSON sections, and room information.
- Guest access limited in resident read endpoints to the linked resident.

### Care plans and daily health

- Care-plan list and creation with goals, guidance, priority, and review date.
- Daily resident health reports with vital signs, pain, mood, nutrition, mobility, medication, concerns, actions, notes, and escalation.
- One report per resident per calendar date.

### Medication

- Medication list and details.
- Create and update medication records.
- Stock quantity, unit, reorder threshold, supplier, batch, and expiry information.
- Low-stock filtering.

### Tasks, shifts, and staff

- Resident care-task creation, assignment, due dates, and status updates.
- Staff-shift creation, date filtering, and status updates.
- Staff creation, editing, profile photos, branch assignment, and employment status changes.
- Account directory and CSV export.

### Reports and administration

- Resident, care, medication, staff, and health report views.
- CSV, spreadsheet-compatible XLS, PDF, and print output.
- Personal profile, appearance, accessibility, region, security, session, and notification preferences.
- Client-side branches, schedule, announcements, billing, payment-method forms, messages, and audit terminal.
- Audit terminal command reference in [docs/audit-log-terminal-commands.md](docs/audit-log-terminal-commands.md).

## User roles

Roles are defined in `apps/api/src/auth/roles.ts`.

| Role | Intended responsibility in the current permission catalogue |
|---|---|
| Super Admin | Organizations, subscriptions, system configuration, all branches, usage, backups, and audit logs |
| Admin | Dashboard, residents, admissions, care plans, medication, tasks/shifts, staff, health, schedule, reports, branches, announcements, and audit logs |
| Guest | Read the single linked resident record |
| Care Manager | Assess residents, create care plans, assign caregivers, review notes, and monitor progress |
| Caregiver | Assigned residents, meals, hygiene, mobility, care tasks, notes, and incident reporting |
| Nurse | Vitals, medication administration, history, nursing notes, allergies, and health changes |
| Doctor | Medical records, diagnoses, treatment plans, prescriptions, laboratory requests, and progress review |
| HR Manager | Staff, attendance, leave, employment documents, training, and certifications |

These responsibility strings are a permission catalogue, not complete server-enforced access rules.

## Role-based access control

1. `POST /api/v1/auth/login` validates credentials against a `Staff` record.
2. The API derives permissions from the staff role.
3. A JWT is signed with staff, session, role, permission, facility, and linked-resident claims.
4. The web app stores the token and account in browser storage.
5. The API client sends a Bearer token for shared GET helpers.
6. Guest navigation is redirected to the linked resident, and resident GET endpoints enforce that link.

Current limitations:

- There is no `@Roles()` decorator or permission guard in the API.
- Settings routes and resident GET routes use `JwtAuthGuard`; most other endpoints are currently public.
- Revoking a `LoginSession` updates the database, but `JwtAuthGuard` does not check session revocation.
- Most service queries do not restrict records by the JWT `facilityId`.
- The web shell does not provide a general unauthenticated-route redirect.

## Technology stack

| Area | Verified implementation |
|---|---|
| Frontend | Next.js 15 App Router, React 19, TypeScript |
| Styling and UI | Tailwind CSS 3, Radix UI Dialog/Avatar, Lucide icons, `clsx`, `tailwind-merge`, Class Variance Authority |
| Data fetching | TanStack Query plus native `fetch` |
| Forms and validation | React Hook Form, Zod, `@hookform/resolvers` on selected web forms |
| Backend | Node.js, NestJS 10, TypeScript, REST |
| API documentation | `@nestjs/swagger` |
| Backend validation | `class-validator`, `class-transformer`, global `ValidationPipe` |
| Database | PostgreSQL; PostgreSQL 16 Alpine in Docker Compose |
| ORM | Prisma 6 |
| Authentication | Custom email/password login, Node `crypto.scrypt`, Nest JWT |
| Authorization | Static role-permission catalogue; partial JWT/guest enforcement |
| Cache/infrastructure | `ioredis` client registered but not used by modules |
| File storage | AWS SDK S3 client registered; MinIO service configured; no implemented object upload API |
| Real-time communication | Not implemented; no WebSocket/SSE server |
| Mobile | Flutter, Riverpod, Dio, Material 3, Firebase Core/Messaging dependencies |
| Testing | Flutter SDK test dependency only; no test files found |
| Monorepo tools | npm workspaces, Turborepo, TypeScript |
| Containers | Docker Compose for PostgreSQL, Redis, MinIO, and bucket creation |

## System architecture

```mermaid
flowchart LR
    U[Web browser] -->|Next.js pages| W[CareNest Web<br/>localhost:3000]
    W -->|REST + Bearer JWT| A[NestJS API<br/>localhost:4000/api/v1]
    M[Flutter prototype] -->|Dio REST| A
    A --> P[Prisma ORM]
    P --> D[(PostgreSQL<br/>localhost:5433)]
    A -. registered client; unused .-> R[(Redis<br/>localhost:6379)]
    A -. registered client; no upload service .-> S[(MinIO / S3-compatible storage<br/>localhost:9000)]
    W --> L[(Browser localStorage/sessionStorage)]
```

Browser-local data currently includes schedule events, branches, announcements, billing records and receipts, conversations, appearance preferences, and client audit events.

## Project structure

```text
CareNest/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── auth/
│   │       ├── care-plans/
│   │       ├── daily-health/
│   │       ├── dashboard/
│   │       ├── infrastructure/
│   │       ├── medications/
│   │       ├── residents/
│   │       ├── settings/
│   │       ├── staff/
│   │       └── tasks-shifts/
│   ├── mobile/
│   │   └── lib/
│   └── web/
│       └── src/
│           ├── app/
│           ├── assets/
│           ├── components/
│           └── lib/
├── docs/
│   └── audit-log-terminal-commands.md
├── packages/
│   └── config/
├── .env.example
├── docker-compose.yml
├── package.json
├── package-lock.json
└── turbo.json
```

- `apps/web` contains all App Router pages and UI components.
- `apps/api` contains NestJS controllers/services and Prisma database code.
- `apps/mobile` is an early Flutter companion.
- `packages/config` provides the shared TypeScript base configuration.
- `docs` contains supplemental project documentation.

Generated directories such as `node_modules`, `.next`, `dist`, `.turbo`, coverage, and Flutter build output are intentionally omitted.

## Prerequisites

- **Node.js:** no exact version is pinned. Use a currently supported Node.js release compatible with Next.js 15 and NestJS 10.
- **npm 11.17.0:** declared by the root `packageManager` field.
- **Docker with Compose:** recommended for PostgreSQL, Redis, and MinIO.
- **Flutter SDK 3.4 to less than 4.0:** only required for `apps/mobile`.

PostgreSQL, Redis, and MinIO do not need separate host installations when Docker Compose is used.

## Getting started

### Installation

```bash
git clone <repository-url>
cd CareNest
npm install
```

Create the local environment file:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Start infrastructure and prepare the database:

```bash
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
```

Start the web and API workspaces:

```bash
npm run dev
```

## Environment variables

The API loads `.env` from its working directory or the repository root. Do not commit real secrets.

| Variable | Requirement | Purpose | Safe local example |
|---|---|---|---|
| `DATABASE_URL` | Required | Prisma PostgreSQL connection | `postgresql://carenest:carenest@localhost:5433/carenest?schema=public` |
| `REDIS_URL` | Optional | Redis client connection | `redis://localhost:6379` |
| `JWT_SECRET` | Required outside throwaway development | Signs access tokens | `replace-with-a-long-random-secret` |
| `API_PORT` | Optional | NestJS listen port | `4000` |
| `WEB_URL` | Optional | Comma-separated allowed CORS origins | `http://localhost:3000,http://127.0.0.1:3000` |
| `NEXT_PUBLIC_API_URL` | Recommended | Browser API base URL | `http://localhost:4000/api/v1` |
| `STORAGE_DRIVER` | Declared, currently unused | Intended storage backend selector | `minio` |
| `S3_ENDPOINT` | Optional for client construction | S3-compatible endpoint | `http://localhost:9000` |
| `S3_REGION` | Optional | S3 region; defaults to `us-east-1` | `us-east-1` |
| `S3_BUCKET` | Declared, currently unused | Intended object bucket name | `carenest` |
| `S3_ACCESS_KEY` | Optional locally | S3 client access key | `carenest` |
| `S3_SECRET_KEY` | Optional locally | S3 client secret | `carenest-secret` |
| `S3_FORCE_PATH_STYLE` | Optional | Enables MinIO-compatible paths | `true` |
| `NODE_ENV` | Optional | Enables strict production CORS behavior | `development` |

The Flutter app also reads a compile-time `API_URL` value:

```bash
flutter run --dart-define=API_URL=http://10.0.2.2:4000/api/v1
```

Firebase platform configuration files are not included in this repository.

## Database setup

Generate the Prisma client:

```bash
npm run db:generate
```

Create/apply a development migration:

```bash
npm run db:migrate
```

Seed development data:

```bash
npm run db:seed
```

Open Prisma Studio directly through the installed Prisma CLI:

```bash
npx prisma studio --schema apps/api/prisma/schema.prisma
```

No migration directory is currently committed. The first `db:migrate` run will prompt for a migration name.

> **Destructive reset:** `npx prisma migrate reset --schema apps/api/prisma/schema.prisma` deletes database data before recreating and seeding it. Use it only against a disposable development database.

## Running the application

### Development

```bash
npm run dev
```

| Service | URL |
|---|---|
| Web portal | `http://localhost:3000` |
| REST API | `http://localhost:4000/api/v1` |
| Health endpoint | `http://localhost:4000/api/v1/health` |
| Swagger UI | `http://localhost:4000/docs` |
| MinIO API | `http://localhost:9000` |
| MinIO console | `http://localhost:9001` |

There is no WebSocket endpoint or worker process.

### Production build

```bash
npm run build
```

Start each built JavaScript application in separate terminals:

```bash
npm run start --workspace=@carenest/api
npm run start --workspace=@carenest/web
```

The API requires reachable production infrastructure and environment variables before startup.

### Flutter

```bash
cd apps/mobile
flutter pub get
flutter run --dart-define=API_URL=http://10.0.2.2:4000/api/v1
```

The mobile client does not currently implement login or attach a Bearer token, while the resident list API requires one. Mobile resident loading therefore needs authentication work before it functions with the current API.

## Running with Docker

Docker Compose runs infrastructure only; it does not build the web, API, or mobile applications.

```bash
# Start all infrastructure
docker compose up -d

# Start only PostgreSQL
docker compose up -d postgres

# Inspect status
docker compose ps

# Follow logs
docker compose logs -f

# Stop containers
docker compose down
```

Services are `postgres`, `redis`, `minio`, and the one-shot `create-bucket` helper.

> `docker compose down -v` also deletes the named PostgreSQL, Redis, and MinIO volumes. This permanently removes local data.

## Default development accounts

These accounts are created by `apps/api/prisma/seed.ts` and are for local development only. The seed marks them as requiring a password change.

| Role | Email | Temporary password |
|---|---|---|
| Super Admin | `superadmin@carenest.local` | `SuperAdmin@123` |
| Admin | `admin@carenest.local` | `Admin@123` |
| Care Manager | `caremanager@carenest.local` | `CareManager@123` |
| Caregiver | `caregiver@carenest.local` | `Caregiver@123` |
| Nurse | `nurse.account@carenest.local` | `Nurse@123` |
| Doctor | `doctor@carenest.local` | `Doctor@123` |
| HR Manager | `hr@carenest.local` | `HRManager@123` |

The additional seeded `nurse@carenest.local` staff record has no password and cannot log in.

## Available scripts

### Root workspace

| Command | Declared action |
|---|---|
| `npm run dev` | Run workspace development tasks through Turbo |
| `npm run build` | Build workspaces through Turbo |
| `npm run lint` | Run declared workspace lint tasks |
| `npm run typecheck` | Type-check workspaces |
| `npm run db:generate` | Generate the API Prisma client |
| `npm run db:migrate` | Run Prisma development migrations |
| `npm run db:seed` | Seed the development database |

### Web — `@carenest/web`

| Command | Declared action |
|---|---|
| `npm run dev --workspace=@carenest/web` | Start Next.js development server |
| `npm run build --workspace=@carenest/web` | Build Next.js |
| `npm run start --workspace=@carenest/web` | Start the built Next.js server |
| `npm run lint --workspace=@carenest/web` | Invoke the declared `next lint` command |
| `npm run typecheck --workspace=@carenest/web` | Run TypeScript without emitting files |

### API — `@carenest/api`

| Command | Declared action |
|---|---|
| `npm run dev --workspace=@carenest/api` | Start NestJS in watch mode |
| `npm run build --workspace=@carenest/api` | Build NestJS |
| `npm run start --workspace=@carenest/api` | Run `dist/main.js` |
| `npm run lint --workspace=@carenest/api` | Invoke ESLint for API TypeScript |
| `npm run typecheck --workspace=@carenest/api` | Run TypeScript without emitting files |
| `npm run prisma:generate --workspace=@carenest/api` | Generate Prisma using root `.env` |
| `npm run prisma:migrate --workspace=@carenest/api` | Run `prisma migrate dev` |
| `npm run prisma:seed --workspace=@carenest/api` | Run the TypeScript seed |

### Mobile

No npm scripts are declared for Flutter. Use Flutter CLI commands from `apps/mobile`:

```bash
flutter pub get
flutter run
flutter test
flutter analyze
```

`npm run typecheck` has been verified successfully in the current checkout. Lint scripts are declared, but no ESLint configuration and no API ESLint dependency are present.

## API documentation

- Base URL: `http://localhost:4000/api/v1`
- API version in Swagger: `1.0`
- Swagger UI: `http://localhost:4000/docs`
- Authentication scheme: HTTP Bearer JWT

| Endpoint group | Main operations |
|---|---|
| `/auth` | Login and role catalogue |
| `/health` | Service health |
| `/dashboard` | Summary counts |
| `/residents` | List, details, admission, status |
| `/care-plans` | List and create |
| `/medications` | List, details, create, update, stock |
| `/daily-health` | List and create |
| `/tasks` | List, create, status |
| `/shifts` | List, create, status |
| `/staff` | List, details, create, edit, status, guest account |
| `/settings` | Profile, preferences, password, sessions, export |

Pagination is not implemented; list endpoints return arrays. Validation errors use NestJS's standard response shape, normally containing `statusCode`, `message`, and `error`. Messages may be strings or validation-message arrays.

Use Swagger as the source of truth for DTO fields and available operations. Bearer metadata is currently added globally to the OpenAPI definition, although not every controller enforces it.

## Database overview

### Main entities by domain

| Domain | Prisma entities |
|---|---|
| Facility and identity | `Facility`, `Staff`, `UserPreference`, `LoginSession`, `StaffShift` |
| Residents and admissions | `Resident`, `AdmissionProfile` |
| Care and clinical | `CarePlan`, `Medication`, `CareTask`, `DailyHealthReport`, `Observation`, `Incident` |
| Documents | `Document` |

All entities use hard deletes by default; no soft-delete field exists. Most models have creation timestamps, and several include `updatedAt`. Facility relationships exist for residents and staff, but tenancy is not consistently enforced in service queries.

```mermaid
erDiagram
    FACILITY ||--o{ RESIDENT : contains
    FACILITY ||--o{ STAFF : employs
    RESIDENT ||--o| ADMISSION_PROFILE : has
    RESIDENT ||--o{ CARE_PLAN : receives
    RESIDENT ||--o{ MEDICATION : takes
    RESIDENT ||--o{ CARE_TASK : has
    RESIDENT ||--o{ DAILY_HEALTH_REPORT : has
    RESIDENT ||--o{ INCIDENT : has
    RESIDENT ||--o{ OBSERVATION : has
    RESIDENT ||--o{ DOCUMENT : owns
    RESIDENT ||--o{ STAFF : links_guest
    STAFF ||--o{ CARE_TASK : assigned
    STAFF ||--o{ INCIDENT : reports
    STAFF ||--o{ STAFF_SHIFT : works
    STAFF ||--o| USER_PREFERENCE : owns
    STAFF ||--o{ LOGIN_SESSION : opens
```

## Authentication and security

### Implemented controls

- Salted `scrypt` password hashing using Node's `crypto` module.
- Timing-safe password comparison.
- JWT signature verification and eight-hour token expiry.
- Active-staff check at login.
- DTO validation through a global whitelist/transform/forbid-unknown `ValidationPipe`.
- Configurable CORS allow-list; private-network origins are accepted outside production.
- Guest restriction on resident GET endpoints.
- Settings endpoints require JWT authentication.
- Login-session records and user-triggered session revocation records.
- Profile image type and size checks in the web UI.
- Billing receipt type and size checks in the browser UI.

### Not implemented or incomplete

- Refresh tokens and rotation.
- Server-side role/permission guards.
- Database session-revocation checks during JWT authentication.
- Multi-factor authentication enforcement; the settings toggle is informational.
- Rate limiting, account lockout, secure-header middleware, CSRF protection, or centralized server audit logs.
- Server-side file-upload validation and malware scanning.
- Consistent authentication on all controllers.
- Encryption-at-rest configuration, secrets management, monitoring, and backup automation.

> CareNest stores potentially sensitive resident and clinical information. Never use real resident data in public development environments. No claim of HIPAA, GDPR, Australian aged-care, Sri Lankan health-data, or other regulatory compliance is made.

## Testing

No JavaScript/TypeScript unit, integration, API, component, end-to-end, coverage configuration, or test files were found. Flutter includes the SDK `flutter_test` dependency, but no Flutter test files are committed.

Current verification command:

```bash
npm run typecheck
```

Before production use, add:

- API unit and integration tests against an isolated test database.
- Authorization and facility-isolation tests.
- Web component and end-to-end tests.
- Mobile widget and integration tests.
- Coverage reporting in CI.

## Code quality

- TypeScript strictness is provided by the shared configuration.
- `npm run typecheck` runs through Turbo and currently passes.
- API DTOs use `class-validator`; selected web forms use Zod and React Hook Form.
- Lint scripts exist, but ESLint dependencies/configuration are incomplete.
- No Prettier configuration, pre-commit hooks, commit-lint rules, or enforced commit convention was found.

## Screenshots

No screenshot directory or committed screenshots were found.

Suggested captures once anonymized test data is available:

- Login and dashboard
- Residents, resident profile, and admission form
- Care plans, medication, and daily health
- Tasks and shifts, staff, and schedule
- Reports, branches, messages, and settings

Do not include real resident names, medical data, contact information, credentials, tokens, or internal network addresses.

## Deployment

No Vercel, Netlify, Render, Railway, AWS deployment manifest, CI/CD workflow, or application Dockerfile is present. Production deployment is not configured.

A production deployment still needs:

- Separate web and API build/start services.
- Managed PostgreSQL and, if actually used, Redis/object storage.
- A strong `JWT_SECRET` and production environment configuration.
- A migration strategy such as `prisma migrate deploy` after committed migrations exist.
- HTTPS termination, restricted CORS origins, custom domains, logging, monitoring, backups, and secret management.

Do not run `prisma migrate dev` as the production migration command.

## Privacy and data handling

- Never commit `.env` files or production credentials.
- Never store real resident data in seeds or browser-local demonstration stores.
- Use anonymized demonstration data.
- Never expose medical information in screenshots.
- Restrict resident and clinical data by role and facility before production.
- Avoid passwords, tokens, clinical details, and receipt data in logs.
- Secure uploaded documents with private object access, authorization checks, validation, retention, and deletion policies.
- Do not rely on browser `localStorage` for durable or sensitive operational records.

## Browser and device support

No formal browser/device compatibility matrix or test evidence exists. The web UI uses responsive Tailwind layouts and modern browser APIs. Formal desktop, tablet, mobile, assistive-technology, and cross-browser testing is pending.

The Flutter package targets SDK `>=3.4.0 <4.0.0`; platform-specific Firebase files are not included.

## Accessibility

Implemented UI foundations include semantic labels on many controls, visible focus-ring utilities, keyboard-operable native form elements, reduced-motion and contrast preferences, large-text settings, and screen-reader preference controls.

Some accessibility settings change CSS classes, while others are preference surfaces awaiting deeper implementation. The project has not been audited against WCAG and makes no compliance claim.

## Roadmap

The following is a proposed path based on verified repository gaps.

### Phase 1 — Foundation

- Complete server-side authentication, permission guards, session revocation, facility isolation, migrations, linting, tests, and CI.

### Phase 2 — Resident management

- Add rooms/beds, database-backed branches, appointments, incidents, documents, and complete resident lifecycle workflows.

### Phase 3 — Care management

- Add daily-care notes, medication administration records, diagnoses, treatment plans, care-plan review workflows, and clinical alerts.

### Phase 4 — Staff operations

- Add attendance, leave, training, certifications, staff scheduling rules, and mobile authentication.

### Phase 5 — Operational modules

- Move schedule, announcements, visitors, activities, transportation, maintenance, and audit logs to server-backed modules.

### Phase 6 — Finance and inventory

- Add database-backed invoicing, payment-provider integration, receipt storage, inventory, purchase orders, and reconciliation.

### Phase 7 — Communication and family portal

- Add server-backed messaging, notifications, resident-family access controls, and push notification delivery.

### Phase 8 — Production readiness

- Complete automated testing, accessibility review, observability, backup/restore drills, privacy controls, deployment automation, and security assessment.

## Known issues

- Most API controllers are not protected by `JwtAuthGuard`.
- Static role permissions are not enforced by a server-side authorization guard.
- Guest limitations apply to resident reads but not to all API areas.
- Revoked login sessions do not invalidate already-issued JWTs.
- Facility/branch isolation is incomplete.
- Several web mutations call API endpoints without Authorization headers.
- The Flutter resident request does not authenticate and cannot currently call the protected resident list successfully.
- Branches, schedules, announcements, billing, messages, and audit logs use browser-local seed/demo data.
- The audit terminal describes its store as immutable, but the data is editable browser storage.
- S3 and Redis clients are registered but unused.
- `STORAGE_DRIVER` and `S3_BUCKET` are declared but not consumed by feature code.
- Profile pictures are stored as data URLs instead of object-storage references.
- There are no committed Prisma migrations.
- There are no automated tests or CI workflows.
- Lint scripts are present without complete lint configuration/dependencies.
- The login page contains development credentials for quick role selection.
- The checkout's `.git` path is not recognized as a valid Git repository.

## Future enhancements

Possible future work, not currently implemented:

- Family portal beyond the restricted guest resident view.
- Complete mobile caregiver application with offline support.
- Real-time alerts, chat, and presence.
- Wearable-device and vital-sign integrations.
- Advanced analytics and configurable dashboards.
- AI-assisted care summaries with clinical review safeguards.
- Predictive health alerts with validated models and human oversight.
- Multi-language interface support.

## Contributing

1. Create a focused branch from the agreed base branch.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and use development-only values.
4. Start infrastructure with `docker compose up -d`.
5. Run database generation, migration, and seeding commands.
6. Implement the smallest focused change.
7. Run `npm run typecheck` and relevant tests when they exist.
8. Never commit real resident data, secrets, tokens, receipts, or clinical screenshots.
9. Commit, push, and open a pull request explaining behavior, validation, schema impact, and privacy/security considerations.

## Git workflow

No branch convention is configured. Recommended:

- `feature/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `chore/<short-description>`

Keep pull requests small, avoid mixing generated files with source changes, and explicitly call out database migrations or security-sensitive changes.

## Commit convention

No commit convention is enforced. Conventional Commits are recommended:

```text
feat(residents): add admission status filter
fix(auth): reject revoked login sessions
docs(readme): document local infrastructure
```

## License

No license has been specified. Without a license, repository use, modification, and distribution rights are not automatically granted.

## Author and contact

**Dushan Abeywardana**

- GitHub: [DushanSenura](https://github.com/DushanSenura)
- LinkedIn: [dushan-abeywardana-446235356](https://www.linkedin.com/in/dushan-abeywardana-446235356/)
- Portfolio: [portfolio-wheat-two-52.vercel.app](https://portfolio-wheat-two-52.vercel.app/)

CareNest branding and system development attribution: **NovaCore Techs**.

## Acknowledgements

CareNest currently uses:

- [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/) and [PostgreSQL](https://www.postgresql.org/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), and [Lucide](https://lucide.dev/)
- [Redis](https://redis.io/) and [MinIO](https://min.io/) infrastructure images
- [Flutter](https://flutter.dev/), [Riverpod](https://riverpod.dev/), [Dio](https://pub.dev/packages/dio), and Firebase packages
