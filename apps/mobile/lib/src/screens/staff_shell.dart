import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../state/session.dart';
import '../theme.dart';
import 'daily_health_screen.dart';
import 'dashboard_screen.dart';
import 'module_screen.dart';
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

  static const _items = <_MobileDestination>[
    _MobileDestination('Home', Icons.home_outlined, DashboardScreen()),
    _MobileDestination('Residents', Icons.people_outline, ResidentsScreen()),
    _MobileDestination(
      'Care plans',
      Icons.volunteer_activism_outlined,
      MobileModules.carePlans,
    ),
    _MobileDestination(
      'Medication',
      Icons.medication_outlined,
      MedicationScreen(),
    ),
    _MobileDestination('Tasks', Icons.checklist_outlined, TasksScreen()),
    _MobileDestination('Staff', Icons.badge_outlined, MobileModules.staff),
    _MobileDestination(
      'Daily health',
      Icons.monitor_heart_outlined,
      DailyHealthScreen(),
    ),
    _MobileDestination(
      'Schedule',
      Icons.calendar_month_outlined,
      MobileModules.schedule,
    ),
    _MobileDestination(
      'Reports',
      Icons.analytics_outlined,
      MobileModules.reports,
    ),
    _MobileDestination(
      'Branches',
      Icons.apartment_outlined,
      MobileModules.branches,
    ),
    _MobileDestination(
      'Announcements',
      Icons.campaign_outlined,
      MobileModules.announcements,
    ),
    _MobileDestination(
      'Audit logs',
      Icons.policy_outlined,
      MobileModules.auditLogs,
    ),
    _MobileDestination(
      'Billing',
      Icons.receipt_long_outlined,
      MobileModules.billing,
    ),
    _MobileDestination(
      'Accounts',
      Icons.manage_accounts_outlined,
      MobileModules.accounts,
    ),
    _MobileDestination(
      'Messages',
      Icons.chat_bubble_outline,
      MobileModules.messages,
    ),
    _MobileDestination('Settings', Icons.settings_outlined, WorkspaceScreen()),
  ];

  @override
  Widget build(BuildContext context) {
    final account = ref.watch(sessionProvider).account!;
    final item = _items[_index];
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              item.label == 'Home' ? _greeting(account.firstName) : item.label,
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
      body: KeyedSubtree(key: ValueKey(item.label), child: item.page),
      bottomNavigationBar: _ScrollableFeatureBar(
        items: _items,
        selectedIndex: _index,
        select: (value) => setState(() => _index = value),
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

class _ScrollableFeatureBar extends StatefulWidget {
  const _ScrollableFeatureBar({
    required this.items,
    required this.selectedIndex,
    required this.select,
  });

  final List<_MobileDestination> items;
  final int selectedIndex;
  final ValueChanged<int> select;

  @override
  State<_ScrollableFeatureBar> createState() => _ScrollableFeatureBarState();
}

class _ScrollableFeatureBarState extends State<_ScrollableFeatureBar> {
  final _controller = ScrollController();

  @override
  void didUpdateWidget(covariant _ScrollableFeatureBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedIndex != widget.selectedIndex) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!_controller.hasClients) return;
        final target =
            (widget.selectedIndex * 84.0) -
            (MediaQuery.sizeOf(context).width / 2) +
            42;
        _controller.animateTo(
          target.clamp(0, _controller.position.maxScrollExtent),
          duration: const Duration(milliseconds: 260),
          curve: Curves.easeOut,
        );
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return SafeArea(
      top: false,
      child: Container(
        height: 78,
        decoration: BoxDecoration(
          color: scheme.surfaceContainerLowest,
          border: Border(top: BorderSide(color: scheme.outlineVariant)),
        ),
        child: Scrollbar(
          controller: _controller,
          thumbVisibility: false,
          child: ListView.builder(
            controller: _controller,
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
            itemCount: widget.items.length,
            itemBuilder: (context, index) {
              final item = widget.items[index];
              final selected = index == widget.selectedIndex;
              return Semantics(
                selected: selected,
                button: true,
                label: item.label,
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => widget.select(index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    width: 84,
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      color: selected ? scheme.primaryContainer : null,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          item.icon,
                          size: 23,
                          color: selected
                              ? scheme.onPrimaryContainer
                              : CareNestColors.sage,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.label,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: selected
                                ? FontWeight.w800
                                : FontWeight.w600,
                            color: selected
                                ? scheme.onPrimaryContainer
                                : scheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class _MobileDestination {
  const _MobileDestination(this.label, this.icon, this.page);
  final String label;
  final IconData icon;
  final Widget page;
}
