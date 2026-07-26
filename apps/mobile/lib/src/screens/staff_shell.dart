import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../state/session.dart';
import 'dashboard_screen.dart';
import 'daily_health_screen.dart';
import 'residents_screen.dart';
import 'tasks_screen.dart';
import 'workspace_screen.dart';

class StaffShell extends ConsumerStatefulWidget {
  const StaffShell({super.key});

  @override
  ConsumerState<StaffShell> createState() => _StaffShellState();
}

class _StaffShellState extends ConsumerState<StaffShell> {
  int _index = 0;

  static const _pages = [
    DashboardScreen(),
    ResidentsScreen(),
    TasksScreen(),
    DailyHealthScreen(),
    WorkspaceScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final account = ref.watch(sessionProvider).account!;
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _greeting(account.firstName),
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
            Text(
              '${account.role} · ${account.branch ?? 'CareNest'}',
              style: Theme.of(context).textTheme.labelSmall,
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _refresh,
            icon: const Icon(Icons.refresh),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: CircleAvatar(child: Text(account.initials)),
          ),
        ],
      ),
      body: IndexedStack(index: _index, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people),
            label: 'Residents',
          ),
          NavigationDestination(
            icon: Icon(Icons.checklist_outlined),
            selectedIcon: Icon(Icons.checklist),
            label: 'Tasks',
          ),
          NavigationDestination(
            icon: Icon(Icons.monitor_heart_outlined),
            selectedIcon: Icon(Icons.monitor_heart),
            label: 'Health',
          ),
          NavigationDestination(
            icon: Icon(Icons.grid_view_outlined),
            selectedIcon: Icon(Icons.grid_view),
            label: 'More',
          ),
        ],
      ),
    );
  }

  void _refresh() {
    ref.invalidate(summaryProvider);
    ref.invalidate(residentsProvider);
    ref.invalidate(tasksProvider);
    ref.invalidate(healthReportsProvider);
    ref.invalidate(medicationsProvider);
  }

  String _greeting(String name) {
    final hour = DateTime.now().hour;
    final period = hour < 12
        ? 'Good morning'
        : hour < 17
        ? 'Good afternoon'
        : 'Good evening';
    return '$period, $name';
  }
}
