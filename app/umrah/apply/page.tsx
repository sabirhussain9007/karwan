import ApplicationForm from "@/components/ApplicationForm";

export default function UmrahPage() {
  return (
    <ApplicationForm
      serviceType="Umrah"
      serviceTitle="Umrah Package Application"
      description="Apply for our premium Umrah packages. Experience a spiritual journey with professional guidance and comfortable accommodations."
      basePrice={1500}
    />
  );
}
