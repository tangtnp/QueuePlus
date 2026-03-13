import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';

class AuthService {
  final Dio _dio = ApiClient.dio;

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
    );

    if (response.data is Map<String, dynamic>) {
      return Map<String, dynamic>.from(response.data as Map);
    }

    return {'message': 'Login success'};
  }

  Future<Map<String, dynamic>> getMe() async {
    final response = await _dio.get('/auth/me');

    if (response.data is Map<String, dynamic>) {
      return Map<String, dynamic>.from(response.data as Map);
    }

    return {};
  }

  Future<void> logout() async {
    await _dio.post('/auth/logout');
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    final response = await _dio.post(
      '/auth/register',
      data: {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      },
    );

    if (response.data is Map<String, dynamic>) {
      return Map<String, dynamic>.from(response.data as Map);
    }

    return {'message': 'Register success'};
  }
}