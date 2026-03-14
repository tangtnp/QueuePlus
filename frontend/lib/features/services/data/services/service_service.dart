import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../models/service_model.dart';

class ServiceService {
  final Dio _dio = ApiClient.dio;

  Future<List<ServiceModel>> getServicesByBranch(String branchId) async {
    final response = await _dio.get(
      '/services',
      queryParameters: {
        'branchId': branchId,
      },
    );

    final data = response.data;

    if (data is List) {
      return data
          .map((item) => ServiceModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    if (data is Map<String, dynamic>) {
      if (data['data'] is List) {
        return (data['data'] as List)
            .map((item) => ServiceModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    }

    return [];
  }
}