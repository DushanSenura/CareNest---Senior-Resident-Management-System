import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../data/models.dart';
import '../state/session.dart';
import '../theme.dart';
import '../widgets/common.dart';

class ModuleScreen extends ConsumerWidget {
  const ModuleScreen({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    this.operationsModule,
    this.apiPath,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final String? operationsModule;
  final String? apiPath;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final operations = operationsModule;
    final asyncItems = operations != null
        ? ref.watch(operationalRecordsProvider(operations))
        : ref.watch(apiRecordsProvider(apiPath!));
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: operations == null
          ? null
          : FloatingActionButton.extended(
              onPressed: () => _create(context, ref, operations),
              icon: const Icon(Icons.add),
              label: Text('Add ${_singular(title)}'),
            ),
      body: RefreshIndicator(
        onRefresh: () async {
          if (operations != null) {
            ref.invalidate(operationalRecordsProvider(operations));
            await ref.read(operationalRecordsProvider(operations).future);
          } else {
            ref.invalidate(apiRecordsProvider(apiPath!));
            await ref.read(apiRecordsProvider(apiPath!).future);
          }
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
          children: [
            _Header(title: title, subtitle: subtitle, icon: icon),
            const SizedBox(height: 18),
            SectionHeading('Live $title'),
            const SizedBox(height: 8),
            asyncItems.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(32),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (error, _) => _ErrorCard(
                message: error.toString(),
                retry: () => operations != null
                    ? ref.invalidate(operationalRecordsProvider(operations))
                    : ref.invalidate(apiRecordsProvider(apiPath!)),
              ),
              data: (items) {
                if (items.isEmpty) {
                  return const EmptyState(
                    icon: Icons.inbox_outlined,
                    title: 'No records yet',
                    message: 'Pull down to refresh or use Add to create one.',
                  );
                }
                return Column(
                  children: items.map((item) {
                    if (item is OperationalRecord) {
                      return _OperationalTile(
                        record: item,
                        onStatus: (status) => _changeStatus(
                          context,
                          ref,
                          operations!,
                          item,
                          status,
                        ),
                      );
                    }
                    return _ApiTile(item: item as Map<String, dynamic>);
                  }).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _create(
    BuildContext context,
    WidgetRef ref,
    String module,
  ) async {
    final titleController = TextEditingController();
    final detailController = TextEditingController();
    var status = _statuses(module).first;
    final accepted = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text('Add ${_singular(title)}'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleController,
                  autofocus: true,
                  decoration: const InputDecoration(labelText: 'Title *'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: detailController,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Details'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: status,
                  decoration: const InputDecoration(labelText: 'Status'),
                  items: _statuses(module)
                      .map(
                        (value) => DropdownMenuItem(
                          value: value,
                          child: Text(_pretty(value)),
                        ),
                      )
                      .toList(),
                  onChanged: (value) => setState(() => status = value!),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                if (titleController.text.trim().length < 2) return;
                Navigator.pop(dialogContext, true);
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
    if (accepted != true || !context.mounted) return;
    try {
      await ref.read(apiProvider).createOperationalRecord(module, {
        'title': titleController.text.trim(),
        'subtitle': detailController.text.trim(),
        'status': status,
      });
      ref.invalidate(operationalRecordsProvider(module));
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Saved successfully')));
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    } finally {
      titleController.dispose();
      detailController.dispose();
    }
  }

  Future<void> _changeStatus(
    BuildContext context,
    WidgetRef ref,
    String module,
    OperationalRecord record,
    String status,
  ) async {
    try {
      await ref.read(apiProvider).updateOperationalRecord(module, record.id, {
        'status': status,
      });
      ref.invalidate(operationalRecordsProvider(module));
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    }
  }
}

class _Header extends StatelessWidget {
  const _Header({
    required this.title,
    required this.subtitle,
    required this.icon,
  });
  final String title;
  final String subtitle;
  final IconData icon;
  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          CircleAvatar(
            radius: 27,
            backgroundColor: CareNestColors.mint,
            child: Icon(icon, color: CareNestColors.forest),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 3),
                Text(subtitle),
              ],
            ),
          ),
        ],
      ),
    ),
  );
}

class _OperationalTile extends StatelessWidget {
  const _OperationalTile({required this.record, required this.onStatus});
  final OperationalRecord record;
  final ValueChanged<String> onStatus;
  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 10),
    child: ListTile(
      title: Text(
        record.title,
        style: const TextStyle(fontWeight: FontWeight.w700),
      ),
      subtitle: Text(
        [
          if (record.subtitle?.isNotEmpty == true) record.subtitle!,
          if (record.eventAt != null)
            DateFormat('EEE, d MMM · h:mm a').format(record.eventAt!.toLocal()),
        ].join('\n'),
      ),
      trailing: PopupMenuButton<String>(
        tooltip: 'Change status',
        onSelected: onStatus,
        itemBuilder: (_) => const [
          PopupMenuItem(value: 'ACTIVE', child: Text('Active')),
          PopupMenuItem(value: 'PENDING', child: Text('Pending')),
          PopupMenuItem(value: 'COMPLETED', child: Text('Completed')),
          PopupMenuItem(value: 'INACTIVE', child: Text('Inactive')),
        ],
        child: StatusPill(_pretty(record.status)),
      ),
    ),
  );
}

