import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/service_model.dart';
import '../../data/services/service_service.dart';

final serviceServiceProvider = Provider<ServiceService>((ref) {
  return ServiceService();
});

final serviceListProvider =
    FutureProvider.family<List<ServiceModel>, String>((ref, branchId) async {
  final service = ref.read(serviceServiceProvider);
  return service.getServicesByBranch(branchId);
});