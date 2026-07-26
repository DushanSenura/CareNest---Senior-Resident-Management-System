import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../data/models.dart';
import '../state/session.dart';
import '../theme.dart';
import '../widgets/common.dart';

class ResidentsScreen extends ConsumerStatefulWidget {
  const ResidentsScreen({super.key});

  @override
  ConsumerState<ResidentsScreen> createState() => _ResidentsScreenState();
}

class _ResidentsScreenState extends ConsumerState<ResidentsScreen> {
  String _query = '';
  String _status = 'ALL';

  @override
  Widget build(BuildContext context) {
    final result = ref.watch(residentsProvider);
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
          child: Column(
            children: [
              TextField(
                onChanged: (value) => setState(() => _query = value),
                decoration: const InputDecoration(
                  hintText: 'Search residents or rooms',
                  prefixIcon: Icon(Icons.search),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 40,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: ['ALL', 'ACTIVE', 'HOSPITALIZED', 'RESPITE']
                      .map(
                        (status) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(status.replaceAll('_', ' ')),
                            selected: _status == status,
                            onSelected: (_) => setState(() => _status = status),
                          ),
                        ),
                      )
                      .toList(),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: result.when(
            data: (items) {
              final query = _query.toLowerCase().trim();
              final filtered = items.where((resident) {
                final matchesStatus =
                    _status == 'ALL' || resident.status == _status;
                final matchesQuery =
                    query.isEmpty ||
                    resident.displayName.toLowerCase().contains(query) ||
                    resident.room.toLowerCase().contains(query);
                return matchesStatus && matchesQuery;
              }).toList();
              if (filtered.isEmpty) {
                return const EmptyState(
                  icon: Icons.person_search_outlined,
                  title: 'No residents found',
                  message: 'Try another name, room, or status.',
                );
              }
              return RefreshIndicator(
                onRefresh: () async {
                  ref.invalidate(residentsProvider);
                  await ref.read(residentsProvider.future);
                },
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 6, 16, 28),
                  itemCount: filtered.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final resident = filtered[index];
                    return Card(
                      child: InkWell(
                        borderRadius: BorderRadius.circular(20),
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) =>
                                ResidentDetailScreen(resident: resident),
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 25,
                                backgroundColor: CareNestColors.mint,
                                child: Text(
                                  resident.initials,
                                  style: const TextStyle(
                                    color: CareNestColors.forest,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 13),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      resident.displayName,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Room ${resident.room} · ${resident.medications.length} medications',
                                      style: Theme.of(
                                        context,
                                      ).textTheme.bodySmall,
                                    ),
                                    if (resident.allergies.isNotEmpty)
                                      Text(
                                        'Allergy: ${resident.allergies.join(', ')}',
                                        style: const TextStyle(
                                          color: CareNestColors.coral,
                                          fontSize: 12,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              StatusPill(resident.priority),
                              const SizedBox(width: 4),
                              const Icon(Icons.chevron_right),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => ErrorState(
              message: error.toString(),
              retry: () => ref.invalidate(residentsProvider),
            ),
          ),
        ),
      ],
    );
  }
}

class ResidentDetailScreen extends ConsumerWidget {
  const ResidentDetailScreen({super.key, required this.resident});
  final Resident resident;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final result = ref.watch(residentDetailProvider(resident.id));
    return Scaffold(
      appBar: AppBar(title: const Text('Resident details')),
      body: result.when(
        data: (value) => ListView(
          padding: const EdgeInsets.fromLTRB(16, 6, 16, 28),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    CircleAvatar(radius: 38, child: Text(value.initials)),
                    const SizedBox(height: 12),
                    Text(
                      value.displayName,
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w800),
                    ),
                    Text('Room ${value.room}'),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      children: [
                        StatusPill(value.status),
                        StatusPill(value.priority),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            const SectionHeading('Care alerts'),
            const SizedBox(height: 8),
            _InfoCard(
              icon: Icons.warning_amber_rounded,
              title: 'Allergies',
              value: value.allergies.isEmpty
                  ? 'No known allergies'
                  : value.allergies.join(', '),
              color: CareNestColors.coral,
            ),
            const SizedBox(height: 8),
            _InfoCard(
              icon: Icons.restaurant_outlined,
              title: 'Dietary needs',
              value: value.dietaryNeeds.isEmpty
                  ? 'No special dietary needs'
                  : value.dietaryNeeds.join(', '),
              color: CareNestColors.gold,
            ),
            const SizedBox(height: 20),
            const SectionHeading('Resident information'),
            const SizedBox(height: 8),
            Card(
              child: Column(
                children: [
                  if (value.dateOfBirth != null)
                    _DetailRow(
                      'Date of birth',
                      DateFormat.yMMMd().format(value.dateOfBirth!),
                    ),
                  if (value.admissionDate != null)
                    _DetailRow(
                      'Admission date',
                      DateFormat.yMMMd().format(value.admissionDate!),
                    ),
                  _DetailRow(
                    'Emergency contact',
                    value.emergencyName ?? 'Not recorded',
                  ),
                  _DetailRow(
                    'Emergency phone',
                    value.emergencyPhone ?? 'Not recorded',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const SectionHeading('Medication'),
            const SizedBox(height: 8),
            if (value.medications.isEmpty)
              const _InfoCard(
                icon: Icons.medication_outlined,
                title: 'No active medication',
                value: 'Nothing is listed for this resident.',
                color: CareNestColors.sage,
              )
            else
              Card(
                child: Column(
                  children: value.medications
                      .map(
                        (item) => ListTile(
                          leading: const Icon(Icons.medication_outlined),
                          title: Text(item.name),
                          subtitle: Text(
                            '${item.dosage} · ${item.frequency ?? '—'}',
                          ),
                        ),
                      )
                      .toList(),
                ),
              ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => ErrorState(
          message: error.toString(),
          retry: () => ref.invalidate(residentDetailProvider(resident.id)),
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.icon,
    required this.title,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String title;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withValues(alpha: .12),
          child: Icon(icon, color: color),
        ),
        title: Text(title),
        subtitle: Text(value),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(label, style: Theme.of(context).textTheme.labelMedium),
      trailing: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.sizeOf(context).width * 0.56,
        ),
        child: Text(
          value,
          maxLines: 3,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.end,
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
