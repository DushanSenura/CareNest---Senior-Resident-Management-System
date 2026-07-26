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
    final role = ref.watch(sessionProvider).account?.role;
    final isAdmin = role == 'Admin' || role == 'Super Admin';
    final canWrite =
        operations != null &&
        operations != 'audit-logs' &&
        (isAdmin || operations == 'messages');
    final asyncItems = operations != null
        ? ref.watch(operationalRecordsProvider(operations))
        : ref.watch(apiRecordsProvider(apiPath!));
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: !canWrite
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
                        onStatus: canWrite
                            ? (status) => _changeStatus(
                                context,
                                ref,
                                operations,
                                item,
                                status,
                              )
                            : null,
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
  final ValueChanged<String>? onStatus;
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
      trailing: onStatus == null
          ? StatusPill(_pretty(record.status))
          : PopupMenuButton<String>(
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
  static const auditLogs = AuditLogsMobileScreen();
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

class AuditLogsMobileScreen extends ConsumerStatefulWidget {
  const AuditLogsMobileScreen({super.key});

  @override
  ConsumerState<AuditLogsMobileScreen> createState() =>
      _AuditLogsMobileScreenState();
}

class _AuditLogsMobileScreenState extends ConsumerState<AuditLogsMobileScreen> {
  final _command = TextEditingController();
  bool _devMode = false;
  bool _cleared = false;
  String _filter = '';
  int? _limit;
  String _notice = 'Type help to view available commands.';

  @override
  void dispose() {
    _command.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final superAdmin =
        ref.watch(sessionProvider).account?.role == 'Super Admin';
    final result = ref.watch(operationalRecordsProvider('audit-logs'));
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Audit logs'),
        actions: [
          if (superAdmin)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: FilterChip(
                selected: _devMode,
                avatar: const Icon(Icons.terminal, size: 18),
                label: Text(_devMode ? 'Exit dev mode' : 'Dev mode'),
                onSelected: (value) => setState(() => _devMode = value),
              ),
            ),
        ],
      ),
      body: result.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => ErrorState(
          message: error.toString(),
          retry: () => ref.invalidate(operationalRecordsProvider('audit-logs')),
        ),
        data: (records) =>
            _devMode && superAdmin ? _terminal(records) : _register(records),
      ),
    );
  }

  Widget _register(List<OperationalRecord> records) {
    if (records.isEmpty) {
      return const EmptyState(
        icon: Icons.policy_outlined,
        title: 'No audit activity',
        message: 'Login and system activity will appear here.',
      );
    }
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(operationalRecordsProvider('audit-logs'));
        await ref.read(operationalRecordsProvider('audit-logs').future);
      },
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        itemCount: records.length,
        separatorBuilder: (_, _) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final record = records[index];
          return Card(
            child: ListTile(
              leading: const CircleAvatar(child: Icon(Icons.security_outlined)),
              title: Text(
                record.title,
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
              subtitle: Text(
                [
                  if (record.eventAt != null)
                    DateFormat(
                      'yyyy-MM-dd HH:mm:ss',
                    ).format(record.eventAt!.toLocal()),
                  if (record.subtitle?.isNotEmpty == true) record.subtitle!,
                ].join('\n'),
              ),
              trailing: StatusPill(_pretty(record.status)),
            ),
          );
        },
      ),
    );
  }

  Widget _terminal(List<OperationalRecord> records) {
    final ordered = [...records]
      ..sort(
        (a, b) => (b.eventAt ?? DateTime(1970)).compareTo(
          a.eventAt ?? DateTime(1970),
        ),
      );
    final matching = ordered.where((record) {
      final text =
          '${record.id} ${record.title} ${record.subtitle ?? ''} ${record.status} ${record.data}'
              .toLowerCase();
      return _filter.isEmpty || text.contains(_filter.toLowerCase());
    }).toList();
    final visible = _limit == null ? matching : matching.take(_limit!).toList();
    return Container(
      color: const Color(0xFF090C0A),
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              color: const Color(0xFF151A16),
              child: Row(
                children: [
                  const Icon(
                    Icons.terminal,
                    color: Color(0xFF6EE7A8),
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'carenest:audit — read only',
                      style: TextStyle(
                        color: Color(0xFFCBD5E1),
                        fontFamily: 'monospace',
                        fontSize: 12,
                      ),
                    ),
                  ),
                  Text(
                    '${visible.length}/${records.length}',
                    style: const TextStyle(
                      color: Color(0xFF6EE7A8),
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(14),
                children: [
                  const Text(
                    r'$ carenest audit --interactive --read-only',
                    style: TextStyle(
                      color: Color(0xFF6EE7A8),
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _notice,
                    style: const TextStyle(
                      color: Color(0xFF67E8F9),
                      fontFamily: 'monospace',
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (!_cleared)
                    ...visible.map(
                      (record) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Text.rich(
                          TextSpan(
                            children: [
                              TextSpan(
                                text:
                                    '[${record.eventAt?.toLocal().toIso8601String() ?? 'unknown'}] ',
                                style: const TextStyle(
                                  color: Color(0xFF64748B),
                                ),
                              ),
                              TextSpan(
                                text: '${record.status} ',
                                style: const TextStyle(
                                  color: Color(0xFF6EE7A8),
                                ),
                              ),
                              TextSpan(
                                text: '${record.title}\n',
                                style: const TextStyle(
                                  color: Color(0xFFC4B5FD),
                                ),
                              ),
                              TextSpan(
                                text: record.subtitle ?? 'No details',
                                style: const TextStyle(
                                  color: Color(0xFFCBD5E1),
                                ),
                              ),
                            ],
                          ),
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Container(
              color: const Color(0xFF101411),
              padding: const EdgeInsets.fromLTRB(14, 8, 8, 8),
              child: Row(
                children: [
                  const Text(
                    r'audit$ ',
                    style: TextStyle(
                      color: Color(0xFF6EE7A8),
                      fontFamily: 'monospace',
                    ),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _command,
                      onSubmitted: _run,
                      autocorrect: false,
                      style: const TextStyle(
                        color: Color(0xFF86EFAC),
                        fontFamily: 'monospace',
                      ),
                      decoration: const InputDecoration(
                        hintText: 'help, search <text>, tail <n>...',
                        hintStyle: TextStyle(color: Color(0xFF475569)),
                        border: InputBorder.none,
                        filled: false,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => _run(_command.text),
                    icon: const Icon(
                      Icons.keyboard_return,
                      color: Color(0xFF6EE7A8),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _run(String raw) {
    final command = raw.trim();
    if (command.isEmpty) return;
    final parts = command.split(RegExp(r'\s+'));
    final name = parts.first.toLowerCase();
    final value = parts.skip(1).join(' ');
    setState(() {
      switch (name) {
        case 'help':
          _notice =
              'help | list | search <text> | status <value> | tail <number> | clear | reset';
        case 'clear':
          _cleared = true;
          _notice = 'Terminal cleared.';
        case 'list':
        case 'all':
        case 'reset':
          _filter = '';
          _limit = null;
          _cleared = false;
          _notice = 'Showing all immutable audit events.';
        case 'search':
        case 'status':
          _filter = value;
          _limit = null;
          _cleared = false;
          _notice = value.isEmpty
              ? 'Usage: $name <value>'
              : 'Filtering audit events for "$value".';
        case 'tail':
          final amount = int.tryParse(value);
          if (amount == null || amount <= 0) {
            _notice = 'Usage: tail <positive number>';
          } else {
            _filter = '';
            _limit = amount;
            _cleared = false;
            _notice = 'Showing the $amount newest audit events.';
          }
        default:
          _filter = command;
          _limit = null;
          _cleared = false;
          _notice = 'Quick search for "$command".';
      }
      _command.clear();
    });
  }
}
