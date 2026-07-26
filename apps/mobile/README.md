# CareNest Staff Mobile

Flutter companion application for CareNest senior residence staff. It uses Riverpod for state, Dio for REST communication, secure device storage for staff sessions, and the existing NestJS API.

## Implemented mobile workflows

- Staff email/password login and secure session restoration
- Development shortcuts for Caregiver, Nurse, Care Manager, Doctor, HR Manager, and Admin accounts
- Shift dashboard with resident, task, completion, and incident metrics
- Resident search, status filters, clinical alerts, details, and medication
- Care-task filters with start and completion actions
- Daily-health report list and mobile health-check form
- Medication and low-stock register
- Staff profile, branch details, and logout
- Light and dark system themes

Messages are shown as unavailable until a server messaging API exists.

## API configuration

Android Emulator uses the default:

```text
http://10.0.2.2:4000/api/v1
```

For a physical device, run the API on the same network and supply the computer's LAN address:

```bash
flutter run --dart-define=API_URL=http://192.168.1.10:4000/api/v1
```

For Flutter web or Windows:

```bash
flutter run -d chrome --dart-define=API_URL=http://localhost:4000/api/v1
```

The API CORS configuration permits local-network development origins outside production.

## Run

From `apps/mobile`:

```bash
flutter pub get
flutter run
```

The CareNest API, PostgreSQL database, and seeded staff accounts must be available. From the repository root:

```bash
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## Validate

```bash
dart format --output=none --set-exit-if-changed lib test
flutter analyze
flutter test
```

## Production notes

- Remove development credential shortcuts before release.
- Use HTTPS for the production API.
- Configure platform signing and production application identifiers.
- Configure Firebase separately before adding push-notification delivery.
- The current API still requires server-side RBAC and broader authentication hardening.
