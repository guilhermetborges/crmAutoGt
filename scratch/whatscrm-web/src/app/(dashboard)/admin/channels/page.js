'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';

export default function ChannelsPage() {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ phoneNumber: '', phoneNumberId: '', wabaId: '', businessName: '', accessToken: '' });

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

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/v1/channels', formData);
            setIsModalOpen(false);
            fetchChannels();
            setFormData({ phoneNumber: '', phoneNumberId: '', wabaId: '', businessName: '', accessToken: '' });
        } catch (err) {
            alert('Erro ao salvar canal: ' + (err.response?.data?.message || err.message));
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
        .f-group { margin-bottom: 12px; }
        label { display: block; margin-bottom: 4px; font-size: 12px; color: var(--text-muted); }
        input { width: 100%; padding: 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: white; }
        .btn-save { width: 100%; padding: 12px; background: var(--primary); color: white; border-radius: 8px; font-weight: 600; margin-top: 12px; }
      `}</style>

            <div className="header">
                <h1 className="title">Canais WhatsApp</h1>
                <button className="btn-add" onClick={() => setIsModalOpen(true)}>+ Conectar Número</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Canal WhatsApp">
                <form onSubmit={handleSave}>
                    <div className="f-group">
                        <label>Nome do Negócio</label>
                        <input required value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                    </div>
                    <div className="f-group">
                        <label>Número do WhatsApp (+55...)</label>
                        <input required value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                    </div>
                    <div className="f-group">
                        <label>Phone Number ID (Meta API)</label>
                        <input required value={formData.phoneNumberId} onChange={e => setFormData({ ...formData, phoneNumberId: e.target.value })} />
                    </div>
                    <div className="f-group">
                        <label>WABA ID (Meta API)</label>
                        <input required value={formData.wabaId} onChange={e => setFormData({ ...formData, wabaId: e.target.value })} />
                    </div>
                    <div className="f-group">
                        <label>Access Token (Permanent)</label>
                        <input type="password" required value={formData.accessToken} onChange={e => setFormData({ ...formData, accessToken: e.target.value })} />
                    </div>
                    <button type="submit" className="btn-save">Salvar Canal</button>
                </form>
            </Modal>

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
