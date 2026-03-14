import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../models/branch_model.dart';

class BranchService {
  final Dio _dio = ApiClient.dio;

  Future<List<BranchModel>> getBranches() async {
    final response = await _dio.get('/branches');

    final data = response.data;

    if (data is List) {
      return data
          .map((item) => BranchModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    if (data is Map<String, dynamic>) {
      if (data['data'] is List) {
        return (data['data'] as List)
            .map((item) => BranchModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    }

    return [];
  }
}