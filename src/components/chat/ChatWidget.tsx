"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import type { ChatMessage } from "@/types/chat";
import AssistantMessage from "@/components/chat/AssistantMessage";

type ChatEntry = ChatMessage & { retryable?: boolean };
type FailedQuestion = { prompt: string; history: ChatMessage[] };

const welcome: ChatEntry = {
  role: "assistant",
  content: "Hi! I'm the AI Portfolio Assistant. Ask me about Abhishek's experience, skills, or projects.",
};

const suggestions = [
  "Tell me about your experience.",
  "What technologies do you work with?",
  "Explain the MVBook project.",
  "What is MVKYC?",
  "Tell me about the AI Resume Analyzer.",
  "Describe the Driver Drowsiness Detection project.",
];

const projectFollowUps: Record<string, string[]> = {
  mvbook: [
    "What was Abhishek's contribution to MVBook?",
    "Which technologies are used in MVBook?",
  ],
  mvkyc: [
    "What was Abhishek's contribution to MVKYC?",
    "Which technologies are listed for MVKYC?",
  ],
  resume: [
    "How does the Resume Analyzer compare a resume with a job description?",
    "Which technologies are used in the AI Resume Analyzer?",
  ],
  drowsiness: [
    "How does Eye Aspect Ratio help detect drowsiness?",
    "What alerts does the Driver Drowsiness Detection system provide?",
  ],
};

const assistantError = "I couldn't get an answer just now. Please try again.";

