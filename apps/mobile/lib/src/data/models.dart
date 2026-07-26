class StaffAccount {
  const StaffAccount({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.role,
    this.employeeId,
    this.department,
    this.branch,
    this.profilePhotoUrl,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String role;
  final String? employeeId;
  final String? department;
  final String? branch;
  final String? profilePhotoUrl;

  String get fullName => '$firstName $lastName'.trim();
  String get initials =>
      '${firstName.isEmpty ? '' : firstName[0]}${lastName.isEmpty ? '' : lastName[0]}'
          .toUpperCase();

  factory StaffAccount.fromJson(Map<String, dynamic> json) => StaffAccount(
    id: json['id'] as String? ?? '',
    firstName: json['firstName'] as String? ?? '',
    lastName: json['lastName'] as String? ?? '',
    email: json['email'] as String? ?? '',
    role: json['role'] as String? ?? 'Staff',
    employeeId: json['employeeId'] as String?,
    department: json['department'] as String?,
    branch: json['branch'] as String?,
    profilePhotoUrl: json['profilePhotoUrl'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'firstName': firstName,
    'lastName': lastName,
    'email': email,
    'role': role,
    'employeeId': employeeId,
    'department': department,
    'branch': branch,
    'profilePhotoUrl': profilePhotoUrl,
  };
}

class LoginResult {
  const LoginResult({
    required this.accessToken,
    required this.account,
    required this.permissions,
    required this.mustChangePassword,
  });

  final String accessToken;
  final StaffAccount account;
  final List<String> permissions;
  final bool mustChangePassword;

  factory LoginResult.fromJson(Map<String, dynamic> json) => LoginResult(
    accessToken: json['accessToken'] as String,
    account: StaffAccount.fromJson(json['staff'] as Map<String, dynamic>),
    permissions: (json['permissions'] as List<dynamic>? ?? const [])
        .map((item) => item.toString())
        .toList(),
    mustChangePassword: json['mustChangePassword'] as bool? ?? false,
  );
}

class DashboardSummary {
  const DashboardSummary({
    required this.residents,
    required this.tasksDue,
    required this.tasksCompleted,
    required this.incidents,
  });

  final int residents;
  final int tasksDue;
  final int tasksCompleted;
  final int incidents;

  factory DashboardSummary.fromJson(Map<String, dynamic> json) =>
      DashboardSummary(
        residents: json['residents'] as int? ?? 0,
        tasksDue: json['tasksDue'] as int? ?? 0,
        tasksCompleted: json['tasksCompleted'] as int? ?? 0,
        incidents: json['incidents'] as int? ?? 0,
      );
}

class Resident {
  const Resident({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.room,
    required this.status,
    required this.priority,
    required this.allergies,
    required this.dietaryNeeds,
    required this.medications,
    this.preferredName,
    this.dateOfBirth,
    this.emergencyName,
    this.emergencyPhone,
    this.admissionDate,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String? preferredName;
  final String room;
  final String status;
  final String priority;
  final List<String> allergies;
  final List<String> dietaryNeeds;
  final List<Medication> medications;
  final DateTime? dateOfBirth;
  final String? emergencyName;
  final String? emergencyPhone;
  final DateTime? admissionDate;

  String get displayName =>
      '${preferredName?.isNotEmpty == true ? preferredName : firstName} $lastName';
  String get initials =>
      '${firstName.isEmpty ? '' : firstName[0]}${lastName.isEmpty ? '' : lastName[0]}'
          .toUpperCase();

  factory Resident.fromJson(Map<String, dynamic> json) => Resident(
    id: json['id'] as String? ?? '',
    firstName: json['firstName'] as String? ?? '',
    lastName: json['lastName'] as String? ?? '',
    preferredName: json['preferredName'] as String?,
    room: json['room'] as String? ?? '—',
    status: json['status'] as String? ?? 'ACTIVE',
    priority: json['priority'] as String? ?? 'MEDIUM',
    allergies: (json['allergies'] as List<dynamic>? ?? const [])
        .map((item) => item.toString())
        .toList(),
    dietaryNeeds: (json['dietaryNeeds'] as List<dynamic>? ?? const [])
        .map((item) => item.toString())
        .toList(),
    medications: (json['medications'] as List<dynamic>? ?? const [])
        .map((item) => Medication.fromJson(item as Map<String, dynamic>))
        .toList(),
    dateOfBirth: DateTime.tryParse(json['dateOfBirth'] as String? ?? ''),
    emergencyName: json['emergencyName'] as String?,
    emergencyPhone: json['emergencyPhone'] as String?,
    admissionDate: DateTime.tryParse(json['admissionDate'] as String? ?? ''),
  );
}

class Medication {
  const Medication({
    required this.id,
    required this.name,
    required this.dosage,
    this.frequency,
    this.route,
    this.stockQuantity,
    this.stockUnit,
    this.reorderLevel,
    this.residentName,
    this.room,
  });

  final String id;
  final String name;
  final String dosage;
  final String? frequency;
  final String? route;
  final int? stockQuantity;
  final String? stockUnit;
  final int? reorderLevel;
  final String? residentName;
  final String? room;

  bool get lowStock =>
      stockQuantity != null &&
      reorderLevel != null &&
      stockQuantity! <= reorderLevel!;

  factory Medication.fromJson(Map<String, dynamic> json) {
    final resident = json['resident'] as Map<String, dynamic>?;
    return Medication(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      dosage: json['dosage'] as String? ?? '',
      frequency: json['frequency'] as String?,
      route: json['route'] as String?,
      stockQuantity: json['stockQuantity'] as int?,
      stockUnit: json['stockUnit'] as String?,
      reorderLevel: json['reorderLevel'] as int?,
      residentName: resident == null
          ? null
          : '${resident['preferredName'] ?? resident['firstName'] ?? ''} ${resident['lastName'] ?? ''}'
                .trim(),
      room: resident?['room'] as String?,
    );
  }
}

class CareTask {
  const CareTask({
    required this.id,
    required this.title,
    required this.category,
    required this.dueAt,
    required this.status,
    required this.residentName,
    required this.room,
    this.assigneeName,
    this.notes,
  });

  final String id;
  final String title;
  final String category;
  final DateTime dueAt;
  final String status;
  final String residentName;
  final String room;
  final String? assigneeName;
  final String? notes;

  bool get overdue => status != 'COMPLETED' && dueAt.isBefore(DateTime.now());

  factory CareTask.fromJson(Map<String, dynamic> json) {
    final resident = json['resident'] as Map<String, dynamic>? ?? const {};
    final assignee = json['assignee'] as Map<String, dynamic>?;
    return CareTask(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      category: json['category'] as String? ?? 'Care',
      dueAt:
          DateTime.tryParse(json['dueAt'] as String? ?? '') ?? DateTime.now(),
      status: json['status'] as String? ?? 'PENDING',
      residentName:
          '${resident['preferredName'] ?? resident['firstName'] ?? ''} ${resident['lastName'] ?? ''}'
              .trim(),
      room: resident['room'] as String? ?? '—',
      assigneeName: assignee == null
          ? null
          : '${assignee['firstName'] ?? ''} ${assignee['lastName'] ?? ''}'
                .trim(),
      notes: json['notes'] as String?,
    );
  }
}

class DailyHealthRecord {
  const DailyHealthRecord({
    required this.id,
    required this.reportDate,
    required this.recordedBy,
    required this.residentName,
    required this.room,
    required this.medicationTaken,
    required this.healthChange,
    this.bloodPressure,
    this.pulse,
    this.temperature,
    this.oxygenSaturation,
    this.mood,
    this.concerns,
  });

  final String id;
  final DateTime reportDate;
  final String recordedBy;
  final String residentName;
  final String room;
  final bool medicationTaken;
  final bool healthChange;
  final String? bloodPressure;
  final int? pulse;
  final double? temperature;
  final int? oxygenSaturation;
  final String? mood;
  final String? concerns;

  factory DailyHealthRecord.fromJson(Map<String, dynamic> json) {
    final resident = json['resident'] as Map<String, dynamic>? ?? const {};
    return DailyHealthRecord(
      id: json['id'] as String? ?? '',
      reportDate:
          DateTime.tryParse(json['reportDate'] as String? ?? '') ??
          DateTime.now(),
      recordedBy: json['recordedBy'] as String? ?? '',
      residentName:
          '${resident['preferredName'] ?? resident['firstName'] ?? ''} ${resident['lastName'] ?? ''}'
              .trim(),
      room: resident['room'] as String? ?? '—',
      medicationTaken: json['medicationTaken'] as bool? ?? false,
      healthChange: json['healthChange'] as bool? ?? false,
      bloodPressure: json['bloodPressure'] as String?,
      pulse: json['pulse'] as int?,
      temperature: (json['temperature'] as num?)?.toDouble(),
      oxygenSaturation: json['oxygenSaturation'] as int?,
      mood: json['mood'] as String?,
      concerns: json['concerns'] as String?,
    );
  }
}
