import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../data/models.dart';
import '../state/session.dart';
import '../theme.dart';
import '../widgets/common.dart';

class DailyHealthScreen extends ConsumerWidget {
  const DailyHealthScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reports = ref.watch(healthReportsProvider);
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'health-report',
        onPressed: () => showModalBottomSheet<void>(
          context: context,
          isScrollControlled: true,
          useSafeArea: true,
          builder: (_) => const _HealthReportForm(),
        ),
        icon: const Icon(Icons.add),
        label: const Text('Health check'),
      ),
      body: reports.when(
        data: (items) {
          if (items.isEmpty) {
            return const EmptyState(
              icon: Icons.monitor_heart_outlined,
              title: 'No health reports',
              message: 'Record the first resident daily health check.',
            );
          }
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(healthReportsProvider);
              await ref.read(healthReportsProvider.future);
            },
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) =>
                  _HealthCard(record: items[index]),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => ErrorState(
          message: error.toString(),
          retry: () => ref.invalidate(healthReportsProvider),
        ),
      ),
    );
  }
}

class _HealthCard extends StatelessWidget {
  const _HealthCard({required this.record});
  final DailyHealthRecord record;

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
                CircleAvatar(
                  backgroundColor: record.healthChange
                      ? CareNestColors.coral.withValues(alpha: .15)
                      : CareNestColors.mint,
                  child: Icon(
                    record.healthChange
                        ? Icons.warning_amber_rounded
                        : Icons.favorite_outline,
                    color: record.healthChange
                        ? CareNestColors.coral
                        : CareNestColors.forest,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        record.residentName,
                        style: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                      Text(
                        'Room ${record.room} · ${DateFormat.yMMMd().format(record.reportDate)}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                if (record.healthChange)
                  const StatusPill('attention', color: CareNestColors.coral),
              ],
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (record.bloodPressure != null)
                  _Vital('BP', record.bloodPressure!),
                if (record.pulse != null) _Vital('Pulse', '${record.pulse}'),
                if (record.temperature != null)
                  _Vital('Temp', '${record.temperature}°C'),
                if (record.oxygenSaturation != null)
                  _Vital('SpO₂', '${record.oxygenSaturation}%'),
                if (record.mood != null) _Vital('Mood', record.mood!),
              ],
            ),
            if (record.concerns?.isNotEmpty == true) ...[
              const SizedBox(height: 12),
              Text(
                'Concern: ${record.concerns}',
                style: const TextStyle(color: CareNestColors.coral),
              ),
            ],
            const SizedBox(height: 10),
            Text(
              'Recorded by ${record.recordedBy}',
              style: Theme.of(context).textTheme.labelSmall,
            ),
          ],
        ),
      ),
    );
  }
}

class _Vital extends StatelessWidget {
  const _Vital(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text('$label  $value', style: const TextStyle(fontSize: 12)),
    );
  }
}

class _HealthReportForm extends ConsumerStatefulWidget {
  const _HealthReportForm();

  @override
  ConsumerState<_HealthReportForm> createState() => _HealthReportFormState();
}

class _HealthReportFormState extends ConsumerState<_HealthReportForm> {
  final _form = GlobalKey<FormState>();
  final _bloodPressure = TextEditingController();
  final _pulse = TextEditingController();
  final _temperature = TextEditingController();
  final _oxygen = TextEditingController();
  final _concerns = TextEditingController();
  String? _residentId;
  String _mood = 'Good';
  bool _medicationTaken = true;
  bool _healthChange = false;
  bool _saving = false;

  @override
  void dispose() {
    _bloodPressure.dispose();
    _pulse.dispose();
    _temperature.dispose();
    _oxygen.dispose();
    _concerns.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final residents = ref.watch(residentsProvider);
    final account = ref.watch(sessionProvider).account!;
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 12,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 20,
      ),
      child: SingleChildScrollView(
        child: Form(
          key: _form,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 42,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.outlineVariant,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'Resident health check',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 18),
              residents.when(
                data: (items) => DropdownButtonFormField<String>(
                  initialValue: _residentId,
                  decoration: const InputDecoration(labelText: 'Resident'),
                  items: items
                      .map(
                        (item) => DropdownMenuItem(
                          value: item.id,
                          child: Text('${item.displayName} · ${item.room}'),
                        ),
                      )
                      .toList(),
                  onChanged: (value) => setState(() => _residentId = value),
                  validator: (value) =>
                      value == null ? 'Select a resident' : null,
                ),
                loading: () => const LinearProgressIndicator(),
                error: (error, _) => Text(error.toString()),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _bloodPressure,
                      decoration: const InputDecoration(
                        labelText: 'Blood pressure',
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _pulse,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Pulse'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _temperature,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      decoration: const InputDecoration(
                        labelText: 'Temperature °C',
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _oxygen,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'SpO₂ %'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _mood,
                decoration: const InputDecoration(labelText: 'Mood'),
                items: ['Good', 'Fair', 'Poor', 'Requires attention']
                    .map(
                      (value) =>
                          DropdownMenuItem(value: value, child: Text(value)),
                    )
                    .toList(),
                onChanged: (value) => setState(() => _mood = value ?? 'Good'),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: _medicationTaken,
                onChanged: (value) => setState(() => _medicationTaken = value),
                title: const Text('Medication taken'),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: _healthChange,
                onChanged: (value) => setState(() => _healthChange = value),
                title: const Text('Health change observed'),
              ),
              TextFormField(
                controller: _concerns,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Concerns or notes',
                ),
              ),
              const SizedBox(height: 18),
              FilledButton.icon(
                onPressed: _saving ? null : () => _save(account.fullName),
                icon: _saving
                    ? const SizedBox.square(
                        dimension: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.save_outlined),
                label: const Text('Save health check'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _save(String recordedBy) async {
    if (!_form.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final date = DateFormat('yyyy-MM-dd').format(DateTime.now());
      await ref.read(apiProvider).createHealthReport({
        'residentId': _residentId,
        'reportDate': date,
        'recordedBy': recordedBy,
        if (_bloodPressure.text.trim().isNotEmpty)
          'bloodPressure': _bloodPressure.text.trim(),
        if (int.tryParse(_pulse.text) != null) 'pulse': int.parse(_pulse.text),
        if (double.tryParse(_temperature.text) != null)
          'temperature': double.parse(_temperature.text),
        if (int.tryParse(_oxygen.text) != null)
          'oxygenSaturation': int.parse(_oxygen.text),
        'mood': _mood,
        'medicationTaken': _medicationTaken,
        'healthChange': _healthChange,
        if (_concerns.text.trim().isNotEmpty) 'concerns': _concerns.text.trim(),
      });
      ref.invalidate(healthReportsProvider);
      if (mounted) Navigator.of(context).pop();
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }
}
