import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/branch_model.dart';
import '../../data/services/branch_service.dart';

final branchServiceProvider = Provider<BranchService>((ref) {
  return BranchService();
});

final branchListProvider = FutureProvider<List<BranchModel>>((ref) async {
  final service = ref.read(branchServiceProvider);
  return service.getBranches();
});