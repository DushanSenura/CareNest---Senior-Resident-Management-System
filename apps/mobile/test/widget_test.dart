import 'package:carenest_mobile/src/app.dart';
import 'package:carenest_mobile/src/data/models.dart';
import 'package:carenest_mobile/src/state/session.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows staff shell for an authenticated staff account', (
    tester,
  ) async {
    const account = StaffAccount(
      id: 'staff-1',
      firstName: 'Maya',
      lastName: 'Perera',
      email: 'nurse@carenest.local',
      role: 'Nurse',
      branch: 'Willow Grove Residence',
    );
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sessionProvider.overrideWith(
            (_) => _TestSessionController(
              const SessionState(account: account, restoring: false),
            ),
          ),
          summaryProvider.overrideWith(
            (_) async => const DashboardSummary(
              residents: 0,
              tasksDue: 0,
              tasksCompleted: 0,
              incidents: 0,
            ),
          ),
          residentsProvider.overrideWith((_) async => const <Resident>[]),
          tasksProvider.overrideWith((_) async => const <CareTask>[]),
          medicationsProvider.overrideWith((_) async => const <Medication>[]),
          healthReportsProvider.overrideWith(
            (_) async => const <DailyHealthRecord>[],
          ),
        ],
        child: const CareNestApp(),
      ),
    );
    await tester.pump();

    expect(find.textContaining('Maya'), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Residents'), findsOneWidget);
    expect(find.text('Care plans'), findsOneWidget);

    await tester.drag(find.byType(Scrollable).last, const Offset(-1000, 0));
    await tester.pumpAndSettle();
    expect(find.text('Settings'), findsOneWidget);
  });
}

class _TestSessionController extends SessionController {
  // ignore: use_super_parameters
  _TestSessionController(SessionState initial) : super.forTest(initial);
}
