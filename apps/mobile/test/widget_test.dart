import 'package:carenest_mobile/src/app.dart';
import 'package:carenest_mobile/src/data/models.dart';
import 'package:carenest_mobile/src/state/session.dart';
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
        ],
        child: const CareNestApp(),
      ),
    );
    await tester.pump();

    expect(find.textContaining('Maya'), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Residents'), findsOneWidget);
    expect(find.text('Tasks'), findsOneWidget);
    expect(find.text('Health'), findsOneWidget);
  });
}

class _TestSessionController extends SessionController {
  _TestSessionController(SessionState initial) : super.forTest(initial);
}
