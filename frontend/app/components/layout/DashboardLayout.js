'use client';

import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ children, title = 'Dashboard', pageCode = '' }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <Header title={title} pageCode={pageCode} />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
