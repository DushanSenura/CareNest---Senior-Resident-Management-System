import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../state/session.dart';
import '../theme.dart';
import '../widgets/common.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summary = ref.watch(summaryProvider);
    final tasks = ref.watch(tasksProvider);
    final residents = ref.watch(residentsProvider);
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(summaryProvider);
        ref.invalidate(tasksProvider);
        ref.invalidate(residentsProvider);
        await ref.read(summaryProvider.future);
      },
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          Text(
            DateFormat('EEEE, d MMMM').format(DateTime.now()),
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: CareNestColors.sage),
          ),
          const SizedBox(height: 18),
          const SectionHeading('Shift overview'),
          const SizedBox(height: 10),
          summary.when(
            data: (value) => GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.45,
              children: [
                _MetricCard(
                  icon: Icons.people_outline,
                  label: 'Active residents',
                  value: value.residents,
                  color: CareNestColors.forest,
                ),
                _MetricCard(
                  icon: Icons.schedule_outlined,
                  label: 'Tasks due',
                  value: value.tasksDue,
                  color: CareNestColors.gold,
                ),
                _MetricCard(
                  icon: Icons.task_alt,
                  label: 'Completed',
                  value: value.tasksCompleted,
                  color: CareNestColors.sage,
                ),
                _MetricCard(
                  icon: Icons.warning_amber_rounded,
                  label: 'Incidents',
                  value: value.incidents,
                  color: CareNestColors.coral,
                ),
              ],
            ),
            loading: () => const SizedBox(
              height: 220,
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (error, _) => _InlineError(
              message: error.toString(),
              retry: () => ref.invalidate(summaryProvider),
            ),
          ),
          const SizedBox(height: 24),
          const SectionHeading('Next care tasks'),
          const SizedBox(height: 10),
          tasks.when(
            data: (items) {
              final open = items
                  .where((item) => item.status != 'COMPLETED')
                  .take(4)
                  .toList();
              if (open.isEmpty) {
                return const _GoodNewsCard(
                  text: 'No open care tasks. Your shift is on track.',
                );
              }
              return Card(
                child: Column(
                  children: open
                      .map(
                        (task) => ListTile(
                          leading: CircleAvatar(
                            backgroundColor: task.overdue
                                ? CareNestColors.coral.withValues(alpha: .15)
                                : CareNestColors.mint,
                            child: Icon(
                              task.overdue
                                  ? Icons.priority_high
                                  : Icons.schedule,
                              color: task.overdue
                                  ? CareNestColors.coral
                                  : CareNestColors.forest,
                            ),
                          ),
                          title: Text(
                            task.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          subtitle: Text(
                            '${DateFormat.Hm().format(task.dueAt)} · ${task.residentName} · ${task.room}',
                          ),
                          trailing: const Icon(Icons.chevron_right),
                        ),
                      )
                      .toList(),
                ),
              );
            },
            loading: () => const LinearProgressIndicator(),
            error: (error, _) => _InlineError(
              message: error.toString(),
              retry: () => ref.invalidate(tasksProvider),
            ),
          ),
          const SizedBox(height: 24),
          const SectionHeading('Residents needing attention'),
          const SizedBox(height: 10),
          residents.when(
            data: (items) {
              final attention = items
                  .where(
                    (item) =>
                        item.priority == 'HIGH' ||
                        item.priority == 'CRITICAL' ||
                        item.allergies.isNotEmpty,
                  )
                  .take(4)
                  .toList();
              if (attention.isEmpty) {
                return const _GoodNewsCard(
                  text: 'No residents currently require priority attention.',
                );
              }
              return Card(
                child: Column(
                  children: attention
                      .map(
                        (resident) => ListTile(
                          leading: CircleAvatar(child: Text(resident.initials)),
                          title: Text(resident.displayName),
                          subtitle: Text(
                            resident.allergies.isEmpty
                                ? 'Room ${resident.room}'
                                : 'Room ${resident.room} · Allergy: ${resident.allergies.join(', ')}',
                            maxLines: 2,
                          ),
                          trailing: StatusPill(resident.priority),
                        ),
                      )
                      .toList(),
                ),
              );
            },
            loading: () => const LinearProgressIndicator(),
            error: (error, _) => _InlineError(
              message: error.toString(),
              retry: () => ref.invalidate(residentsProvider),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final int value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(icon, color: color),
            Text(
              '$value',
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
            ),
            Text(label, style: Theme.of(context).textTheme.labelMedium),
          ],
        ),
      ),
    );
  }
}

class _GoodNewsCard extends StatelessWidget {
  const _GoodNewsCard({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            const Icon(
              Icons.check_circle_outline,
              color: CareNestColors.forest,
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(text)),
          ],
        ),
      ),
    );
  }
}

class _InlineError extends StatelessWidget {
  const _InlineError({required this.message, required this.retry});
  final String message;
  final VoidCallback retry;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.cloud_off_outlined),
        title: const Text('Data unavailable'),
        subtitle: Text(message.replaceFirst('ApiException: ', '')),
        trailing: IconButton(onPressed: retry, icon: const Icon(Icons.refresh)),
      ),
    );
  }
}
