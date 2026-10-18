"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { getBackendBaseUrl, getBackendError } from "@/lib/backend";
import type { JobFitReport } from "@/types/job-analysis";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ANALYSIS_DURATION_MS = 7 * 60 * 1000;
type AnalysisState = "idle" | "processing" | "completed" | "failed";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isJobFitReport(value: unknown): value is JobFitReport {
  if (!isRecord(value)) return false;

  const stringArrayFields = [
    "required_skills_matched", "required_skills_missing", "preferred_skills_matched",
    "preferred_skills_missing", "verified_experience", "strengths", "skill_gaps",
    "interview_recommendations", "supporting_evidence", "unverified_or_unconfirmed_skills",
  ];
  const projectsValid = Array.isArray(value.relevant_projects) && value.relevant_projects.every(
    (project) => isRecord(project)
      && typeof project.project_name === "string"
      && typeof project.relevance === "string"
      && typeof project.evidence === "string",
  );
  const evidenceValid = Array.isArray(value.skill_evidence) && value.skill_evidence.every(
    (item) => isRecord(item)
      && typeof item.skill === "string"
      && typeof item.evidence === "string"
      && ["professional_experience", "project", "skills_list_only", "not_found"].includes(String(item.evidence_level)),
  );

  return Number.isInteger(value.overall_match_score)
    && Number(value.overall_match_score) >= 0
    && Number(value.overall_match_score) <= 100
    && typeof value.summary === "string"
    && stringArrayFields.every((field) => isStringArray(value[field]))
    && projectsValid
    && evidenceValid;
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return <section className="min-w-0"><h4 className="text-sm font-semibold text-cream">{title}</h4><ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-muted">{items.map((item, index) => <li key={`${title}-${index}`} className="[overflow-wrap:anywhere]">{item}</li>)}</ul></section>;
}

