type StatusBadgeProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  Open: "bg-green-100 text-green-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Closed: "bg-gray-200 text-gray-600",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full ${
        statusStyles[status] ?? "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}