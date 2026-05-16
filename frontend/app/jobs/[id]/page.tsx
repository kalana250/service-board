"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import type { Job } from "@/types/job";

const STATUSES = ["Open", "In Progress", "Closed"] as const;

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.data);
        setSelectedStatus(res.data.data.status);
      } catch (err: unknown) {
        setError(
          (err as { response?: { status: number } }).response?.status === 404
            ? "Job not found."
            : "Failed to load job."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      setUpdateMessage(null);
      const res = await api.patch(`/jobs/${id}`, { status: selectedStatus });
      setJob(res.data.data);
      setUpdateMessage("✅ Status updated successfully");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setUpdateMessage("❌ Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      setDeleting(true);
      await api.delete(`/jobs/${id}`);
      router.push("/");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setUpdateMessage("❌ Failed to delete job");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">Loading job...</div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg">{error ?? "Job not found."}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Back to jobs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/")}
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        ← Back to all jobs
      </button>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-blue-700 text-white px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <StatusBadge status={job.status} />
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-blue-200 text-sm">
            {job.category && <span>🏷 {job.category}</span>}
            {job.location && <span>📍 {job.location}</span>}
            <span>
              🕒 Posted{" "}
              {new Date(job.createdAt).toLocaleDateString("en-GB")}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Description */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Contact Details
            </h2>
            <div className="text-sm text-gray-700 flex flex-col gap-1">
              {job.contactName && (
                <p>
                  <span className="font-medium">Name:</span> {job.contactName}
                </p>
              )}
              {job.contactEmail && (
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <a
                    href={`mailto:${job.contactEmail}`}
                    className="text-blue-600 hover:underline"
                  >
                    {job.contactEmail}
                  </a>
                </p>
              )}
              {!job.contactName && !job.contactEmail && (
                <p className="text-gray-400">No contact details provided</p>
              )}
            </div>
          </div>

          {/* Status update */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Update Status
            </h2>
            <div className="flex gap-3 items-center flex-wrap">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === job.status}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Status"}
              </button>
            </div>
            {updateMessage && (
              <p className="text-sm mt-2 text-gray-600">{updateMessage}</p>
            )}
          </div>

          {/* Delete */}
          <div className="pt-2 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded text-sm hover:bg-red-100 transition disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "🗑 Delete Job"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}