import { listResumes } from "./resumes.functions";
export const resumesOptions = { queryKey: ["account-resumes"], queryFn: () => listResumes() };