function getProjectFollowUps(messages: ChatEntry[]) {
  const latestQuestion = [...messages].reverse().find(({ role }) => role === "user")?.content.toLowerCase() ?? "";
  if (latestQuestion.includes("mvbook")) return projectFollowUps.mvbook;
  if (latestQuestion.includes("mvkyc")) return projectFollowUps.mvkyc;
  if (latestQuestion.includes("resume")) return projectFollowUps.resume;
  if (latestQuestion.includes("drowsiness") || latestQuestion.includes("driver")) return projectFollowUps.drowsiness;
  return [];
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>([welcome]);
  const [input, setInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [failedQuestion, setFailedQuestion] = useState<FailedQuestion | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      if (window.matchMedia("(pointer: coarse)").matches) dialogRef.current?.focus();
      else inputRef.current?.focus();
    }
    if (!isOpen && wasOpenRef.current) launcherRef.current?.focus();
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    endOfMessagesRef.current?.scrollIntoView({ behavior, block: "end" });
  }, [messages, isPending]);

  async function ask(prompt: string, history: ChatMessage[] = messages) {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || pendingRef.current) return;

    const question: ChatMessage = { role: "user", content: cleanPrompt };
    const nextMessages = [...history, question];
    const requestMessages = nextMessages.slice(-6);

    setInput("");
    setMessages(nextMessages);
    pendingRef.current = true;
    setIsPending(true);
    setFailedQuestion(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: requestMessages }),
      });
      const result: unknown = await response.json();
      if (response.ok && result && typeof result === "object" && "answer" in result && typeof result.answer === "string") {
        setMessages([...nextMessages, { role: "assistant", content: result.answer }]);
        return;
      }

      const safeError = result && typeof result === "object" && "error" in result && typeof result.error === "string"
        ? result.error
        : assistantError;
      setMessages([...nextMessages, { role: "assistant", content: safeError, retryable: true }]);
      setFailedQuestion({ prompt: cleanPrompt, history });
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: assistantError, retryable: true }]);
      setFailedQuestion({ prompt: cleanPrompt, history });
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void ask(input);
    }
  }

  function clearConversation() {
    setMessages([welcome]);
    setInput("");
    setFailedQuestion(null);
    inputRef.current?.focus();
  }

  const activeFollowUps = getProjectFollowUps(messages);

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <section
          ref={dialogRef}
          role="dialog"
          aria-labelledby="portfolio-chat-title"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
          className="fixed inset-x-2 bottom-2 top-2 flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/50 focus:outline-none sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[min(680px,calc(100dvh-11rem))] sm:max-h-[calc(100dvh-11rem)] sm:w-[min(400px,calc(100vw-3rem))]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-cyan"><i className="bx bx-bot text-2xl" aria-hidden="true" /></span>
              <div className="min-w-0">
                <h2 id="portfolio-chat-title" className="truncate text-sm font-semibold text-cream">AI Portfolio Assistant</h2>
                <p className="mt-0.5 text-xs text-muted">Ask about Abhishek&apos;s portfolio</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={clearConversation} disabled={isPending} className="grid size-10 place-items-center rounded-lg text-muted transition-colors hover:bg-hover-surface hover:text-cream focus-visible:outline-2 focus-visible:outline-cyan disabled:opacity-40" aria-label="Start a new chat" title="New chat"><i className="bx bx-message-square-add text-xl" aria-hidden="true" /></button>
              <button type="button" onClick={() => setIsOpen(false)} className="grid size-10 place-items-center rounded-lg text-muted transition-colors hover:bg-hover-surface hover:text-cream focus-visible:outline-2 focus-visible:outline-cyan" aria-label="Close chat"><i className="bx bx-x text-2xl" aria-hidden="true" /></button>
            </div>
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite" aria-relevant="additions text">
            {messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`min-w-0 max-w-[94%] rounded-2xl px-3.5 py-3 ${message.role === "user" ? "rounded-br-md bg-accent text-sm leading-6 text-white [overflow-wrap:anywhere] sm:max-w-[88%]" : "rounded-bl-md border border-line bg-ink sm:max-w-[94%]"}`}>
                  {message.role === "assistant" ? <AssistantMessage content={message.content} /> : <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>}
                  {message.retryable && failedQuestion && (
                    <button type="button" onClick={() => void ask(failedQuestion.prompt, failedQuestion.history)} disabled={isPending} className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg text-xs font-semibold text-cyan underline decoration-cyan/50 underline-offset-4 focus-visible:outline-2 focus-visible:outline-cyan disabled:opacity-50">
                      <i className="bx bx-refresh" aria-hidden="true" />Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!isPending && !messages.at(-1)?.retryable && messages.length > 1 && activeFollowUps.length > 0 && (
              <div className="space-y-2" aria-label="Project follow-up questions">
                <p className="text-xs font-medium text-muted">Explore this project</p>
                <div className="flex flex-wrap gap-2">
                  {activeFollowUps.map((question) => (
                    <button key={question} type="button" onClick={() => void ask(question)} disabled={isPending} className="min-h-10 max-w-full rounded-full border border-line bg-surface px-3 py-1.5 text-left text-xs leading-5 text-cyan transition-colors hover:border-cyan/40 hover:bg-hover-surface focus-visible:outline-2 focus-visible:outline-cyan disabled:opacity-50">{question}</button>
                  ))}
                </div>
              </div>
            )}
            {isPending && (
              <div className="flex justify-start" role="status" aria-label="Assistant is responding">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-line bg-ink px-4 py-3 text-sm text-muted">
                  <span className="size-2 animate-pulse rounded-full bg-cyan motion-reduce:animate-none" />Thinking…
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {messages.length === 1 && (
            <div className="border-t border-line px-4 py-3">
              <p className="mb-2 text-xs font-medium text-muted">Suggested questions</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((question) => (
                  <button key={question} type="button" onClick={() => void ask(question)} disabled={isPending} className="min-h-10 max-w-full rounded-full border border-line bg-ink px-3 py-1.5 text-left text-xs leading-5 text-cyan transition-colors hover:border-cyan/40 hover:bg-hover-surface focus-visible:outline-2 focus-visible:outline-cyan disabled:opacity-50">{question}</button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-line p-3">
            <label className="sr-only" htmlFor="portfolio-chat-input">Your question</label>
            <textarea
              ref={inputRef}
              id="portfolio-chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              maxLength={500}
              rows={1}
              placeholder="Ask about experience or projects…"
              className="max-h-28 min-h-11 min-w-0 flex-1 resize-y rounded-xl border border-line bg-ink px-3 py-2.5 text-sm leading-5 text-cream placeholder:text-dim focus:border-cyan/60 focus:outline-none focus:ring-2 focus:ring-cyan/20"
              disabled={isPending}
            />
            <button type="submit" disabled={isPending || !input.trim()} className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-white transition-colors hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send message">
              <i className="bx bx-send text-xl" aria-hidden="true" />
            </button>
          </form>
          <p className="px-4 pb-2 text-center text-[10px] text-dim">Answers are generated from public portfolio information.</p>
        </section>
      ) : (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex min-h-12 items-center gap-2 rounded-full border border-cyan/30 bg-surface px-4 text-sm font-semibold text-cream shadow-xl shadow-black/30 transition-[transform,border-color,background] hover:-translate-y-0.5 hover:border-cyan/60 hover:bg-hover-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <i className="bx bx-message-rounded-dots text-xl text-cyan" aria-hidden="true" />Ask about me
        </button>
      )}
    </div>
  );
}
