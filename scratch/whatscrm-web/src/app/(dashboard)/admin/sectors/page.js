'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function SectorsPage() {
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSectors();
    }, []);

    const fetchSectors = async () => {
        try {
            const { data } = await api.get('/api/v1/sectors');
            setSectors(data || []);
        } catch (err) {
            console.error('Error fetching sectors:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page animate-fade-in">
            <style jsx>{`
        .admin-page { padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .title { font-size: 24px; font-weight: 700; }
        .btn-add { background: var(--primary); color: white; padding: 10px 20px; border-radius: 10px; font-weight: 600; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .card { padding: 24px; border-radius: 16px; position: relative; overflow: hidden; }
        .card-color { width: 4px; height: 100%; position: absolute; left: 0; top: 0; }
        .sector-name { font-weight: 700; font-size: 18px; margin-bottom: 8px; display: block; }
        .sector-desc { color: var(--text-muted); font-size: 14px; margin-bottom: 16px; display: block; }
        .stats { display: flex; gap: 16px; font-size: 12px; color: var(--text-muted); }
      `}</style>

            <div className="header">
                <h1 className="title">Setores</h1>
                <button className="btn-add">+ Novo Setor</button>
            </div>

            {loading ? (
                <div>Carregando...</div>
            ) : (
                <div className="grid">
                    {sectors.map(s => (
                        <div key={s.id} className="card glass">
                            <div className="card-color" style={{ background: s.color }}></div>
                            <span className="sector-name">{s.name}</span>
                            <span className="sector-desc">{s.description || 'Sem descrição'}</span>
                            <div className="stats">
                                <span>🟢 {s.active ? 'Ativo' : 'Inativo'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
