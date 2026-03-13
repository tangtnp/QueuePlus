import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:frontend1/features/auth/presentation/providers/auth_provider.dart';
import 'package:frontend1/features/auth/presentation/screens/login_screen.dart';
import 'package:frontend1/features/auth/presentation/screens/splash_screen.dart';
import 'package:frontend1/features/home/presentation/screens/home_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final location = state.matchedLocation;
      final isLoading = authState.status == AuthStatus.initial ||
          authState.status == AuthStatus.loading;
      final isAuthenticated = authState.status == AuthStatus.authenticated;

      if (isLoading) {
        return location == '/splash' ? null : '/splash';
      }

      if (!isAuthenticated) {
        return location == '/login' ? null : '/login';
      }

      if (location == '/login' || location == '/splash') {
        return '/home';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
    ],
  );
});