import ApplicationForm from "@/components/ApplicationForm";

export default function DomesticToursPage() {
  return (
    <ApplicationForm
      serviceType="Domestic Tours"
      serviceTitle="Domestic Tours Application"
      description="Discover the beauty of local destinations with our domestic tour packages. Experience authentic culture and breathtaking landscapes."
      basePrice={800}
    />
  );
}
