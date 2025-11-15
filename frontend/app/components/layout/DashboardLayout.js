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

          {/* Rodapé com código da tela (canto direito) */}
          {pageCode && (
            <div className="fixed bottom-4 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
              {pageCode}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
