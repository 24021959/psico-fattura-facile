import { ReactNode, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { DiaryUpgradeModal } from "./DiaryUpgradeModal";

interface ProtectedDiaryProps {
  children: ReactNode;
}

export function ProtectedDiary({ children }: ProtectedDiaryProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { userSubscription, loading } = useSubscription();

  // Se stiamo caricando, non mostriamo nulla
  if (loading) {
    return null;
  }

  // Se l'utente ha il piano FREE, mostra il modal di upgrade
  if (userSubscription?.plan_name === 'FREE') {
    return (
      <>
        {/* Nascondiamo il contenuto per utenti FREE */}
        <DiaryUpgradeModal 
          open={true} 
          onOpenChange={() => {
            // Non permettiamo di chiudere il modal, si deve tornare indietro
            window.history.back();
          }}
        />
      </>
    );
  }

  // Per tutti gli altri piani (STANDARD, PRO), mostra il contenuto
  return <>{children}</>;
}