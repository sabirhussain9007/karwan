import ApplicationForm from "@/components/ApplicationForm";

export default function HajjPage() {
  return (
    <ApplicationForm
      serviceType="Hajj"
      serviceTitle="Hajj Package Application"
      description="Apply for our comprehensive Hajj packages. We provide complete support from pre-Hajj preparation to post-Hajj assistance."
      basePrice={3000}
    />
  );
}
