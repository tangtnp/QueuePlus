import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/services/auth_service.dart';

enum AuthStatus {
  initial,
  loading,
  authenticated,
  unauthenticated,
}

class AuthState {
  final AuthStatus status;
  final Map<String, dynamic>? user;
  final String? errorMessage;

  const AuthState({
    required this.status,
    this.user,
    this.errorMessage,
  });

  factory AuthState.initial() {
    return const AuthState(status: AuthStatus.initial);
  }

  AuthState copyWith({
    AuthStatus? status,
    Map<String, dynamic>? user,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage,
    );
  }
}

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    return AuthState.initial();
  }

  AuthService get _authService => ref.read(authServiceProvider);

  /// check existing login session
  Future<void> checkAuth() async {
    state = state.copyWith(
      status: AuthStatus.loading,
      errorMessage: null,
    );

    try {
      final user = await _authService.getMe();

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
        errorMessage: null,
      );
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        /// normal case when user not logged in
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          user: null,
          errorMessage: null,
        );
        return;
      }

      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        user: null,
        errorMessage: 'Session check failed',
      );
    } catch (_) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        user: null,
        errorMessage: 'Session check failed',
      );
    }
  }

  /// login with email + password
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(
      status: AuthStatus.loading,
      errorMessage: null,
    );

    try {
      /// Step 1: login
      await _authService.login(
        email: email,
        password: password,
      );

      /// Step 2: get user from session cookie
      final user = await _authService.getMe();

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
        errorMessage: null,
      );

      return true;
    } on DioException catch (e) {
      final code = e.response?.statusCode;

      if (code == 401) {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          user: null,
          errorMessage: 'Invalid email or password',
        );
        return false;
      }

      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        user: null,
        errorMessage: 'Login failed (${code ?? "unknown"})',
      );

      return false;
    } catch (_) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        user: null,
        errorMessage: 'Login failed',
      );

      return false;
    }
  }

  /// logout locally
  void logoutLocal() {
    state = state.copyWith(
      status: AuthStatus.unauthenticated,
      user: null,
      errorMessage: null,
    );
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);