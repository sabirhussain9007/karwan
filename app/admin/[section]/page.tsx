import AdminDashboardCore from "@/components/AdminDashboardCore";

export default function AdminSectionPage({ params }: { params: { section: string } }) {
  // Pass the dynamic section from the URL as the initial active tab
  return <AdminDashboardCore initialTab={params.section} />;
}
