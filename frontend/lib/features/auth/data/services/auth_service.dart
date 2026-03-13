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
      return response.data as Map<String, dynamic>;
    }

    return {};
  }
}