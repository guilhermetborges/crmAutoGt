'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/api/v1/audit-logs');
            setLogs(data.data || []);
        } catch (err) {
            console.error('Error fetching audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page animate-fade-in">
            <style jsx>{`
        .admin-page { padding: 40px; }
        .header { margin-bottom: 32px; }
        .title { font-size: 24px; font-weight: 700; }
        .table-container { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 16px 24px; background: rgba(255, 255, 255, 0.02); color: var(--text-muted); font-size: 13px; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid var(--border); }
        td { padding: 16px 24px; border-bottom: 1px solid var(--border); font-size: 13px; }
        .method { padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; font-size: 10px; }
        .GET { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .POST { background: rgba(31, 147, 255, 0.1); color: var(--primary); }
        .PUT, .PATCH { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
        .DELETE { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .status { font-weight: 600; }
        .status.ok { color: var(--success); }
        .status.error { color: var(--error); }
      `}</style>

            <div className="header">
                <h1 className="title">Logs de Auditoria</h1>
            </div>

            <div className="table-container">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Usuário</th>
                                <th>Ação</th>
                                <th>Entidade</th>
                                <th>Status</th>
                                <th>IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td>{new Date(log.created_at).toLocaleString()}</td>
                                    <td>{log.user?.email || 'Sistema'}</td>
                                    <td>
                                        <span className={`method ${log.action.split(' ')[0]}`}>{log.action}</span>
                                    </td>
                                    <td>{log.entity_name}</td>
                                    <td>
                                        <span className={`status ${log.status_code < 400 ? 'ok' : 'error'}`}>
                                            {log.status_code}
                                        </span>
                                    </td>
                                    <td>{log.ip_address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
