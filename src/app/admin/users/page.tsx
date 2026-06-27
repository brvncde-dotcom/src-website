import type { Metadata } from "next";
import AdminUsersPage from "./AdminUsersPage";

export const metadata: Metadata = {
  title: "Admin — User Management | SRC",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <AdminUsersPage />;
}