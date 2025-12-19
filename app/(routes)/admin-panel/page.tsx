"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminPanel from "./_components/adminpanel";
import { useAuthStore } from "@/store/auth-store";

// Define roles (can also be centralized in a common file)
const ROLE = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super-admin",
} as const;

export default function AdminPanelPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  // ✅ Allow both admin and super-admin
  const isAdminOrSuperAdmin =
    user?.role === ROLE.ADMIN || user?.role === ROLE.SUPER_ADMIN;

  useEffect(() => {
    if (!token || !user) {
      router.push("/login");
    } else if (!isAdminOrSuperAdmin) {
      router.push("/unauthorized");
    }
  }, [token, user, isAdminOrSuperAdmin, router]);

  // While loading user/token info
  if (!token || !user || !isAdminOrSuperAdmin) {
    return <p className="text-white">Loading...</p>;
  }

  return <AdminPanel user={user} />;
}
