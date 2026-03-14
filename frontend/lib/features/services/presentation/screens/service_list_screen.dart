import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/service_provider.dart';

class ServiceListScreen extends ConsumerWidget {
  final String branchId;
  final String branchName;

  const ServiceListScreen({
    super.key,
    required this.branchId,
    required this.branchName,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final serviceAsync = ref.watch(serviceListProvider(branchId));

    return Scaffold(
      appBar: AppBar(
        title: Text('Services - $branchName'),
      ),
      body: serviceAsync.when(
        data: (services) {
          if (services.isEmpty) {
            return const Center(
              child: Text('No services found'),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: services.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final service = services[index];

              return Card(
                child: ListTile(
                  title: Text(service.name),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (service.description != null &&
                          service.description!.isNotEmpty)
                        Text(service.description!),
                      if (service.durationMinutes != null)
                        Text('Duration: ${service.durationMinutes} min'),
                    ],
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Selected service: ${service.name}'),
                      ),
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
              'Failed to load services\n$error',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red),
            ),
          ),
        ),
      ),
    );
  }
}