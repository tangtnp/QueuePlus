import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('QueuePlus Home'),
      ),
      body: const Center(
        child: Text(
          'Frontend started successfully',
          style: TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}