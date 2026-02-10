'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/api/v1/users');
            setUsers(data.data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page animate-fade-in">
            <style jsx>{`
        .admin-page {
          padding: 40px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .title {
          font-size: 24px;
          font-weight: 700;
        }
        .btn-add {
          background: var(--primary);
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
        }
        .table-container {
          background: var(--surface);
          border-radius: 16px;
          border: 1px solid var(--border);
          overflow: hidden;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }
        td {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
        }
        .role-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(31, 147, 255, 0.1);
          color: var(--primary);
        }
        .status-active {
          color: var(--success);
        }
        .status-inactive {
          color: var(--error);
        }
      `}</style>

            <div className="header">
                <h1 className="title">Usuários</h1>
                <button className="btn-add">+ Novo Usuário</button>
            </div>

            <div className="table-container">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Cargo</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td><span className="role-badge">{user.role}</span></td>
                                    <td>
                                        <span className={user.active ? 'status-active' : 'status-inactive'}>
                                            ● {user.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
