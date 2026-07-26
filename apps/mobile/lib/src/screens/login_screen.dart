import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../app.dart';
import '../state/session.dart';
import '../theme.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _showPassword = false;

  static const _accounts = [
    ('Caregiver', 'caregiver@carenest.local', 'Caregiver@123'),
    ('Nurse', 'nurse.account@carenest.local', 'Nurse@123'),
    ('Care Manager', 'caremanager@carenest.local', 'CareManager@123'),
    ('Doctor', 'doctor@carenest.local', 'Doctor@123'),
    ('HR Manager', 'hr@carenest.local', 'HRManager@123'),
    ('Admin', 'admin@carenest.local', 'Admin@123'),
  ];

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(sessionProvider);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: CareNestMark(size: 68),
                    ),
                    const SizedBox(height: 28),
                    Text(
                      'Welcome to CareNest',
                      style: Theme.of(context).textTheme.headlineMedium
                          ?.copyWith(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Sign in with your staff account to begin your shift.',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: CareNestColors.sage,
                      ),
                    ),
                    const SizedBox(height: 28),
                    TextFormField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [AutofillHints.email],
                      decoration: const InputDecoration(
                        labelText: 'Email address',
                        prefixIcon: Icon(Icons.mail_outline),
                      ),
                      validator: (value) {
                        if (value == null || !value.contains('@')) {
                          return 'Enter a valid email address';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _password,
                      obscureText: !_showPassword,
                      autofillHints: const [AutofillHints.password],
                      decoration: InputDecoration(
                        labelText: 'Password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          onPressed: () =>
                              setState(() => _showPassword = !_showPassword),
                          icon: Icon(
                            _showPassword
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                          ),
                        ),
                      ),
                      validator: (value) => (value?.length ?? 0) < 8
                          ? 'Password must contain at least 8 characters'
                          : null,
                    ),
                    if (session.error != null) ...[
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: CareNestColors.coral.withValues(alpha: .12),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Text(
                          session.error!,
                          style: const TextStyle(color: CareNestColors.coral),
                        ),
                      ),
                    ],
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: session.signingIn
                          ? null
                          : () async {
                              if (!_formKey.currentState!.validate()) return;
                              await ref
                                  .read(sessionProvider.notifier)
                                  .login(_email.text, _password.text);
                            },
                      child: session.signingIn
                          ? const SizedBox.square(
                              dimension: 22,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Sign in'),
                    ),
                    const SizedBox(height: 28),
                    Text(
                      'Development staff accounts',
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _accounts
                          .map(
                            (account) => ActionChip(
                              avatar: const Icon(
                                Icons.badge_outlined,
                                size: 17,
                              ),
                              label: Text(account.$1),
                              onPressed: () {
                                _email.text = account.$2;
                                _password.text = account.$3;
                              },
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'CareNest Staff · Secure resident care workspace',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        color: CareNestColors.sage,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
