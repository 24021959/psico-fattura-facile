import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminSubscriptions } from './AdminSubscriptions';
import { AdminStatistics } from './AdminStatistics';
import { AdminInvoices } from './AdminInvoices';
import { AdminSupport } from './AdminSupport';
import { AdminSettings } from './AdminSettings';
import { AdminAuditLog } from './AdminAuditLog';

interface AdminDashboardProps {
  userRole: string | null;
}

export function AdminDashboard({ userRole }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview userRole={userRole} />;
      case 'users':
        return <AdminUsers userRole={userRole} />;
      case 'subscriptions':
        return <AdminSubscriptions userRole={userRole} />;
      case 'statistics':
        return <AdminStatistics userRole={userRole} />;
      case 'invoices':
        return <AdminInvoices userRole={userRole} />;
      case 'support':
        return <AdminSupport userRole={userRole} />;
      case 'settings':
        return <AdminSettings userRole={userRole} />;
      case 'audit':
        return <AdminAuditLog userRole={userRole} />;
      default:
        return <AdminOverview userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        userRole={userRole}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}