class _ApiTile extends StatelessWidget {
  const _ApiTile({required this.item});
  final Map<String, dynamic> item;
  @override
  Widget build(BuildContext context) {
    final resident = item['resident'] as Map<String, dynamic>?;
    final title =
        item['title']?.toString() ??
        item['displayName']?.toString() ??
        '${item['firstName'] ?? ''} ${item['lastName'] ?? ''}'.trim();
    final residentName = resident == null
        ? ''
        : '${resident['preferredName'] ?? resident['firstName'] ?? ''} ${resident['lastName'] ?? ''}'
              .trim();
    final details = [
      if (residentName.isNotEmpty) residentName,
      if (item['role'] != null) item['role'].toString(),
      if (item['branch'] != null) item['branch'].toString(),
      if (item['goals'] != null) item['goals'].toString(),
      if (item['email'] != null) item['email'].toString(),
    ];
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: CircleAvatar(
          child: Text(title.isEmpty ? '?' : title[0].toUpperCase()),
        ),
        title: Text(
          title.isEmpty ? 'Record' : title,
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
        subtitle: details.isEmpty
            ? null
            : Text(
                details.join(' · '),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
        trailing: item['status'] == null
            ? const Icon(Icons.chevron_right)
            : StatusPill(_pretty(item['status'].toString())),
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message, required this.retry});
  final String message;
  final VoidCallback retry;
  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(18),
      child: Column(
        children: [
          const Icon(Icons.cloud_off_outlined, size: 36),
          const SizedBox(height: 8),
          Text(message, textAlign: TextAlign.center),
          TextButton.icon(
            onPressed: retry,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    ),
  );
}

String _singular(String value) => value.endsWith('s')
    ? value.substring(0, value.length - 1).toLowerCase()
    : value.toLowerCase();
String _pretty(String value) => value
    .replaceAll('_', ' ')
    .toLowerCase()
    .split(' ')
    .map(
      (part) =>
          part.isEmpty ? part : '${part[0].toUpperCase()}${part.substring(1)}',
    )
    .join(' ');
List<String> _statuses(String module) => module == 'messages'
    ? const ['UNREAD', 'READ', 'ARCHIVED']
    : module == 'billing'
    ? const ['PENDING', 'PAID', 'OVERDUE']
    : module == 'announcements'
    ? const ['DRAFT', 'PUBLISHED', 'ARCHIVED']
    : const ['ACTIVE', 'PENDING', 'COMPLETED', 'INACTIVE'];

abstract final class MobileModules {
  static const carePlans = ModuleScreen(
    title: 'Care plans',
    subtitle: 'Live resident goals, guidance, priorities, and reviews.',
    icon: Icons.volunteer_activism_outlined,
    apiPath: '/care-plans',
  );
  static const staff = ModuleScreen(
    title: 'Staff',
    subtitle: 'Live employees, roles, branches, and account status.',
    icon: Icons.badge_outlined,
    apiPath: '/staff',
  );
  static const schedule = ModuleScreen(
    title: 'Schedule',
    subtitle: 'Appointments, activities, visits, tasks, and meetings.',
    icon: Icons.calendar_month_outlined,
    operationsModule: 'schedule',
  );
  static const reports = ModuleScreen(
    title: 'Reports',
    subtitle: 'Live resident and care-plan reporting data.',
    icon: Icons.analytics_outlined,
    apiPath: '/care-plans',
  );
  static const branches = ModuleScreen(
    title: 'Branches',
    subtitle: 'Residence branches and operational capacity.',
    icon: Icons.apartment_outlined,
    operationsModule: 'branches',
  );
  static const announcements = ModuleScreen(
    title: 'Announcements',
    subtitle: 'Facility-wide staff communication.',
    icon: Icons.campaign_outlined,
    operationsModule: 'announcements',
  );
  static const auditLogs = ModuleScreen(
    title: 'Audit logs',
    subtitle: 'System activity, actors, actions, and status.',
    icon: Icons.policy_outlined,
    operationsModule: 'audit-logs',
  );
  static const billing = ModuleScreen(
    title: 'Billing',
    subtitle: 'Invoices, balances, receipts, and payments.',
    icon: Icons.receipt_long_outlined,
    operationsModule: 'billing',
  );
  static const accounts = ModuleScreen(
    title: 'Accounts',
    subtitle: 'System login accounts and resident guest access.',
    icon: Icons.manage_accounts_outlined,
    apiPath: '/staff',
  );
  static const messages = ModuleScreen(
    title: 'Messages',
    subtitle: 'Secure staff and team communication.',
    icon: Icons.chat_bubble_outline,
    operationsModule: 'messages',
  );
}