function AnalysisReport({ report }: { report: JobFitReport }) {
  return (
    <div className="mt-6 space-y-5 rounded-2xl border border-line bg-ink p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-cyan">Indicative match</p><p className="mt-1 text-xs text-muted">Evidence-based comparison, not a hiring probability.</p></div>
        <div className="grid size-16 place-items-center rounded-full border-2 border-accent text-xl font-bold text-cream" aria-label={`Indicative match score ${report.overall_match_score} out of 100`}>{report.overall_match_score}</div>
      </div>
      <p className="text-sm leading-7 text-muted [overflow-wrap:anywhere]">{report.summary}</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <ReportList title="Required skills matched" items={report.required_skills_matched} />
        <ReportList title="Required skills not evidenced" items={report.required_skills_missing} />
        <ReportList title="Preferred skills matched" items={report.preferred_skills_matched} />
        <ReportList title="Preferred skills not evidenced" items={report.preferred_skills_missing} />
        <ReportList title="Strengths" items={report.strengths} />
        <ReportList title="Skill gaps" items={report.skill_gaps} />
        <ReportList title="Relevant verified experience" items={report.verified_experience} />
        <ReportList title="Interview preparation" items={report.interview_recommendations} />
        <ReportList title="Supporting profile evidence" items={report.supporting_evidence} />
        <ReportList title="Skills needing confirmation" items={report.unverified_or_unconfirmed_skills} />
      </div>
      {report.relevant_projects.length > 0 && <section><h4 className="text-sm font-semibold text-cream">Relevant portfolio projects</h4><ul className="mt-2 space-y-3">{report.relevant_projects.map((project, index) => <li key={`${project.project_name}-${index}`} className="rounded-xl border border-line bg-surface p-3 text-sm"><p className="font-semibold text-cyan">{project.project_name}</p><p className="mt-1 leading-6 text-muted">{project.relevance}</p><p className="mt-1 text-xs leading-5 text-dim">Evidence: {project.evidence}</p></li>)}</ul></section>}
      {report.skill_evidence.length > 0 && <section><h4 className="text-sm font-semibold text-cream">How skills are evidenced</h4><ul className="mt-2 space-y-2">{report.skill_evidence.map((item, index) => <li key={`${item.skill}-${index}`} className="rounded-lg border border-line px-3 py-2 text-sm"><span className="font-medium text-cream">{item.skill}</span><span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-cyan">{item.evidence_level.replaceAll("_", " ")}</span><p className="mt-1 leading-6 text-muted">{item.evidence}</p></li>)}</ul></section>}
    </div>
  );
}

export default function JobFitAnalyzer() {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState<AnalysisState>("idle");
  const [error, setError] = useState("");
  const [report, setReport] = useState<JobFitReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestController = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => requestController.current?.abort(), []);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFileError("");
    setFile(null);
    if (!selected) return;
    if (!/\.(pdf|docx)$/i.test(selected.name)) {
      setFileError("Choose a PDF or DOCX file.");
      event.target.value = "";
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setFileError("The file must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    setFile(selected);
    setDescription("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || fileError) return;
    if (!file && !description.trim()) {
      setStatus("failed");
      setError("Paste a job description or choose a PDF/DOCX file.");
      return;
    }
    if (!file && description.trim().length < 40) {
      setStatus("failed");
      setError("The job description must contain at least 40 characters.");
      return;
    }
    const backendUrl = getBackendBaseUrl();
    if (!backendUrl) { setError("Job analysis is not configured for this deployment."); return; }
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, MAX_ANALYSIS_DURATION_MS);
    setIsSubmitting(true);
    setStatus("processing");
    setError("");
    setReport(null);
    try {
      const formData = new FormData();
      if (file) formData.set("file", file);
      else formData.set("job_description", description.trim());
      const response = await fetch(`${backendUrl}/api/v1/job-analysis`, { method: "POST", body: formData, signal: controller.signal, cache: "no-store" });
      if (response.status === 202) {
        throw new Error("The backend is still running the old queued analyzer. Rebuild and restart the API service, then try again.");
      }
      if (!response.ok) throw new Error(await getBackendError(response, "Could not submit the job description."));
      const result: unknown = await response.json();
      if (!isJobFitReport(result)) {
        throw new Error("The backend returned an incomplete analysis report. Restart the updated API service and try again.");
      }
      setReport(result);
      setStatus("completed");
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError" && !timedOut) return;
      setStatus("failed");
      setError(timedOut ? "Analysis took too long. Please try again later." : reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      if (requestController.current === controller) setIsSubmitting(false);
    }
  }

  function reset() {
    requestController.current?.abort();
    requestController.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsSubmitting(false);
    setDescription(""); setFile(null); setFileError(""); setStatus("idle"); setError(""); setReport(null);
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-xl shadow-black/10 sm:p-6 lg:p-8">
      <p className="max-w-3xl text-sm leading-7 text-muted">Compare a role with the verified information in Abhishek&apos;s public portfolio. Your job description is processed for this analysis and is not retained as a profile record.</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="job-description" className="mb-2 block text-sm font-medium text-cream">Paste a job description</label>
          <textarea id="job-description" value={description} onChange={(event) => { setDescription(event.target.value); setError(""); if (event.target.value) { setFile(null); setFileError(""); if (fileInputRef.current) fileInputRef.current.value = ""; } }} maxLength={30_000} rows={7} disabled={isSubmitting || !!file} placeholder="Paste the role responsibilities and requirements…" className="min-h-40 w-full resize-y rounded-xl border border-line bg-ink px-4 py-3 text-sm leading-6 text-cream placeholder:text-dim focus:border-cyan/60 focus:outline-none focus:ring-2 focus:ring-cyan/20 disabled:opacity-60" aria-describedby="job-description-help" />
          <p id="job-description-help" className="mt-1 text-xs text-dim">At least 40 characters, up to 30,000. {description.length.toLocaleString()}/30,000</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="job-file" className="block text-sm font-medium text-cream">Upload JD Document <span className="font-normal text-muted">(PDF or DOCX, max 5 MB)</span></label>
          <input ref={fileInputRef} id="job-file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={selectFile} disabled={isSubmitting} aria-describedby="job-file-help" className="block min-h-12 w-full min-w-0 cursor-pointer rounded-xl border border-line bg-ink text-sm text-muted file:mr-4 file:min-h-12 file:cursor-pointer file:border-0 file:border-r file:border-line file:bg-hover-surface file:px-4 file:font-medium file:text-cyan hover:file:bg-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:cursor-not-allowed disabled:opacity-60" />
          <p id="job-file-help" className="text-xs text-dim">Choose a PDF or DOCX using the visible file chooser, or paste the job description above.</p>
          {file && <p className="break-all text-xs text-muted" role="status">Selected: <span className="font-medium text-cream">{file.name}</span> <span>({(file.size / (1024 * 1024)).toFixed(2)} MB)</span></p>}
          {file && !isSubmitting && <button type="button" onClick={() => { setFile(null); setFileError(""); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="min-h-10 rounded-lg px-3 text-xs text-muted underline underline-offset-4 hover:text-cream focus-visible:outline-2 focus-visible:outline-cyan">Remove file</button>}
        </div>
        {fileError && <p className="text-sm text-rose-300" role="alert">{fileError}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={isSubmitting || !!fileError} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? <><span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />Analyzing…</> : "Analyze Job Description"}</button>
          {(status !== "idle" || description || file) && <button type="button" onClick={reset} className="min-h-12 rounded-xl border border-line px-4 text-sm font-medium text-muted hover:bg-hover-surface hover:text-cream focus-visible:outline-2 focus-visible:outline-cyan">Clear</button>}
        </div>
      </form>
      {isSubmitting && <p className="mt-4 text-sm text-cyan" role="status" aria-live="polite"><span className="font-semibold">Analyzing:</span> Comparing the job description with verified profile evidence…</p>}
      {error && <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-950/30 p-3 text-sm leading-6 text-rose-200" role="alert"><span className="font-semibold">Analysis failed.</span> {error}</p>}
      {report && <><p className="mt-5 text-sm font-semibold text-cyan" role="status">Analysis complete</p><AnalysisReport report={report} /></>}
    </div>
  );
}
