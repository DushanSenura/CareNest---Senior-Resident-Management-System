import 'package:flutter/material.dart';

import '../theme.dart';
import '../widgets/common.dart';

class ModuleScreen extends StatelessWidget {
  const ModuleScreen({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.features,
    this.apiBacked = false,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final List<ModuleFeature> features;
  final bool apiBacked;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: CareNestColors.mint,
                  child: Icon(icon, color: CareNestColors.forest, size: 28),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(subtitle),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        SectionHeading('$title features'),
        const SizedBox(height: 8),
        ...features.map(
          (feature) => Padding(
            padding: const EdgeInsets.only(bottom: 9),
            child: Card(
              child: ListTile(
                leading: Icon(feature.icon, color: CareNestColors.forest),
                title: Text(
                  feature.title,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                subtitle: Text(feature.description),
                trailing: feature.available
                    ? const Icon(Icons.chevron_right)
                    : const StatusPill(
                        'API required',
                        color: CareNestColors.gold,
                      ),
                onTap: feature.available
                    ? () => ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('${feature.title} selected')),
                      )
                    : null,
              ),
            ),
          ),
        ),
        if (!apiBacked) ...[
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.sync_problem_outlined,
                    color: CareNestColors.gold,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'The web version currently keeps this module in browser-local storage. '
                      'A shared NestJS endpoint is required before web and mobile data can synchronize.',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }
}

class ModuleFeature {
  const ModuleFeature(
    this.title,
    this.description,
    this.icon, {
    this.available = false,
  });

  final String title;
  final String description;
  final IconData icon;
  final bool available;
}

abstract final class MobileModules {
  static const carePlans = ModuleScreen(
    title: 'Care plans',
    subtitle: 'Resident goals, guidance, priorities, and reviews.',
    icon: Icons.volunteer_activism_outlined,
    apiBacked: true,
    features: [
      ModuleFeature(
        'View care plans',
        'Review current resident plans.',
        Icons.assignment_outlined,
      ),
      ModuleFeature(
        'Create care plan',
        'Add goals and care guidance.',
        Icons.add_task_outlined,
      ),
      ModuleFeature(
        'Review schedule',
        'Monitor upcoming review dates.',
        Icons.event_repeat_outlined,
      ),
    ],
  );

  static const staff = ModuleScreen(
    title: 'Staff',
    subtitle: 'Employees, roles, branches, and account status.',
    icon: Icons.badge_outlined,
    apiBacked: true,
    features: [
      ModuleFeature(
        'Staff directory',
        'Search active staff.',
        Icons.people_outline,
      ),
      ModuleFeature(
        'Staff status',
        'Review leave and account status.',
        Icons.toggle_on,
      ),
      ModuleFeature(
        'Branch assignment',
        'View workplace assignments.',
        Icons.account_tree_outlined,
      ),
    ],
  );

  static const schedule = ModuleScreen(
    title: 'Schedule',
    subtitle: 'Appointments, activities, visits, tasks, and meetings.',
    icon: Icons.calendar_month_outlined,
    features: [
      ModuleFeature(
        'Weekly calendar',
        'Browse the Monday-first week.',
        Icons.view_week,
      ),
      ModuleFeature(
        'Appointments',
        'Resident appointments and clinical visits.',
        Icons.event_available_outlined,
      ),
      ModuleFeature(
        'Activities',
        'Recreation and community activities.',
        Icons.celebration_outlined,
      ),
    ],
  );

  static const reports = ModuleScreen(
    title: 'Reports',
    subtitle: 'Resident, care, clinical, and operational reporting.',
    icon: Icons.analytics_outlined,
    apiBacked: true,
    features: [
      ModuleFeature(
        'Resident reports',
        'Resident and admission data.',
        Icons.people,
      ),
      ModuleFeature(
        'Care reports',
        'Tasks and daily-health activity.',
        Icons.monitor_heart_outlined,
      ),
      ModuleFeature(
        'Export',
        'CSV, Excel, and PDF exports are on the web app.',
        Icons.download_outlined,
      ),
    ],
  );

  static const branches = ModuleScreen(
    title: 'Branches',
    subtitle: 'Residence branches and operational capacity.',
    icon: Icons.apartment_outlined,
    features: [
      ModuleFeature(
        'Branch directory',
        'Locations and contact information.',
        Icons.business_outlined,
      ),
      ModuleFeature(
        'Capacity',
        'Resident and staff totals.',
        Icons.bedroom_parent_outlined,
      ),
      ModuleFeature(
        'Branch status',
        'Active and inactive locations.',
        Icons.toggle_on,
      ),
    ],
  );

  static const announcements = ModuleScreen(
    title: 'Announcements',
    subtitle: 'Facility-wide staff communication.',
    icon: Icons.campaign_outlined,
    features: [
      ModuleFeature(
        'Published announcements',
        'Read current staff notices.',
        Icons.feed_outlined,
      ),
      ModuleFeature(
        'Scheduled notices',
        'Review upcoming announcements.',
        Icons.schedule_send_outlined,
      ),
      ModuleFeature(
        'Create announcement',
        'Compose and target a notice.',
        Icons.post_add_outlined,
      ),
    ],
  );

  static const auditLogs = ModuleScreen(
    title: 'Audit logs',
    subtitle: 'System activity, actors, actions, and status.',
    icon: Icons.policy_outlined,
    features: [
      ModuleFeature(
        'Activity register',
        'Search role and action events.',
        Icons.manage_search,
      ),
      ModuleFeature(
        'Developer terminal',
        'Use audit terminal commands on web.',
        Icons.terminal,
      ),
      ModuleFeature(
        'Export log',
        'Download filtered audit records.',
        Icons.download,
      ),
    ],
  );

  static const billing = ModuleScreen(
    title: 'Billing',
    subtitle: 'Invoices, balances, receipts, and payments.',
    icon: Icons.receipt_long_outlined,
    features: [
      ModuleFeature(
        'Resident invoices',
        'Review totals and balances.',
        Icons.receipt,
      ),
      ModuleFeature(
        'Record payment',
        'Card, transfer, cheque, cash, or online.',
        Icons.payments_outlined,
      ),
      ModuleFeature(
        'Receipts',
        'Attach and review payment receipts.',
        Icons.attach_file,
      ),
    ],
  );

  static const accounts = ModuleScreen(
    title: 'Accounts',
    subtitle: 'System login accounts and resident guest access.',
    icon: Icons.manage_accounts_outlined,
    apiBacked: true,
    features: [
      ModuleFeature(
        'Account directory',
        'Staff login accounts.',
        Icons.badge_outlined,
      ),
      ModuleFeature(
        'Guest account',
        'Resident-linked family access.',
        Icons.person_add_alt_outlined,
      ),
      ModuleFeature(
        'Account status',
        'Active and suspended accounts.',
        Icons.security,
      ),
    ],
  );

  static const messages = ModuleScreen(
    title: 'Messages',
    subtitle: 'Secure staff and team communication.',
    icon: Icons.chat_bubble_outline,
    features: [
      ModuleFeature(
        'Conversations',
        'Staff and team message threads.',
        Icons.forum,
      ),
      ModuleFeature(
        'New message',
        'Start a staff conversation.',
        Icons.edit_note,
      ),
      ModuleFeature(
        'Attachments',
        'Attach documents and images.',
        Icons.attach_file_outlined,
      ),
    ],
  );
}
