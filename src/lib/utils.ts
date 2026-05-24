import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function isSchoolEmail(email: string): boolean {
  const allowedDomains = [
    "moklet.com",
    "smktelkom-mlg.sch.id",
    "student.moklet.com",
  ];
  const domain = email.split("@")[1]?.toLowerCase();
  return allowedDomains.includes(domain);
}

export function getSkillLevelColor(
  level: "beginner" | "intermediate" | "advanced" | "expert"
): string {
  const colors = {
    beginner:     "bg-gray-500/20 text-gray-300 border-gray-500/30",
    intermediate: "bg-red-500/15 text-red-300 border-red-500/25",
    advanced:     "bg-red-700/20 text-red-200 border-red-700/30",
    expert:       "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  };
  return colors[level];
}

export function getSkillLevelLabel(
  level: "beginner" | "intermediate" | "advanced" | "expert"
): string {
  const labels = {
    beginner: "Pemula",
    intermediate: "Menengah",
    advanced: "Mahir",
    expert: "Ahli",
  };
  return labels[level];
}

export function calculateProfileCompletion(teacher: {
  photo_url?: string | null;
  bio?: string | null;
  motto?: string | null;
  subject?: string | null;
  experience?: number | null;
  linkedin?: string | null;
  skills?: unknown[];
  certifications?: unknown[];
  portfolios?: unknown[];
  achievements?: unknown[];
}): number {
  const checks = [
    { value: teacher.photo_url, weight: 20 },
    { value: teacher.bio, weight: 15 },
    { value: teacher.motto, weight: 5 },
    { value: teacher.subject, weight: 10 },
    { value: teacher.experience, weight: 5 },
    { value: teacher.linkedin, weight: 5 },
    { value: (teacher.skills?.length ?? 0) > 0, weight: 15 },
    { value: (teacher.certifications?.length ?? 0) > 0, weight: 15 },
    { value: (teacher.portfolios?.length ?? 0) > 0, weight: 10 },
  ];

  const total = checks.reduce((acc, check) => {
    return acc + (check.value ? check.weight : 0);
  }, 0);

  return Math.min(100, total);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function getCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return "";

  const transforms = [];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.quality) transforms.push(`q_${options.quality}`);
  if (options?.format) transforms.push(`f_${options.format}`);
  transforms.push("c_fill");

  const transformStr = transforms.length ? transforms.join(",") + "/" : "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}${publicId}`;
}
