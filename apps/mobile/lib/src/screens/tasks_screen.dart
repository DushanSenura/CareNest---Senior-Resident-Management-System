import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../data/models.dart';
import '../state/session.dart';
import '../theme.dart';
import '../widgets/common.dart';

class TasksScreen extends ConsumerStatefulWidget {
  const TasksScreen({super.key});

  @override
  ConsumerState<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends ConsumerState<TasksScreen> {
  String _filter = 'OPEN';
  String? _updating;

  @override
  Widget build(BuildContext context) {
    final result = ref.watch(tasksProvider);
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
          child: Row(
            children: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'MISSED']
                .map(
                  (filter) => Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 3),
                      child: ChoiceChip(
                        label: Text(
                          filter == 'IN_PROGRESS' ? 'ACTIVE' : filter,
                          style: const TextStyle(fontSize: 11),
                        ),
                        selected: _filter == filter,
                        onSelected: (_) => setState(() => _filter = filter),
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
        ),
        Expanded(
          child: result.when(
            data: (items) {
              final filtered = items.where((task) {
                if (_filter == 'OPEN') {
                  return task.status == 'PENDING' ||
                      task.status == 'IN_PROGRESS';
                }
                return task.status == _filter;
              }).toList();
              if (filtered.isEmpty) {
                return EmptyState(
                  icon: Icons.task_alt,
                  title: 'No ${_filter.toLowerCase()} tasks',
                  message: 'Tasks in this category will appear here.',
                );
              }
              return RefreshIndicator(
                onRefresh: () async {
                  ref.invalidate(tasksProvider);
                  await ref.read(tasksProvider.future);
                },
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 6, 16, 28),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) => _TaskCard(
                    task: filtered[index],
                    updating: _updating == filtered[index].id,
                    update: _update,
                  ),
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => ErrorState(
              message: error.toString(),
              retry: () => ref.invalidate(tasksProvider),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _update(CareTask task, String status) async {
    setState(() => _updating = task.id);
    try {
      await ref.read(apiProvider).updateTaskStatus(task.id, status);
      ref.invalidate(tasksProvider);
      ref.invalidate(summaryProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Task marked ${status.toLowerCase()}')),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    } finally {
      if (mounted) setState(() => _updating = null);
    }
  }
}

class _TaskCard extends StatelessWidget {
  const _TaskCard({
    required this.task,
    required this.updating,
    required this.update,
  });

  final CareTask task;
  final bool updating;
  final Future<void> Function(CareTask task, String status) update;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    task.title,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                ),
                StatusPill(task.status),
              ],
            ),
            const SizedBox(height: 7),
            Text('${task.residentName} · Room ${task.room}'),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(
                  task.overdue ? Icons.error_outline : Icons.schedule,
                  size: 16,
                  color: task.overdue
                      ? CareNestColors.coral
                      : CareNestColors.sage,
                ),
                const SizedBox(width: 5),
                Text(
                  DateFormat('EEE, d MMM · HH:mm').format(task.dueAt),
                  style: TextStyle(
                    color: task.overdue
                        ? CareNestColors.coral
                        : CareNestColors.sage,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
            if (task.notes?.isNotEmpty == true) ...[
              const SizedBox(height: 7),
              Text(task.notes!, style: Theme.of(context).textTheme.bodySmall),
            ],
            if (task.status != 'COMPLETED' && task.status != 'MISSED') ...[
              const SizedBox(height: 14),
              Row(
                children: [
                  if (task.status == 'PENDING')
                    Expanded(
                      child: OutlinedButton(
                        onPressed: updating
                            ? null
                            : () => update(task, 'IN_PROGRESS'),
                        child: const Text('Start'),
                      ),
                    ),
                  if (task.status == 'PENDING') const SizedBox(width: 8),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: updating
                          ? null
                          : () => update(task, 'COMPLETED'),
                      icon: updating
                          ? const SizedBox.square(
                              dimension: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.check, size: 18),
                      label: const Text('Complete'),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
