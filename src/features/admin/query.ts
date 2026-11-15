import { getAdminWorkspace } from "./admin.functions";
export const adminOptions = { queryKey: ["admin-workspace"], queryFn: () => getAdminWorkspace() };
