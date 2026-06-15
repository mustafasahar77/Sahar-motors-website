import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "Inventory Manager",
  description: "Internal tool for managing Sahar Motors inventory.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="min-h-[60vh] bg-slate-50">
      <AdminApp />
    </div>
  );
}
