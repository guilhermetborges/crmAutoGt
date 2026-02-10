'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ChannelsPage() {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const { data } = await api.get('/api/v1/channels');
            setChannels(data || []);
        } catch (err) {
            console.error('Error fetching channels:', err);
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
        .list { display: flex; flex-direction: column; gap: 16px; }
        .channel-card { padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 20px; }
        .icon { font-size: 32px; background: rgba(16, 185, 129, 0.1); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .info { flex: 1; }
        .wa-name { font-weight: 700; font-size: 16px; }
        .wa-number { color: var(--text-muted); font-size: 14px; }
      `}</style>

            <div className="header">
                <h1 className="title">Canais WhatsApp</h1>
                <button className="btn-add">+ Conectar Número</button>
            </div>

            {loading ? (
                <div>Carregando...</div>
            ) : (
                <div className="list">
                    {channels.map(c => (
                        <div key={c.id} className="channel-card glass">
                            <div className="icon">📱</div>
                            <div className="info">
                                <div className="wa-name">{c.business_name || 'WhatsApp Business'}</div>
                                <div className="wa-number">{c.phone_number}</div>
                            </div>
                            <div className="badge">🟢 Ativo</div>
                        </div>
                    ))}
                    {channels.length === 0 && <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>Nenhum canal configurado</div>}
                </div>
            )}
        </div>
    );
}
