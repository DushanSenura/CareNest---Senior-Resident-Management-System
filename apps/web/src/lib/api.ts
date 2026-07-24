export type Resident = {
  id: string; firstName: string; lastName: string; preferredName?: string; room: string;
  dateOfBirth: string; status: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  allergies: string[]; dietaryNeeds: string[]; medications: { id: string; name: string; dosage: string }[];
};
export type ResidentDetail = Resident & {
  emergencyName: string; emergencyPhone: string; admissionDate: string;
  admissionProfile?: Record<string, unknown> & { admissionId?: string; admissionStatus?: string };
  carePlans: { id: string; title: string; goals: string; guidance: string; priority: string; reviewDate: string }[];
  tasks: { id: string; title: string; category: string; dueAt: string; status: string; notes?: string }[];
  incidents: { id: string; type: string; severity: string; occurredAt: string; description: string; actions: string }[];
  observations: { id: string; type: string; value: string; unit?: string; notes?: string; recordedAt: string }[];
};
export type Summary = { residents: number; tasksDue: number; tasksCompleted: number; incidents: number };
export type CarePlan = {
  id: string; title: string; goals: string; guidance: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; reviewDate: string; updatedAt: string;
  resident: { id: string; firstName: string; lastName: string; preferredName?: string; room: string; status: string };
};
export type MedicationRecord = {
  id: string; name: string; genericName?: string; strength?: string; dosage: string; route: string;
  frequency: string; instructions?: string; prescribingDoctor?: string; reason?: string;
  stockQuantity: number; stockUnit: string; reorderLevel: number; supplier?: string; batchNumber?: string;
  expiryDate?: string; active: boolean; startsAt: string; endsAt?: string;
  resident: { id: string; firstName: string; lastName: string; preferredName?: string; room: string; status: string };
};
export type StaffRecord = {
  id: string; firstName: string; lastName: string; email: string; phone?: string; role: string;
  employeeId?: string; status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'INACTIVE';
  department?: string; shift?: string; hireDate?: string; address?: string; emergencyContact?: string;
  branch?: string;
  hasLoginAccount?: boolean; mustChangePassword?: boolean; emailVerified?: boolean; linkedResidentId?: string;
  lastLoginAt?: string; createdAt?: string; profilePhotoUrl?: string;
  _count?: { tasks: number; incidents: number };
};
export type DailyHealthRecord = {
  id: string; reportDate: string; recordedBy: string; bloodPressure?: string; pulse?: number;
  temperature?: number; oxygenSaturation?: number; respiratoryRate?: number; bloodGlucose?: number;
  weight?: number; painLevel?: number; mood?: string; appetite?: string; hydration?: string;
  sleepQuality?: string; mobility?: string; bowelStatus?: string; urinaryStatus?: string;
  skinCondition?: string; medicationTaken: boolean; healthChange: boolean; concerns?: string;
  actionsTaken?: string; notes?: string; escalation?: string;
  resident: { id: string; firstName: string; lastName: string; preferredName?: string; room: string; priority: string };
};
export type CareTaskRecord={id:string;title:string;category:string;dueAt:string;status:'PENDING'|'IN_PROGRESS'|'COMPLETED'|'MISSED';notes?:string;resident:{id:string;firstName:string;lastName:string;preferredName?:string;room:string};assignee?:{id:string;firstName:string;lastName:string;role:string}};
export type ShiftRecord={id:string;shiftDate:string;startTime:string;endTime:string;shiftType:string;unit?:string;notes?:string;status:string;staff:{id:string;firstName:string;lastName:string;role:string;department?:string;status:string}};
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
async function get<T>(path: string): Promise<T> {
  const token=typeof window!=='undefined'?(localStorage.getItem('carenest_access_token')||sessionStorage.getItem('carenest_access_token')):null;
  const response = await fetch(`${API}${path}`,{headers:token?{authorization:`Bearer ${token}`}:{}}); 
  if (!response.ok) throw new Error('CareNest API is unavailable');
  return response.json();
}
export const api = {
  residents: () => get<Resident[]>('/residents'),
  resident: (id: string) => get<ResidentDetail>(`/residents/${id}`),
  carePlans: () => get<CarePlan[]>('/care-plans'),
  medications: () => get<MedicationRecord[]>('/medications'),
  staff: () => get<StaffRecord[]>('/staff'),
  dailyHealth: (date?: string) => get<DailyHealthRecord[]>(`/daily-health${date ? `?date=${date}` : ''}`),
  tasks:()=>get<CareTaskRecord[]>('/tasks'),
  shifts:(date?:string)=>get<ShiftRecord[]>(`/shifts${date?`?date=${date}`:''}`),
  summary: () => get<Summary>('/dashboard/summary'),
};
