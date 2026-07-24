import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'data.dart';

class CareNestApp extends StatelessWidget {
  const CareNestApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'CareNest',
    theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff24594a), surface: const Color(0xfff7f5ef)), useMaterial3: true),
    home: const ShiftScreen(),
  );
}

class ShiftScreen extends ConsumerWidget {
  const ShiftScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final residents = ref.watch(residentsProvider);
    return Scaffold(
      appBar: AppBar(title: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Good morning, Maya'), Text('Willow Grove · Morning shift', style: TextStyle(fontSize: 12, fontWeight: FontWeight.normal))]), actions: [IconButton(onPressed: () {}, icon: const Badge(label: Text('3'), child: Icon(Icons.notifications_outlined)))]),
      body: RefreshIndicator(onRefresh: () => ref.refresh(residentsProvider.future), child: ListView(padding: const EdgeInsets.all(16), children: [
        const Text('SHIFT PROGRESS', style: TextStyle(fontSize: 11, letterSpacing: 1.5, color: Color(0xff7da690), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(children: [const Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('36 of 48 tasks complete', style: TextStyle(fontWeight: FontWeight.bold)), Text('75%')]), const SizedBox(height: 12), LinearProgressIndicator(value: .75, minHeight: 8, borderRadius: BorderRadius.all(Radius.circular(8)))]))),
        const SizedBox(height: 22), const Text('RESIDENTS NEEDING ATTENTION', style: TextStyle(fontSize: 11, letterSpacing: 1.5, color: Color(0xff7da690), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        residents.when(data: (items) => Column(children: items.map((r) => Card(child: ListTile(contentPadding: const EdgeInsets.all(12), leading: CircleAvatar(child: Text('${r.firstName[0]}${r.lastName[0]}')), title: Text('${r.firstName} ${r.lastName}', style: const TextStyle(fontWeight: FontWeight.bold)), subtitle: Text('Room ${r.room} · ${r.medications.length} medications'), trailing: const Icon(Icons.chevron_right)))).toList()), loading: () => const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())), error: (_, __) => const Card(child: Padding(padding: EdgeInsets.all(20), child: Text('Connect to the CareNest API to view residents.')))),
      ])),
      bottomNavigationBar: NavigationBar(selectedIndex: 0, destinations: const [NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Shift'), NavigationDestination(icon: Icon(Icons.people_outline), label: 'Residents'), NavigationDestination(icon: Icon(Icons.checklist), label: 'Tasks'), NavigationDestination(icon: Icon(Icons.chat_bubble_outline), label: 'Messages')]),
    );
  }
}
