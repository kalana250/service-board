"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          🔧 Service Board
        </Link>

        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <>
                  <span className="text-blue-200 text-sm">
                    👋 {user.name}
                  </span>
                  <Link
                    href="/jobs/new"
                    className="bg-white text-blue-700 font-semibold px-4 py-2 rounded hover:bg-blue-50 transition text-sm"
                  >
                    + Post a Job
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="border border-blue-300 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="border border-blue-300 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-white text-blue-700 font-semibold px-4 py-2 rounded hover:bg-blue-50 transition text-sm"
                  >
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}