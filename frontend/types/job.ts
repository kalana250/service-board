export type Job = {
  _id: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  contactName?: string;
  contactEmail?: string;
  status: "Open" | "In Progress" | "Closed";
  createdAt: string;
  updatedAt: string;
};