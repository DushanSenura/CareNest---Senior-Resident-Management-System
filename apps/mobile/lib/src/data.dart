import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Medication { final String id, name, dosage; Medication.fromJson(Map<String,dynamic> j): id=j['id'], name=j['name'], dosage=j['dosage']; }
class Resident {
  final String id, firstName, lastName, room;
  final List<Medication> medications;
  Resident.fromJson(Map<String,dynamic> j): id=j['id'], firstName=j['firstName'], lastName=j['lastName'], room=j['room'], medications=(j['medications'] as List? ?? []).map((m)=>Medication.fromJson(m)).toList();
}
final dioProvider = Provider((_) => Dio(BaseOptions(baseUrl: const String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:4000/api/v1'), connectTimeout: const Duration(seconds: 8))));
final residentsProvider = FutureProvider<List<Resident>>((ref) async {
  final response = await ref.watch(dioProvider).get('/residents');
  return (response.data as List).map((j) => Resident.fromJson(j)).toList();
});
