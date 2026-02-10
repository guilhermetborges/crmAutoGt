'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';

export default function QuickRepliesPage() {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ shortcode: '', content: '' });

    useEffect(() => {
        fetchReplies();
    }, []);

    const fetchReplies = async () => {
        try {
            const { data } = await api.get('/api/v1/quick-replies');
            setReplies(data.data || []);
        } catch (err) {
            console.error('Error fetching quick replies:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/v1/quick-replies', formData);
            setIsModalOpen(false);
            fetchReplies();
            setFormData({ shortcode: '', content: '' });
        } catch (err) {
            alert('Erro ao salvar resposta: ' + (err.response?.data?.message || err.message));
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
        .card { padding: 24px; border-radius: 16px; display: flex; flex-direction: column; gap: 12px; }
        .shortcode { font-family: monospace; color: var(--primary); background: rgba(31, 147, 255, 0.1); padding: 4px 8px; border-radius: 6px; font-size: 14px; align-self: flex-start; }
        .content { font-size: 14px; color: var(--text-muted); line-height: 1.5; }
        .f-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: var(--text-muted); font-size: 14px; }
        input, textarea { width: 100%; padding: 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 12px; color: white; }
        .btn-save { width: 100%; padding: 14px; background: var(--primary); color: white; border-radius: 12px; font-weight: 600; margin-top: 12px; }
      `}</style>

            <div className="header">
                <h1 className="title">Respostas Rápidas</h1>
                <button className="btn-add" onClick={() => setIsModalOpen(true)}>+ Nova Resposta</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Resposta Rápida">
                <form onSubmit={handleSave}>
                    <div className="f-group">
                        <label>Atalho (ex: ola)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>/</span>
                            <input required value={formData.shortcode} onChange={e => setFormData({ ...formData, shortcode: e.target.value })} />
                        </div>
                    </div>
                    <div className="f-group">
                        <label>Conteúdo da Mensagem</label>
                        <textarea required rows={5} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                    </div>
                    <button type="submit" className="btn-save">Salvar Resposta</button>
                </form>
            </Modal>

            {loading ? (
                <div>Carregando...</div>
            ) : (
                <div className="grid">
                    {replies.map(reply => (
                        <div key={reply.id} className="card glass">
                            <span className="shortcode">/{reply.shortcode}</span>
                            <p className="content">{reply.content}</p>
                        </div>
                    ))}
                    {replies.length === 0 && <div className="glass" style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center' }}>Nenhuma resposta rápida encontrada</div>}
                </div>
            )}
        </div>
    );
}
