import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('QueuePlus Home'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Frontend started successfully',
                style: TextStyle(fontSize: 20),
              ),
              const SizedBox(height: 16),
              Text('User: ${user?['email'] ?? 'Unknown'}'),
              const SizedBox(height: 8),
              Text('Raw data: $user'),
            ],
          ),
        ),
      ),
    );
  }
}