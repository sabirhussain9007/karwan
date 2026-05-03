import ApplicationForm from "@/components/ApplicationForm";

export default function TicketingPage() {
  return (
    <ApplicationForm
      serviceType="Ticketing"
      serviceTitle="Flight Ticketing Application"
      description="Book your flights through us. Get competitive prices and reliable booking for domestic and international flights."
      basePrice={0}
    />
  );
}
