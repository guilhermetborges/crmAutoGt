'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';

export default function TagsPage() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', color: '#1f93ff' });

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const { data } = await api.get('/api/v1/tags');
            setTags(data || []);
        } catch (err) {
            console.error('Error fetching tags:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/v1/tags', formData);
            setIsModalOpen(false);
            fetchTags();
            setFormData({ name: '', color: '#1f93ff' });
        } catch (err) {
            alert('Erro ao salvar tag: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="admin-page animate-fade-in">
            <style jsx>{`
        .admin-page { padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .title { font-size: 24px; font-weight: 700; }
        .btn-add { background: var(--primary); color: white; padding: 10px 20px; border-radius: 10px; font-weight: 600; }
        .tag-list { display: flex; flex-wrap: wrap; gap: 12px; }
        .tag-pill { padding: 8px 16px; border-radius: 99px; font-size: 14px; font-weight: 600; border: 1px solid rgba(255, 255, 255, 0.1); }
        .f-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: var(--text-muted); font-size: 14px; }
        input { width: 100%; padding: 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 12px; color: white; }
        .btn-save { width: 100%; padding: 14px; background: var(--primary); color: white; border-radius: 12px; font-weight: 600; margin-top: 12px; }
      `}</style>

            <div className="header">
                <h1 className="title">Tags</h1>
                <button className="btn-add" onClick={() => setIsModalOpen(true)}>+ Nova Tag</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Tag">
                <form onSubmit={handleSave}>
                    <div className="f-group">
                        <label>Nome da Tag</label>
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="f-group">
                        <label>Cor</label>
                        <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} style={{ height: '50px' }} />
                    </div>
                    <button type="submit" className="btn-save">Salvar Tag</button>
                </form>
            </Modal>

            <div className="tag-list">
                {tags.map(t => (
                    <div key={t.id} className="tag-pill" style={{ background: `${t.color}22`, color: t.color }}>
                        {t.name}
                    </div>
                ))}
                {tags.length === 0 && <div className="glass" style={{ padding: '40px', width: '100%', textAlign: 'center' }}>Nenhuma tag encontrada</div>}
            </div>
        </div>
    );
}
