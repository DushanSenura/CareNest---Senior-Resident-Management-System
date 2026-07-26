import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../data/api_client.dart';
import '../data/models.dart';

final apiProvider = Provider<CareNestApi>((ref) => CareNestApi());

final sessionProvider = StateNotifierProvider<SessionController, SessionState>(
  (ref) => SessionController(ref.read(apiProvider)),
);

class SessionState {
  const SessionState({
    this.account,
    this.permissions = const [],
    this.restoring = true,
    this.signingIn = false,
    this.mustChangePassword = false,
    this.error,
  });

  final StaffAccount? account;
  final List<String> permissions;
  final bool restoring;
  final bool signingIn;
  final bool mustChangePassword;
  final String? error;

  SessionState copyWith({
    StaffAccount? account,
    List<String>? permissions,
    bool? restoring,
    bool? signingIn,
    bool? mustChangePassword,
    String? error,
    bool clearAccount = false,
    bool clearError = false,
  }) => SessionState(
    account: clearAccount ? null : account ?? this.account,
    permissions: permissions ?? this.permissions,
    restoring: restoring ?? this.restoring,
    signingIn: signingIn ?? this.signingIn,
    mustChangePassword: mustChangePassword ?? this.mustChangePassword,
    error: clearError ? null : error ?? this.error,
  );
}

class SessionController extends StateNotifier<SessionState> {
  SessionController(this._api) : super(const SessionState()) {
    restore();
  }

  // This constructor avoids secure-storage restoration in widget tests.
  // ignore: use_super_parameters
  SessionController.forTest(SessionState initial)
    : _api = CareNestApi(),
      super(initial);

  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'carenest_access_token';
  static const _accountKey = 'carenest_staff_account';
  static const _permissionsKey = 'carenest_permissions';

  final CareNestApi _api;

  Future<void> restore() async {
    try {
      final values = await Future.wait([
        _storage.read(key: _tokenKey),
        _storage.read(key: _accountKey),
        _storage.read(key: _permissionsKey),
      ]);
      final token = values[0];
      final accountJson = values[1];
      if (token == null || accountJson == null) {
        state = state.copyWith(restoring: false);
        return;
      }
      _api.setAccessToken(token);
      final cached = StaffAccount.fromJson(
        jsonDecode(accountJson) as Map<String, dynamic>,
      );
      final permissions = values[2] == null
          ? <String>[]
          : (jsonDecode(values[2]!) as List<dynamic>)
                .map((item) => item.toString())
                .toList();
      state = SessionState(
        account: cached,
        permissions: permissions,
        restoring: false,
      );
      try {
        final fresh = await _api.profile();
        state = state.copyWith(account: fresh);
        await _storage.write(
          key: _accountKey,
          value: jsonEncode(fresh.toJson()),
        );
      } catch (_) {
        // Cached session remains usable until an API request confirms expiry.
      }
    } catch (_) {
      await logout();
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(signingIn: true, clearError: true);
    try {
      final result = await _api.login(email, password);
      await Future.wait([
        _storage.write(key: _tokenKey, value: result.accessToken),
        _storage.write(
          key: _accountKey,
          value: jsonEncode(result.account.toJson()),
        ),
        _storage.write(
          key: _permissionsKey,
          value: jsonEncode(result.permissions),
        ),
      ]);
      state = SessionState(
        account: result.account,
        permissions: result.permissions,
        restoring: false,
        mustChangePassword: result.mustChangePassword,
      );
      return true;
    } catch (error) {
      state = state.copyWith(
        signingIn: false,
        restoring: false,
        error: error.toString(),
      );
      return false;
    }
  }

  Future<void> logout() async {
    _api.setAccessToken(null);
    await _storage.deleteAll();
    state = const SessionState(restoring: false);
  }
}

final residentsProvider = FutureProvider<List<Resident>>(
  (ref) => ref.read(apiProvider).residents(),
);

final residentDetailProvider = FutureProvider.autoDispose
    .family<Resident, String>((ref, id) => ref.read(apiProvider).resident(id));

final tasksProvider = FutureProvider<List<CareTask>>(
  (ref) => ref.read(apiProvider).tasks(),
);

final medicationsProvider = FutureProvider<List<Medication>>(
  (ref) => ref.read(apiProvider).medications(),
);

final healthReportsProvider = FutureProvider<List<DailyHealthRecord>>(
  (ref) => ref.read(apiProvider).healthReports(),
);

final summaryProvider = FutureProvider<DashboardSummary>(
  (ref) => ref.read(apiProvider).summary(),
);
