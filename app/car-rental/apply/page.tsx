import ApplicationForm from "@/components/ApplicationForm";

export default function CarRentalPage() {
  return (
    <ApplicationForm
      serviceType="Car Rental"
      serviceTitle="Car Rental Application"
      description="Rent vehicles for your travel needs. We offer a fleet of well-maintained cars at competitive rates."
      basePrice={50}
    />
  );
}
