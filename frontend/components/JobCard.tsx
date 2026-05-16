import Link from "next/link";
import StatusBadge from "./StatusBadge";
import type { Job } from "@/types/job";

type JobCardProps = {
  job: Job;
};

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job._id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
          <StatusBadge status={job.status} />
        </div>

        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
          {job.category && (
            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">
              {job.category}
            </span>
          )}
          {job.location && <span>📍 {job.location}</span>}
          <span>
            🕒 {new Date(job.createdAt).toLocaleDateString("en-GB")}
          </span>
        </div>
      </div>
    </Link>
  );
}