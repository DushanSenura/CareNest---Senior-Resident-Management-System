"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  FileText,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authHeaders } from "@/lib/api";
import { Button } from "./ui";

type Section = {
  key: string;
  title: string;
  description: string;
  fields: string[];
};
const sections: Section[] = [
  {
    key: "admission",
    title: "Admission details",
    description: "Placement, referral and assigned care team.",
    fields: [
      "Admission type",
      "Admission status",
      "Branch",
      "Building",
      "Floor",
      "Room",
      "Expected length of stay",
      "Referral source",
      "Assigned admission officer",
      "Assigned care manager",
      "Assigned primary caregiver",
    ],
  },
  {
    key: "personalInformation",
    title: "Personal information",
    description: "Identity, background and contact details.",
    fields: [
      "Profile photograph URL",
      "Title",
      "First name",
      "Middle name",
      "Last name",
      "Preferred name",
      "Previous name",
      "Date of birth",
      "Gender",
      "Marital status",
      "Nationality",
      "National ID or passport number",
      "Preferred language",
      "Secondary language",
      "Religion or spiritual preference",
      "Occupation or previous occupation",
      "Residential address",
      "City",
      "Province or state",
      "Postal code",
      "Country",
      "Phone number",
      "Email address",
    ],
  },
  {
    key: "contacts",
    title: "Family & emergency contacts",
    description: "Multiple contacts and their permissions.",
    fields: [],
  },
  {
    key: "guardianLegal",
    title: "Guardian & legal representative",
    description: "Authority, representation and limitations.",
    fields: [
      "Guardian required",
      "Guardian full name",
      "Relationship",
      "National ID or passport number",
      "Phone number",
      "Email address",
      "Address",
      "Legal authority type",
      "Authority start date",
      "Authority expiry date",
      "Legal document URL",
      "Decision-making limitations",
      "Additional notes",
    ],
  },
  {
    key: "medicalInformation",
    title: "Medical information",
    description: "Clinical history, providers, directives and devices.",
    fields: [
      "Primary doctor",
      "Doctor phone number",
      "Doctor email",
      "Hospital or clinic",
      "Health insurance provider",
      "Insurance policy number",
      "Blood group",
      "Height",
      "Weight",
      "Primary diagnosis",
      "Secondary diagnoses",
      "Chronic medical conditions",
      "Previous surgeries",
      "Hospitalization history",
      "Current symptoms",
      "Communicable diseases",
      "Vaccination status",
      "Last medical examination date",
      "Medical devices used",
      "Pacemaker",
      "Hearing aid",
      "Oxygen equipment",
      "Catheter",
      "Prosthesis",
      "Advance healthcare directive",
      "Do-not-resuscitate status",
      "Organ donation preference",
      "Medical notes",
    ],
  },
  {
    key: "allergies",
    title: "Allergies",
    description: "Repeatable allergy and emergency-treatment records.",
    fields: [],
  },
  {
    key: "medicationInformation",
    title: "Medication information",
    description: "Current prescriptions and supplies received.",
    fields: [],
  },
  {
    key: "mobilityAssistance",
    title: "Mobility & physical assistance",
    description: "Mobility, transfers, falls and equipment.",
    fields: [
      "Mobility status",
      "Transfer assistance level",
      "Fall history",
      "Fall risk level",
      "Balance issues",
      "Physical limitations",
      "Paralysis or weakness",
      "Prosthetic devices",
      "Physiotherapy required",
      "Exercise restrictions",
      "Preferred mobility equipment",
      "Mobility notes",
    ],
  },
  {
    key: "dailyLiving",
    title: "Activities of daily living",
    description: "Assistance required for everyday activities.",
    fields: [
      "Bathing",
      "Dressing",
      "Grooming",
      "Oral hygiene",
      "Toileting",
      "Continence care",
      "Eating",
      "Drinking",
      "Walking",
      "Transfers",
      "Bed positioning",
      "Medication management",
      "Communication",
      "Shopping",
      "Financial management",
    ],
  },
  {
    key: "cognitiveMentalHealth",
    title: "Cognitive & mental health",
    description: "Cognition, behaviour, risks and support approach.",
    fields: [
      "Cognitive status",
      "Dementia diagnosis",
      "Alzheimer’s diagnosis",
      "Memory problems",
      "Confusion or disorientation",
      "Decision-making ability",
      "Behavioural concerns",
      "Wandering risk",
      "Aggression risk",
      "Anxiety",
      "Depression",
      "Sleep disturbance",
      "Mental health diagnosis",
      "Psychiatrist or psychologist details",
      "Triggers",
      "Calming techniques",
      "Communication approach",
      "Mental health notes",
    ],
  },
  {
    key: "communicationSensory",
    title: "Communication & sensory needs",
    description: "Communication, hearing, vision and accessibility.",
    fields: [
      "Preferred communication method",
      "Hearing impairment",
      "Hearing aid used",
      "Visual impairment",
      "Glasses used",
      "Speech difficulty",
      "Sign language required",
      "Interpreter required",
      "Reading ability",
      "Writing ability",
      "Communication devices",
      "Communication preferences",
      "Sensory needs",
      "Notes",
    ],
  },
  {
    key: "nutritionDietary",
    title: "Nutrition & dietary information",
    description: "Diet, swallowing, fluids and meal support.",
    fields: [
      "Diet type",
      "Food allergies",
      "Food intolerances",
      "Religious dietary requirements",
      "Texture requirements",
      "Feeding assistance",
      "Swallowing difficulty",
      "Choking risk",
      "Appetite level",
      "Preferred foods",
      "Disliked foods",
      "Fluid restriction",
      "Fluid intake target",
      "Nutritional supplements",
      "Dietitian required",
      "Meal notes",
    ],
  },
  {
    key: "continenceToileting",
    title: "Continence & toileting",
    description: "Continence status, products, schedule and care.",
    fields: [
      "Bladder continence status",
      "Bowel continence status",
      "Incontinence products used",
      "Catheter used",
      "Toileting schedule",
      "Assistance required",
      "Constipation history",
      "Bowel management plan",
      "Skin-care requirements",
      "Notes",
    ],
  },
  {
    key: "personalCare",
    title: "Personal care preferences",
    description: "Daily routine, grooming, sleep and privacy.",
    fields: [
      "Preferred wake-up time",
      "Preferred bedtime",
      "Bathing preference",
      "Shower or bath preference",
      "Preferred bathing days",
      "Preferred clothing style",
      "Grooming preferences",
      "Hair-care preferences",
      "Oral-care routine",
      "Sleeping position",
      "Night-light required",
      "Room temperature preference",
      "Privacy preferences",
      "Gender preference for caregiver",
      "Daily routine notes",
    ],
  },
  {
    key: "socialLifestyle",
    title: "Social, cultural & lifestyle",
    description: "Personal history, interests, culture and relationships.",
    fields: [
      "Hobbies",
      "Interests",
      "Favourite activities",
      "Previous occupation",
      "Cultural background",
      "Religious practices",
      "Important celebrations",
      "Music preferences",
      "Reading preferences",
      "Social interaction preference",
      "Family visit preference",
      "Smoking status",
      "Alcohol use",
      "Pet preferences",
      "Community involvement",
      "Personal history or biography",
      "Important life events",
    ],
  },
  {
    key: "behaviourSafety",
    title: "Behaviour & safety risks",
    description: "Risk screening and control measures.",
    fields: [
      "Fall risk",
      "Wandering risk",
      "Self-harm risk",
      "Aggression risk",
      "Choking risk",
      "Seizure risk",
      "Pressure injury risk",
      "Infection risk",
      "Medication refusal risk",
      "Elopement risk",
      "Night-time confusion",
      "Emergency evacuation assistance",
      "Known triggers",
      "Risk-control measures",
      "Safety notes",
    ],
  },
  {
    key: "accommodation",
    title: "Room & accommodation",
    description: "Room placement, accessibility and belongings.",
    fields: [
      "Room type",
      "Preferred floor",
      "Preferred wing",
      "Preferred roommate gender",
      "Air conditioning required",
      "Accessible bathroom required",
      "Balcony preferred",
      "Near nursing station",
      "Quiet room preferred",
      "Furniture brought by resident",
      "Electrical appliances brought",
      "Personal belongings list",
      "Valuable items list",
      "Room preference notes",
    ],
  },
  {
    key: "financialBilling",
    title: "Financial & billing",
    description:
      "Fees, funding and invoice preferences. Never enter full card details.",
    fields: [
      "Billing contact",
      "Billing address",
      "Fee plan",
      "Room rate",
      "Care package",
      "Additional services",
      "Deposit amount",
      "Deposit paid",
      "Payment frequency",
      "Payment method",
      "Payment provider reference",
      "Insurance coverage",
      "Government funding",
      "Sponsor details",
      "Discount",
      "Tax information",
      "Invoice delivery method",
      "Outstanding balance",
      "Financial notes",
    ],
  },
  {
    key: "admissionAssessment",
    title: "Admission assessment",
    description: "Multidisciplinary assessments and suitability.",
    fields: [
      "Initial health assessment",
      "Nursing assessment",
      "Mobility assessment",
      "Cognitive assessment",
      "Nutrition assessment",
      "Fall-risk assessment",
      "Pressure injury assessment",
      "Mental health assessment",
      "Medication review",
      "Care level required",
      "Recommended services",
      "Admission suitability",
      "Assessment completed by",
      "Assessment date",
      "Assessment notes",
    ],
  },
  {
    key: "requiredServices",
    title: "Required services",
    description: "Services to include in the initial care package.",
    fields: [
      "Nursing care",
      "Medication support",
      "Physiotherapy",
      "Occupational therapy",
      "Speech therapy",
      "Dietitian support",
      "Dementia care",
      "Mental health support",
      "Palliative care",
      "Wound care",
      "Continence care",
      "Transportation",
      "Laundry",
      "Personal grooming",
      "Special meal service",
      "One-to-one supervision",
    ],
  },
  {
    key: "documentsUploads",
    title: "Documents & uploads",
    description: "Repeatable document and verification records.",
    fields: [],
  },
];

