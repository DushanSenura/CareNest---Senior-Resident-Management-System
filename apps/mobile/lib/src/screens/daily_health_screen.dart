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
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, index) => _HealthCard(
                record: items[index],
                open: () => showModalBottomSheet<void>(
                  context: context,
                  isScrollControlled: true,
                  useSafeArea: true,
                  builder: (_) => _HealthReportDetails(record: items[index]),
                ),
              ),
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
  const _HealthCard({required this.record, required this.open});
  final DailyHealthRecord record;
  final VoidCallback open;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: open,
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
                    const StatusPill('attention', color: CareNestColors.coral)
                  else
                    const Icon(Icons.chevron_right),
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
                  if (record.painLevel != null)
                    _Vital('Pain', '${record.painLevel}/10'),
                  if (record.mood != null) _Vital('Mood', record.mood!),
                ],
              ),
              if (record.concerns?.isNotEmpty == true) ...[
                const SizedBox(height: 12),
                Text(
                  'Concern: ${record.concerns}',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
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
      ),
    );
  }
}

class _HealthReportDetails extends StatelessWidget {
  const _HealthReportDetails({required this.record});
  final DailyHealthRecord record;

  @override
  Widget build(BuildContext context) {
    final observations = <(String, String?)>[
      ('Blood pressure', record.bloodPressure),
      ('Pulse', record.pulse == null ? null : '${record.pulse} bpm'),
      (
        'Temperature',
        record.temperature == null ? null : '${record.temperature} °C',
      ),
      (
        'Oxygen saturation',
        record.oxygenSaturation == null ? null : '${record.oxygenSaturation}%',
      ),
      (
        'Respiratory rate',
        record.respiratoryRate == null ? null : '${record.respiratoryRate}/min',
      ),
      (
        'Blood glucose',
        record.bloodGlucose == null ? null : '${record.bloodGlucose}',
      ),
      ('Weight', record.weight == null ? null : '${record.weight} kg'),
      (
        'Pain level',
        record.painLevel == null ? null : '${record.painLevel}/10',
      ),
      ('Mood', record.mood),
      ('Appetite', record.appetite),
      ('Hydration', record.hydration),
      ('Sleep quality', record.sleepQuality),
      ('Mobility', record.mobility),
      ('Bowel status', record.bowelStatus),
      ('Urinary status', record.urinaryStatus),
      ('Skin condition', record.skinCondition),
      ('Medication taken', record.medicationTaken ? 'Yes' : 'No'),
      ('Health change observed', record.healthChange ? 'Yes' : 'No'),
    ];
    final notes = <(String, String?)>[
      ('Concerns', record.concerns),
      ('Actions taken', record.actionsTaken),
      ('Notes', record.notes),
      ('Escalation', record.escalation),
    ];
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: .9,
      minChildSize: .55,
      maxChildSize: .98,
      builder: (context, controller) => ListView(
        controller: controller,
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        children: [
          const _SheetHandle(),
          const SizedBox(height: 18),
          Text(
            record.residentName,
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          Text(
            'Daily health report · ${DateFormat.yMMMMd().format(record.reportDate)}',
            style: const TextStyle(color: CareNestColors.sage),
          ),
          const SizedBox(height: 22),
          const SectionHeading('Clinical observations'),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: observations
                  .where((item) => item.$2?.isNotEmpty == true)
                  .map((item) => _DetailRow(item.$1, item.$2!))
                  .toList(),
            ),
          ),
          const SizedBox(height: 22),
          const SectionHeading('Care notes and escalation'),
          const SizedBox(height: 8),
          ...notes
              .where((item) => item.$2?.isNotEmpty == true)
              .map(
                (item) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.$1,
                            style: Theme.of(context).textTheme.labelMedium,
                          ),
                          const SizedBox(height: 5),
                          Text(item.$2!),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
          if (!notes.any((item) => item.$2?.isNotEmpty == true))
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text('No additional care notes were recorded.'),
              ),
            ),
          const SizedBox(height: 18),
          Text(
            'Recorded by ${record.recordedBy}',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.labelMedium,
          ),
        ],
      ),
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
  final _controllers = <String, TextEditingController>{
    for (final key in [
      'bloodPressure',
      'pulse',
      'temperature',
      'oxygenSaturation',
      'respiratoryRate',
      'bloodGlucose',
      'weight',
      'painLevel',
      'concerns',
      'actionsTaken',
      'notes',
      'escalation',
    ])
      key: TextEditingController(),
  };
  final _wellbeing = <String, String?>{
    'mood': null,
    'appetite': null,
    'hydration': null,
    'sleepQuality': null,
    'mobility': null,
    'bowelStatus': null,
    'urinaryStatus': null,
    'skinCondition': null,
  };
  String? _residentId;
  DateTime _reportDate = DateTime.now();
  bool _medicationTaken = true;
  bool _healthChange = false;
  bool _saving = false;

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final residents = ref.watch(residentsProvider);
    final account = ref.watch(sessionProvider).account!;
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: .94,
      minChildSize: .65,
      maxChildSize: .98,
      builder: (context, scrollController) => Form(
        key: _form,
        child: ListView(
          controller: scrollController,
          padding: EdgeInsets.fromLTRB(
            20,
            12,
            20,
            MediaQuery.viewInsetsOf(context).bottom + 24,
          ),
          children: [
            const _SheetHandle(),
            const SizedBox(height: 18),
            Text(
              'Resident daily health check',
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 4),
            const Text(
              'Record the complete daily clinical and wellbeing report.',
              style: TextStyle(color: CareNestColors.sage),
            ),
            const SizedBox(height: 22),
            const SectionHeading('Report information'),
            const SizedBox(height: 10),
            residents.when(
              data: (items) => DropdownButtonFormField<String>(
                initialValue: _residentId,
                decoration: const InputDecoration(labelText: 'Resident *'),
                items: items
                    .where((item) => item.status == 'ACTIVE')
                    .map(
                      (item) => DropdownMenuItem(
                        value: item.id,
                        child: Text('${item.displayName} · ${item.room}'),
                      ),
                    )
                    .toList(),
                onChanged: (value) => setState(() => _residentId = value),
                validator: (value) =>
                    value == null ? 'Select an active resident' : null,
              ),
              loading: () => const LinearProgressIndicator(),
              error: (error, _) => Text(error.toString()),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: _selectDate,
              icon: const Icon(Icons.calendar_today_outlined),
              label: Text(
                'Report date: ${DateFormat.yMMMd().format(_reportDate)}',
              ),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(52),
                alignment: Alignment.centerLeft,
              ),
            ),
            const SizedBox(height: 22),
            const SectionHeading('Vital signs and measurements'),
            const SizedBox(height: 10),
            _field('bloodPressure', 'Blood pressure', hint: 'e.g. 120/80'),
            _field('pulse', 'Pulse (bpm)', integer: true),
            _field('temperature', 'Temperature °C', decimal: true),
            _field(
              'oxygenSaturation',
              'Oxygen saturation %',
              integer: true,
              min: 0,
              max: 100,
            ),
            _field('respiratoryRate', 'Respiratory rate', integer: true),
            _field('bloodGlucose', 'Blood glucose', decimal: true),
            _field('weight', 'Weight kg', decimal: true),
            _field(
              'painLevel',
              'Pain level 0–10',
              integer: true,
              min: 0,
              max: 10,
            ),
            const SizedBox(height: 14),
            const SectionHeading('Daily wellbeing assessment'),
            const SizedBox(height: 10),
            ..._wellbeing.keys.map(
              (key) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: DropdownButtonFormField<String>(
                  initialValue: _wellbeing[key],
                  decoration: InputDecoration(labelText: _label(key)),
                  items: const [
                    DropdownMenuItem(value: 'Good', child: Text('Good')),
                    DropdownMenuItem(value: 'Fair', child: Text('Fair')),
                    DropdownMenuItem(value: 'Poor', child: Text('Poor')),
                    DropdownMenuItem(
                      value: 'Requires attention',
                      child: Text('Requires attention'),
                    ),
                  ],
                  onChanged: (value) => setState(() => _wellbeing[key] = value),
                ),
              ),
            ),
            Card(
              child: Column(
                children: [
                  SwitchListTile(
                    value: _medicationTaken,
                    onChanged: (value) =>
                        setState(() => _medicationTaken = value),
                    title: const Text('Medication taken'),
                    subtitle: const Text(
                      'Confirm scheduled medication was taken.',
                    ),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    value: _healthChange,
                    onChanged: (value) => setState(() => _healthChange = value),
                    title: const Text('Health change observed'),
                    subtitle: const Text(
                      'Mark any change requiring review or follow-up.',
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),
            const SectionHeading('Care notes and escalation'),
            const SizedBox(height: 10),
            _textArea('concerns', 'Concerns'),
            _textArea('actionsTaken', 'Actions taken'),
            _textArea('notes', 'Notes'),
            _textArea('escalation', 'Escalation'),
            const SizedBox(height: 18),
            FilledButton.icon(
              onPressed: _saving ? null : () => _save(account.fullName),
              icon: _saving
                  ? const SizedBox.square(
                      dimension: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.save_outlined),
              label: const Text('Save complete health report'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field(
    String key,
    String label, {
    bool integer = false,
    bool decimal = false,
    num? min,
    num? max,
    String? hint,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextFormField(
        controller: _controllers[key],
        keyboardType: integer || decimal
            ? TextInputType.numberWithOptions(decimal: decimal)
            : TextInputType.text,
        decoration: InputDecoration(labelText: label, hintText: hint),
        validator: (value) {
          if (value == null || value.trim().isEmpty || (!integer && !decimal)) {
            return null;
          }
          final number = num.tryParse(value);
          if (number == null) return 'Enter a valid number';
          if (integer && number % 1 != 0) return 'Enter a whole number';
          if (min != null && number < min) return 'Minimum value is $min';
          if (max != null && number > max) return 'Maximum value is $max';
          return null;
        },
      ),
    );
  }

  Widget _textArea(String key, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextFormField(
        controller: _controllers[key],
        minLines: 2,
        maxLines: 4,
        decoration: InputDecoration(labelText: label),
      ),
    );
  }

  Future<void> _selectDate() async {
    final selected = await showDatePicker(
      context: context,
      initialDate: _reportDate,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now(),
    );
    if (selected != null) setState(() => _reportDate = selected);
  }

  Future<void> _save(String recordedBy) async {
    if (!_form.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final body = <String, dynamic>{
        'residentId': _residentId,
        'reportDate': DateFormat('yyyy-MM-dd').format(_reportDate),
        'recordedBy': recordedBy,
        'medicationTaken': _medicationTaken,
        'healthChange': _healthChange,
      };
      _putText(body, 'bloodPressure');
      for (final key in [
        'pulse',
        'oxygenSaturation',
        'respiratoryRate',
        'painLevel',
      ]) {
        _putInt(body, key);
      }
      for (final key in ['temperature', 'bloodGlucose', 'weight']) {
        _putDouble(body, key);
      }
      for (final entry in _wellbeing.entries) {
        if (entry.value?.isNotEmpty == true) body[entry.key] = entry.value;
      }
      for (final key in ['concerns', 'actionsTaken', 'notes', 'escalation']) {
        _putText(body, key);
      }
      await ref.read(apiProvider).createHealthReport(body);
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

  void _putText(Map<String, dynamic> body, String key) {
    final value = _controllers[key]!.text.trim();
    if (value.isNotEmpty) body[key] = value;
  }

  void _putInt(Map<String, dynamic> body, String key) {
    final value = int.tryParse(_controllers[key]!.text.trim());
    if (value != null) body[key] = value;
  }

  void _putDouble(Map<String, dynamic> body, String key) {
    final value = double.tryParse(_controllers[key]!.text.trim());
    if (value != null) body[key] = value;
  }

  String _label(String value) {
    return value
        .replaceAllMapped(RegExp(r'([A-Z])'), (match) => ' ${match.group(1)}')
        .replaceFirstMapped(
          RegExp(r'^.'),
          (match) => match.group(0)!.toUpperCase(),
        );
  }
}

class _SheetHandle extends StatelessWidget {
  const _SheetHandle();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 42,
        height: 4,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.outlineVariant,
          borderRadius: BorderRadius.circular(4),
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

class _DetailRow extends StatelessWidget {
  const _DetailRow(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(label),
      trailing: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 190),
        child: Text(
          value,
          textAlign: TextAlign.end,
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
