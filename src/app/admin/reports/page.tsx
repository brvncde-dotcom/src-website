import type { Metadata } from "next";
import AdminReportsPage from "./AdminReportsPage";

export const metadata: Metadata = {
  title: "Admin — Report Review | SRC",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <AdminReportsPage />;
}