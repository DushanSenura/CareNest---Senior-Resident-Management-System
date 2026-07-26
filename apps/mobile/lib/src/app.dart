import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'screens/login_screen.dart';
import 'screens/staff_shell.dart';
import 'state/session.dart';
import 'theme.dart';

class CareNestApp extends ConsumerWidget {
  const CareNestApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(sessionProvider);
    return MaterialApp(
      title: 'CareNest Staff',
      debugShowCheckedModeBanner: false,
      theme: CareNestTheme.light,
      darkTheme: CareNestTheme.dark,
      themeMode: ThemeMode.system,
      home: session.restoring
          ? const _LaunchScreen()
          : session.account == null
          ? const LoginScreen()
          : const StaffShell(),
    );
  }
}

class _LaunchScreen extends StatelessWidget {
  const _LaunchScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CareNestMark(size: 72),
            SizedBox(height: 24),
            CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}

class CareNestMark extends StatelessWidget {
  const CareNestMark({super.key, this.size = 52});
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: CareNestColors.forest,
        borderRadius: BorderRadius.circular(size * .3),
      ),
      child: Icon(
        Icons.monitor_heart_outlined,
        color: Colors.white,
        size: size * .55,
      ),
    );
  }
}
