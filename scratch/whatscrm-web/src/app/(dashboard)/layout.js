'use client';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div className="layout">
            <style jsx>{`
        .layout {
          display: flex;
          height: 100vh;
        }
        .content {
          flex: 1;
          height: 100vh;
          overflow: auto;
          background: var(--bg);
        }
      `}</style>

            <Sidebar />
            <main className="content">
                {children}
            </main>
        </div>
    );
}