const repeatFields: Record<string, string[]> = {
  contacts: [
    "Full name",
    "Relationship to resident",
    "Phone number",
    "Alternative phone number",
    "Email address",
    "Home address",
    "Emergency contact status",
    "Primary contact status",
    "Authorized to receive medical information",
    "Authorized to make decisions",
    "Authorized to collect the resident",
    "Preferred contact method",
    "Contact priority",
    "Notes",
  ],
  allergies: [
    "Allergy type",
    "Allergen",
    "Reaction",
    "Severity",
    "Emergency treatment required",
    "Notes",
  ],
  medicationInformation: [
    "Medication name",
    "Generic name",
    "Strength",
    "Dosage",
    "Frequency",
    "Administration route",
    "Scheduled times",
    "Start date",
    "End date",
    "Prescribing doctor",
    "Reason for medication",
    "Special instructions",
    "PRN or regular medication",
    "Resident self-administers",
    "Staff administration required",
    "Medication supply brought on admission",
    "Quantity received",
    "Expiry date",
    "Prescription URL",
  ],
  documentsUploads: [
    "Document type",
    "File URL",
    "Issue date",
    "Expiry date",
    "Verified by",
    "Verification date",
    "Notes",
  ],
};

const schema = z.object({ values: z.record(z.record(z.string().optional())) });
type FormValues = z.infer<typeof schema>;
const keyOf = (label: string) =>
  label
    .replace(/[’']/g, "")
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
const yesNo = new Set([
  "Guardian required",
  "Pacemaker",
  "Hearing aid",
  "Oxygen equipment",
  "Catheter",
  "Prosthesis",
  "Physiotherapy required",
  "Dementia diagnosis",
  "Alzheimer’s diagnosis",
  "Memory problems",
  "Confusion or disorientation",
  "Wandering risk",
  "Aggression risk",
  "Anxiety",
  "Depression",
  "Sleep disturbance",
  "Hearing impairment",
  "Hearing aid used",
  "Visual impairment",
  "Glasses used",
  "Speech difficulty",
  "Sign language required",
  "Interpreter required",
  "Swallowing difficulty",
  "Choking risk",
  "Fluid restriction",
  "Dietitian required",
  "Catheter used",
  "Night-light required",
  "Air conditioning required",
  "Accessible bathroom required",
  "Balcony preferred",
  "Near nursing station",
  "Quiet room preferred",
  "Deposit paid",
]);
const longText =
  /notes|history|diagnos|limitations|symptoms|restrictions|preferences|plan|biography|events|measures|assessment|services|belongings|items/i;

export function AdmissionForm() {
  const [step, setStep] = useState(0);
  const [records, setRecords] = useState<
    Record<string, Record<string, string>[]>
  >({
    contacts: [{}],
    allergies: [{}],
    medicationInformation: [{}],
    documentsUploads: [{}],
  });
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { values: {} },
  });
  const section = sections[step];
  const mutation = useMutation({
    mutationFn: async (form: FormValues) => {
      const values = form.values;
      const personal = values.personalInformation ?? {};
      const admission = values.admission ?? {};
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"}/residents`,
        {
          method: "POST",
          headers: authHeaders(true),
          body: JSON.stringify({
            facilityId: "demo-facility",
            firstName: personal.firstName,
            lastName: personal.lastName,
            preferredName: personal.preferredName || undefined,
            dateOfBirth: personal.dateOfBirth,
            room: admission.room,
            priority: carePriority(
              values.admissionAssessment?.careLevelRequired,
            ),
            allergies: records.allergies
              .map((item) => item.allergen)
              .filter(Boolean),
            dietaryNeeds: [values.nutritionDietary?.dietType].filter(Boolean),
            emergencyName: records.contacts[0]?.fullName || "Not provided",
            emergencyPhone: records.contacts[0]?.phoneNumber || "Not provided",
            admissionDate: new Date().toISOString(),
            admissionTime: new Date().toTimeString().slice(0, 5),
            admissionType: admission.admissionType,
            admissionStatus: admission.admissionStatus,
            branch: admission.branch,
            building: admission.building,
            floor: admission.floor,
            expectedLengthOfStay: admission.expectedLengthOfStay,
            referralSource: admission.referralSource,
            admissionOfficer: admission.assignedAdmissionOfficer,
            careManager: admission.assignedCareManager,
            primaryCaregiver: admission.assignedPrimaryCaregiver,
            admissionData: {
              ...values,
              personalInformation: personal,
              ...records,
            },
          }),
        },
      );
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message || "Admission could not be saved",
        );
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["residents"] });
      window.location.href = "/residents";
    },
  });
  const next = async () => {
    if (await trigger())
      setStep((value) => Math.min(value + 1, sections.length - 1));
  };

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="grid gap-6 xl:grid-cols-[260px_1fr]"
    >
      <aside className="card h-fit p-3 xl:sticky xl:top-5">
        <p className="px-3 py-2 text-xs font-bold uppercase tracking-[.16em] text-sage">
          Admission progress
        </p>
        <div className="max-h-[68vh] space-y-1 overflow-auto">
          {sections.map((item, index) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setStep(index)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${index === step ? "bg-forest font-semibold text-white" : "hover:bg-mint"}`}
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${index < step ? "bg-sage text-white" : index === step ? "bg-white text-forest" : "bg-cream text-sage"}`}
              >
                {index < step ? <Check size={13} /> : index + 1}
              </span>
              <span className="truncate">{item.title}</span>
            </button>
          ))}
        </div>
      </aside>
      <section className="card overflow-hidden">
        <div className="border-b p-6">
          <p className="eyebrow">
            Step {step + 1} of {sections.length}
          </p>
          <h2 className="mt-1 text-2xl font-bold">{section.title}</h2>
          <p className="mt-1 text-sm text-sage">{section.description}</p>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          {repeatFields[section.key] ? (
            <RepeatRecords
              sectionKey={section.key}
              fields={repeatFields[section.key]}
              records={records[section.key]}
              setRecords={setRecords}
            />
          ) : (
            section.fields.map((label) => (
              <Field
                key={label}
                label={label}
                path={`values.${section.key}.${keyOf(label)}`}
                register={register}
              />
            ))
          )}
          {section.key === "admission" && (
            <div className="rounded-xl bg-mint p-4 text-sm text-forest md:col-span-2">
              <strong>Created automatically:</strong> admission ID, application
              date, admission date and admission time.
            </div>
          )}
          {mutation.error && (
            <div
              role="alert"
              className="rounded-xl bg-[#fff0ec] p-4 text-sm font-medium text-coral md:col-span-2"
            >
              {mutation.error.message}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t bg-cream/50 p-5">
          <Button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}
            className="border bg-white text-ink hover:bg-mint"
          >
            <ChevronLeft size={17} />
            Previous
          </Button>
          {step < sections.length - 1 ? (
            <Button type="button" onClick={next}>
              Save & continue
              <ArrowRight size={17} />
            </Button>
          ) : (
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Creating admission…"
                : "Complete admission"}
              <Save size={17} />
            </Button>
          )}
        </div>
      </section>
    </form>
  );
}

