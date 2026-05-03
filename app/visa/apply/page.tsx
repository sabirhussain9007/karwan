import ApplicationForm from "@/components/ApplicationForm";

export default function VisaPage() {
  return (
    <ApplicationForm
      serviceType="Visa Services"
      serviceTitle="Visa Services Application"
      description="We provide professional visa assistance for multiple countries. Get expert help with documentation and application process."
      basePrice={200}
    />
  );
}
