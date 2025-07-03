import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserSupportTickets } from '@/components/support/UserSupportTickets';

export default function Support() {
  return (
    <DashboardLayout>
      <UserSupportTickets />
    </DashboardLayout>
  );
}