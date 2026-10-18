import http from "k6/http";
import { check, sleep } from "k6";

const base = __ENV.API_BASE_URL || "http://localhost:8000";
const text = __ENV.JOB_DESCRIPTION || "We are looking for a full stack software developer with experience in React, TypeScript, Python, Django REST Framework, REST APIs, PostgreSQL, and building reliable business applications. The role includes collaborating with product teams, optimizing queries, and maintaining responsive user interfaces.";

export const options = {
  scenarios: {
    recruiter_submissions: {
      executor: "ramping-arrival-rate",
      startRate: 1,
      timeUnit: "1s",
      preAllocatedVUs: 10,
      maxVUs: Number(__ENV.MAX_VUS || 100),
      stages: [
        { target: Number(__ENV.TARGET_RPS || 5), duration: "30s" },
        { target: Number(__ENV.TARGET_RPS || 5), duration: "60s" },
        { target: 0, duration: "10s" },
      ],
    },
  },
  thresholds: { http_req_failed: ["rate<0.05"], http_req_duration: ["p(95)<2000"] },
};

function submitJobAnalysis() {
  const response = http.post(`${base}/api/v1/job-analysis`, { job_description: text });
  check(response, { "submission accepted or rate limited": (r) => r.status === 202 || r.status === 429 });
  sleep(1);
}

export default submitJobAnalysis;
