import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/branch_provider.dart';

class BranchListScreen extends ConsumerWidget {
  const BranchListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final branchAsync = ref.watch(branchListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Branch'),
      ),
      body: branchAsync.when(
        data: (branches) {
          if (branches.isEmpty) {
            return const Center(
              child: Text('No branches found'),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: branches.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final branch = branches[index];

              return Card(
                child: ListTile(
                  title: Text(branch.name),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (branch.description != null &&
                          branch.description!.isNotEmpty)
                        Text(branch.description!),
                      if (branch.address != null &&
                          branch.address!.isNotEmpty)
                        Text(branch.address!),
                    ],
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    context.go(
                      '/branches/${branch.id}/services',
                      extra: branch.name,
                    );
                  },
                ),
              );
            },
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, stackTrace) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Failed to load branches\n$error',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red),
            ),
          ),
        ),
      ),
    );
  }
}