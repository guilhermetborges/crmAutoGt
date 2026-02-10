'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Inbox', path: '/inbox', icon: '💬' },
        { name: 'Contatos', path: '/contacts', icon: '👤' },
        { name: 'Usuários', path: '/admin/users', icon: '👥' },
        { name: 'Setores', path: '/admin/sectors', icon: '🏢' },
        { name: 'Canais', path: '/admin/channels', icon: '📱' },
        { name: 'Tags', path: '/admin/tags', icon: '🏷️' },
        { name: 'Relatórios', path: '/reports', icon: '📈' },
    ];

    return (
        <div className="sidebar animate-fade-in">
            <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
        }
        .logo {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 40px;
          padding-left: 12px;
        }
        .nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--text-muted);
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          background: var(--surface-hover);
          color: var(--text);
        }
        .nav-item.active {
          background: rgba(31, 147, 255, 0.1);
          color: var(--primary);
        }
        .icon {
          font-size: 18px;
        }
        .user-section {
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 12px;
          padding-left: 8px;
        }
        .avatar {
          width: 32px;
          height: 32px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          font-size: 14px;
        }
        .user-info {
          overflow: hidden;
        }
        .user-name {
          display: block;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

            <div className="logo">WhatsCRM</div>

            <nav className="nav">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="icon">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="user-section">
                <div className="avatar">AD</div>
                <div className="user-info">
                    <span className="user-name">Administrador</span>
                </div>
            </div>
        </div>
    );
}
