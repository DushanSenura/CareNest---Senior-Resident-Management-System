import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../state/session.dart';
import '../theme.dart';
import '../widgets/common.dart';

class WorkspaceScreen extends ConsumerWidget {
  const WorkspaceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final account = ref.watch(sessionProvider).account!;
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                CircleAvatar(radius: 30, child: Text(account.initials)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        account.fullName,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(account.role),
                      Text(
                        account.employeeId ?? account.email,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        const SectionHeading('Clinical workspace'),
        const SizedBox(height: 8),
        Card(
          child: Column(
            children: [
              ListTile(
                leading: const Icon(Icons.medication_outlined),
                title: const Text('Medication register'),
                subtitle: const Text('Review resident medicine and stock'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const MedicationScreen()),
                ),
              ),
              const Divider(height: 1),
              const ListTile(
                leading: Icon(Icons.chat_bubble_outline),
                title: Text('Team messages'),
                subtitle: Text('Mobile messaging API is not configured yet'),
                trailing: StatusPill('coming soon'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        const SectionHeading('Account'),
        const SizedBox(height: 8),
        Card(
          child: Column(
            children: [
              _ProfileRow('Email', account.email),
              _ProfileRow('Department', account.department ?? 'Not assigned'),
              _ProfileRow('Branch', account.branch ?? 'Not assigned'),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.logout, color: CareNestColors.coral),
                title: const Text(
                  'Sign out',
                  style: TextStyle(color: CareNestColors.coral),
                ),
                onTap: () => _confirmLogout(context, ref),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        const Text(
          'CareNest Staff\nCopyright © 2026 NovaCore Techs',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 11, color: CareNestColors.sage),
        ),
      ],
    );
  }

  Future<void> _confirmLogout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign out?'),
        content: const Text(
          'Your secure session will be removed from this device.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Sign out'),
          ),
        ],
      ),
    );
    if (confirmed == true) await ref.read(sessionProvider.notifier).logout();
  }
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(label, style: Theme.of(context).textTheme.labelMedium),
      trailing: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 210),
        child: Text(
          value,
          textAlign: TextAlign.end,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}

class MedicationScreen extends ConsumerStatefulWidget {
  const MedicationScreen({super.key});

  @override
  ConsumerState<MedicationScreen> createState() => _MedicationScreenState();
}

class _MedicationScreenState extends ConsumerState<MedicationScreen> {
  String _query = '';
  bool _lowStockOnly = false;

  @override
  Widget build(BuildContext context) {
    final result = ref.watch(medicationsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Medication')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    onChanged: (value) => setState(() => _query = value),
                    decoration: const InputDecoration(
                      hintText: 'Search medicine or resident',
                      prefixIcon: Icon(Icons.search),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                FilterChip(
                  selected: _lowStockOnly,
                  onSelected: (value) => setState(() => _lowStockOnly = value),
                  label: const Text('Low stock'),
                ),
              ],
            ),
          ),
          Expanded(
            child: result.when(
              data: (items) {
                final query = _query.toLowerCase().trim();
                final filtered = items.where((item) {
                  return (!_lowStockOnly || item.lowStock) &&
                      (query.isEmpty ||
                          item.name.toLowerCase().contains(query) ||
                          (item.residentName ?? '').toLowerCase().contains(
                            query,
                          ));
                }).toList();
                if (filtered.isEmpty) {
                  return const EmptyState(
                    icon: Icons.medication_outlined,
                    title: 'No medication found',
                    message: 'Try another search or stock filter.',
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 6, 16, 28),
                  itemCount: filtered.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final item = filtered[index];
                    return Card(
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        leading: CircleAvatar(
                          backgroundColor: item.lowStock
                              ? CareNestColors.coral.withValues(alpha: .14)
                              : CareNestColors.mint,
                          child: Icon(
                            Icons.medication_outlined,
                            color: item.lowStock
                                ? CareNestColors.coral
                                : CareNestColors.forest,
                          ),
                        ),
                        title: Text(
                          item.name,
                          style: const TextStyle(fontWeight: FontWeight.w800),
                        ),
                        subtitle: Text(
                          '${item.dosage} · ${item.frequency ?? '—'}\n'
                          '${item.residentName ?? 'No resident'} · Room ${item.room ?? '—'}',
                        ),
                        isThreeLine: true,
                        trailing: item.stockQuantity == null
                            ? null
                            : Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    '${item.stockQuantity}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      color: item.lowStock
                                          ? CareNestColors.coral
                                          : null,
                                    ),
                                  ),
                                  Text(
                                    item.stockUnit ?? '',
                                    style: Theme.of(
                                      context,
                                    ).textTheme.labelSmall,
                                  ),
                                ],
                              ),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => ErrorState(
                message: error.toString(),
                retry: () => ref.invalidate(medicationsProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
