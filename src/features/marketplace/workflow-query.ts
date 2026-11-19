import { getMarketplace } from "./workflow.functions";
export const marketplaceOptions = { queryKey: ["private-marketplace"], queryFn: () => getMarketplace() };