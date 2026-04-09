export type JobStatus = "Applied" | "OA" | "Interviewing" | "Offered" | "Rejected";

export interface JobListing {
  id: string;
  company: string;
  jobTitle: string;
  location: string;
  description: string;
  applyUrl: string;
  postedDate: string;
}

export interface Job {
  id: string;
  company: string;
  jobTitle: string;
  description: string;
  resumeId: string | null;
  resumeName: string;
  status: JobStatus;
  dateApplied: string;
}

export const JOB_STATUSES: JobStatus[] = [
  "Applied",
  "OA",
  "Interviewing",
  "Offered",
  "Rejected",
];

export const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bgColor: string; borderColor: string; headerBg: string }
> = {
  Applied: {
    label: "Applied",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    headerBg: "bg-blue-100",
  },
  OA: {
    label: "OA",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    headerBg: "bg-amber-100",
  },
  Interviewing: {
    label: "Interviewing",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    headerBg: "bg-purple-100",
  },
  Offered: {
    label: "Offered",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    headerBg: "bg-green-100",
  },
  Rejected: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    headerBg: "bg-red-100",
  },
};