function Field({
  label,
  path,
  register,
}: {
  label: string;
  path: string;
  register: ReturnType<typeof useForm<FormValues>>["register"];
}) {
  const inputClass =
    "focus-ring mt-1.5 w-full rounded-xl border bg-white px-3 text-sm font-normal";
  return (
    <label
      className={
        longText.test(label)
          ? "text-sm font-semibold md:col-span-2"
          : "text-sm font-semibold"
      }
    >
      {label}
      {yesNo.has(label) ? (
        <select
          {...register(path as `values.${string}.${string}`)}
          className={`${inputClass} h-11`}
        >
          <option value="">Select…</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      ) : longText.test(label) ? (
        <textarea
          {...register(path as `values.${string}.${string}`)}
          rows={3}
          className={`${inputClass} py-3`}
        />
      ) : (
        <input
          type={
            /date/i.test(label)
              ? "date"
              : /email/i.test(label)
                ? "email"
                : /time/i.test(label)
                  ? "time"
                  : "text"
          }
          {...register(path as `values.${string}.${string}`)}
          className={`${inputClass} h-11`}
        />
      )}
    </label>
  );
}

function RepeatRecords({
  sectionKey,
  fields,
  records,
  setRecords,
}: {
  sectionKey: string;
  fields: string[];
  records: Record<string, string>[];
  setRecords: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>[]>>
  >;
}) {
  const update = (index: number, key: string, value: string) =>
    setRecords((all) => ({
      ...all,
      [sectionKey]: all[sectionKey].map((record, i) =>
        i === index ? { ...record, [key]: value } : record,
      ),
    }));
  return (
    <div className="space-y-4 md:col-span-2">
      {records.map((record, index) => (
        <div
          key={index}
          className="relative grid gap-4 rounded-2xl border bg-cream/30 p-5 md:grid-cols-2"
        >
          <div className="font-bold md:col-span-2">Record {index + 1}</div>
          {fields.map((label) => (
            <label key={label} className="text-sm font-semibold">
              {label}
              <input
                value={record[keyOf(label)] ?? ""}
                onChange={(event) =>
                  update(index, keyOf(label), event.target.value)
                }
                className="focus-ring mt-1.5 h-11 w-full rounded-xl border bg-white px-3 font-normal"
              />
            </label>
          ))}
          {records.length > 1 && (
            <button
              type="button"
              aria-label="Remove record"
              onClick={() =>
                setRecords((all) => ({
                  ...all,
                  [sectionKey]: all[sectionKey].filter((_, i) => i !== index),
                }))
              }
              className="absolute right-4 top-4 text-coral"
            >
              <Trash2 size={17} />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setRecords((all) => ({
            ...all,
            [sectionKey]: [...all[sectionKey], {}],
          }))
        }
        className="flex items-center gap-2 text-sm font-semibold text-forest"
      >
        <Plus size={17} />
        Add another record
      </button>
    </div>
  );
}
function carePriority(value?: string) {
  const text = value?.toLowerCase() ?? "";
  return text.includes("palliative") || text.includes("high")
    ? "HIGH"
    : text.includes("low") || text.includes("independent")
      ? "LOW"
      : "MEDIUM";
}
