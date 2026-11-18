export const SECTIONS = {
  messages: {
    title: "Messages",
    text: "Conversations linked to your applications and contracts will appear here. Keep project communication and payment inside Work to Work.",
    stage: "In-platform messaging is not available yet.",
  },
  contracts: {
    title: "Contracts and Milestones",
    text: "Agreed offers, milestones and their status will appear here.",
    stage: "Offers and contracts are not available yet.",
  },
  deliveries: {
    title: "Deliveries",
    text: "Submitted work, revision requests and approvals will appear here.",
    stage: "Deliveries are not available yet.",
  },
  earnings: {
    title: "Earnings and Payouts",
    text: "No earnings are shown because no payment provider is connected. Nothing has been paid or held.",
    stage: "Payments Not connected",
  },
  payments: {
    title: "Payments",
    text: "Funding, fees, receipts and refunds will appear here once a payment provider is connected. No funds are collected or held.",
    stage: "Payments Not connected",
  },
} as const;
export type SectionKey = keyof typeof SECTIONS;
export const isSection = (v: string): v is SectionKey => v in SECTIONS;
