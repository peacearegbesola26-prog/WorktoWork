import { getWorkspace } from "./workspace.functions";
export const workspaceOptions = { queryKey: ["account-workspace"], queryFn: () => getWorkspace() };
