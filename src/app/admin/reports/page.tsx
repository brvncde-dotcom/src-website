"use client";

import dynamic from "next/dynamic";

const AdminReportsPage = dynamic(() => import("./AdminReportsPage"), { ssr: false });

export default function Page() {
  return <AdminReportsPage />;
}
