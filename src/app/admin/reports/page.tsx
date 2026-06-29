import type { Metadata } from "next";
import ClientAdminReportsPage from "./ClientAdminReportsPage";

export const metadata: Metadata = {
  title: "Admin — Report Review | SRC",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <ClientAdminReportsPage />;
}
