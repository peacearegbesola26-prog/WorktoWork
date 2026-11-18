import { getMyJobs, getJobApplications, getMyApplications } from "./jobs.functions";

export const myJobsOptions = { queryKey: ["account-jobs"], queryFn: () => getMyJobs() };
export const jobApplicationsOptions = {
  queryKey: ["account-job-applications"],
  queryFn: () => getJobApplications(),
};
export const myApplicationsOptions = {
  queryKey: ["account-my-applications"],
  queryFn: () => getMyApplications(),
};
