import 'package:dio/dio.dart';

import 'models.dart';

const apiBaseUrl = String.fromEnvironment(
  'API_URL',
  defaultValue: 'http://10.0.2.2:4000/api/v1',
);

class CareNestApi {
  CareNestApi()
    : _dio = Dio(
        BaseOptions(
          baseUrl: apiBaseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 15),
          headers: const {'content-type': 'application/json'},
        ),
      );

  final Dio _dio;
  String? _accessToken;

  void setAccessToken(String? token) {
    _accessToken = token;
  }

  Options get _authorized => Options(
    headers: _accessToken == null
        ? null
        : {'authorization': 'Bearer $_accessToken'},
  );

  Future<LoginResult> login(String email, String password) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {'email': email.trim().toLowerCase(), 'password': password},
      );
      final result = LoginResult.fromJson(response.data!);
      setAccessToken(result.accessToken);
      return result;
    } on DioException catch (error) {
      throw ApiException.fromDio(error, fallback: 'Unable to sign in.');
    }
  }

  Future<StaffAccount> profile() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/settings',
        options: _authorized,
      );
      return StaffAccount.fromJson(response.data!);
    } on DioException catch (error) {
      throw ApiException.fromDio(
        error,
        fallback: 'Unable to load your profile.',
      );
    }
  }

  Future<DashboardSummary> summary() async {
    final response = await _request<Map<String, dynamic>>('/dashboard/summary');
    return DashboardSummary.fromJson(response);
  }

  Future<List<Resident>> residents() async {
    final response = await _request<List<dynamic>>('/residents');
    return response
        .map((item) => Resident.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<Resident> resident(String id) async {
    final response = await _request<Map<String, dynamic>>('/residents/$id');
    return Resident.fromJson(response);
  }

  Future<List<CareTask>> tasks() async {
    final response = await _request<List<dynamic>>('/tasks');
    return response
        .map((item) => CareTask.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> updateTaskStatus(String id, String status) async {
    await _request<Map<String, dynamic>>(
      '/tasks/$id/status',
      method: 'PATCH',
      data: {'status': status},
    );
  }

  Future<List<Medication>> medications() async {
    final response = await _request<List<dynamic>>('/medications');
    return response
        .map((item) => Medication.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<DailyHealthRecord>> healthReports({String? date}) async {
    final query = date == null ? '' : '?date=$date';
    final response = await _request<List<dynamic>>('/daily-health$query');
    return response
        .map((item) => DailyHealthRecord.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> createHealthReport(Map<String, dynamic> data) async {
    await _request<Map<String, dynamic>>(
      '/daily-health',
      method: 'POST',
      data: data,
    );
  }

  Future<T> _request<T>(
    String path, {
    String method = 'GET',
    Object? data,
  }) async {
    try {
      final response = await _dio.request<T>(
        path,
        data: data,
        options: _authorized.copyWith(method: method),
      );
      return response.data as T;
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }
}

class ApiException implements Exception {
  const ApiException(this.message);
  final String message;

  factory ApiException.fromDio(
    DioException error, {
    String fallback = 'CareNest could not complete this request.',
  }) {
    final data = error.response?.data;
    if (data is Map<String, dynamic>) {
      final value = data['message'];
      if (value is String && value.isNotEmpty) return ApiException(value);
      if (value is List && value.isNotEmpty) {
        return ApiException(value.map((item) => item.toString()).join('\n'));
      }
    }
    if (error.type == DioExceptionType.connectionError ||
        error.type == DioExceptionType.connectionTimeout) {
      return const ApiException(
        'Cannot reach the CareNest server. Check the API address and connection.',
      );
    }
    return ApiException(fallback);
  }

  @override
  String toString() => message;
}
