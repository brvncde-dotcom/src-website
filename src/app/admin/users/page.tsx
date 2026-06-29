import type { Metadata } from "next";
import ClientAdminUsersPage from "./ClientAdminUsersPage";

export const metadata: Metadata = {
  title: "Admin — User Management | SRC",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <ClientAdminUsersPage />;
}
