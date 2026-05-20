"use client";

import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import JourneyApplicationModal from "@/components/JourneyApplicationModal";

type BookingModalProps = {
  serviceType: string;
  basePrice: number;
  onClose: () => void;
  packageTitle?: string;
  imageUrl?: string;
};

export default function BookingModal({
  serviceType,
  basePrice,
  onClose,
  packageTitle,
  imageUrl,
}: BookingModalProps) {
  const { status, data: session } = useSession();

  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="rounded-3xl border border-stone-800 bg-stone-900 p-8">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <JourneyApplicationModal
      open
      onClose={onClose}
      packageInfo={{
        title: packageTitle || serviceType,
        category: serviceType,
        price: basePrice,
        imageUrl,
      }}
      userName={session?.user?.name}
      userEmail={session?.user?.email}
    />
  );
}
