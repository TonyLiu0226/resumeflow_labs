'use client';
import { useParams } from "next/navigation";
import ResumeForm from "@/app/components/ResumeForm";

export default function ResumeEditorPage() {
  const params = useParams();
  const slug = params.slug as string | undefined;
  const resumeId = slug === "new" || !slug ? null : String(slug);

  return <ResumeForm resumeId={resumeId} />;
}
