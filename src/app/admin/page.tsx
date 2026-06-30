import Link from "next/link";

// Admin landing hub — entry point for /admin, links to each management section.
export default function AdminHome() {
  const sections = [
    {
      href: "/admin/reports",
      title: "Reports",
      desc: "Review, approve, publish, delete — and gate reports to a members-only tier.",
    },
    {
      href: "/admin/users",
      title: "Members",
      desc: "View members, assign tiers, and grant or revoke comp memberships (free access for a period).",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-[#0A2540] mb-1">Page Management</h1>
      <p className="text-sm text-[#5A6B7F] mb-8">Manage SRC content and members.</p>
      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block border border-[#D8DEE6] rounded-lg p-6 hover:border-[#0A2540] hover:shadow-sm transition-colors bg-white"
          >
            <h2 className="text-lg font-bold text-[#0A2540] mb-1">{s.title}</h2>
            <p className="text-sm text-[#5A6B7F]">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
