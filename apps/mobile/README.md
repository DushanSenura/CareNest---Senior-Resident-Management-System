# CareNest Mobile

Run with `flutter run --dart-define=API_URL=http://10.0.2.2:4000/api/v1`.

Add the platform Firebase files using FlutterFire before enabling push notifications. The dependency and initialization boundary are already included; notification registration should occur after authentication so device tokens can be associated with a staff member.
