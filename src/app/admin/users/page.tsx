import dynamic from "next/dynamic";

const AdminUsersPage = dynamic(() => import("./AdminUsersPage"), { ssr: false });

export default function Page() {
  return <AdminUsersPage />;
}
