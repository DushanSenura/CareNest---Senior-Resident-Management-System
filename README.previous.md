# CareNest

CareNest is a senior resident management platform for residential care facilities. It combines resident records, care plans, medication tracking, incidents, staff assignments, family communication, documents, and operational reporting.

## Applications

- `apps/web` — Next.js operations portal
- `apps/api` — NestJS REST API, Swagger, Prisma and Redis
- `apps/mobile` — Flutter staff companion using Riverpod, Dio and FCM
- `packages/config` — shared TypeScript configuration

## Local setup

1. Copy `.env.example` to `.env` and `apps/api/.env`.
2. Start services with `docker compose up -d`.
3. Install dependencies with `npm install`.
4. Run `npm run db:generate`, `npm run db:migrate`, then `npm run db:seed`.
5. Start web and API with `npm run dev`.
6. Open `http://localhost:3000`; Swagger is at `http://localhost:4000/docs`.

The storage service uses the S3 protocol, so AWS S3, Cloudflare R2, Supabase Storage and local MinIO can be selected through environment variables without changing application code.

| Role | Email | Temporary password |
|---|---|---|
| Super Admin | `superadmin@carenest.local` | `SuperAdmin@123` |
| Admin | `admin@carenest.local` | `Admin@123` |
| Care Manager | `caremanager@carenest.local` | `CareManager@123` |
| Caregiver | `caregiver@carenest.local` | `Caregiver@123` |
| Nurse | `nurse.account@carenest.local` | `Nurse@123` |
| Doctor | `doctor@carenest.local` | `Doctor@123` |
| HR Manager | `hr@carenest.local` | `HRManager@123` |
