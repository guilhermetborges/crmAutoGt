'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', category: 'MARKETING', language: 'pt_BR', content: '' });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const { data } = await api.get('/api/v1/templates');
            setTemplates(data.data || []);
        } catch (err) {
            console.error('Error fetching templates:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/v1/templates', formData);
            setIsModalOpen(false);
            fetchTemplates();
            setFormData({ name: '', category: 'MARKETING', language: 'pt_BR', content: '' });
        } catch (err) {
            alert('Erro ao salvar template: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="admin-page animate-fade-in">
            <style jsx>{`
        .admin-page { padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .title { font-size: 24px; font-weight: 700; }
        .btn-add { background: var(--primary); color: white; padding: 10px 20px; border-radius: 10px; font-weight: 600; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
        .card { padding: 24px; border-radius: 20px; }
        .template-name { font-weight: 700; font-size: 16px; margin-bottom: 4px; display: block; }
        .template-category { font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; display: block; }
        .template-body { font-size: 14px; background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 12px; }
        .status { margin-top: 12px; font-size: 12px; display: flex; align-items: center; gap: 6px; }
        .status.approved { color: var(--success); }
        .status.pending { color: var(--warning); }
        .f-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: var(--text-muted); font-size: 14px; }
        input, textarea, select { width: 100%; padding: 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 12px; color: white; }
        .btn-save { width: 100%; padding: 14px; background: var(--primary); color: white; border-radius: 12px; font-weight: 600; margin-top: 12px; }
      `}</style>

            <div className="header">
                <h1 className="title">Templates (HSM)</h1>
                <button className="btn-add" onClick={() => setIsModalOpen(true)}>+ Novo Template</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Template">
                <form onSubmit={handleSave}>
                    <div className="f-group">
                        <label>Nome do Template (WhatsApp API)</label>
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/ /g, '_') })} placeholder="ex: boas_vindas_v1" />
                    </div>
                    <div className="f-group">
                        <label>Categoria</label>
                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            <option value="MARKETING">Marketing</option>
                            <option value="UTILITY">Utility (Serviço)</option>
                            <option value="AUTHENTICATION">Authentication (Código)</option>
                        </select>
                    </div>
                    <div className="f-group">
                        <label>Idioma</label>
                        <select value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })}>
                            <option value="pt_BR">Português (Brasil)</option>
                            <option value="en_US">Inglês (EUA)</option>
                            <option value="es_ES">Espanhol</option>
                        </select>
                    </div>
                    <div className="f-group">
                        <label>Conteúdo (Use {"{{1}}"}, {"{{2}}"} para variáveis)</label>
                        <textarea required rows={5} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                    </div>
                    <button type="submit" className="btn-save">Criar Template</button>
                </form>
            </Modal>

            {loading ? (
                <div>Carregando...</div>
            ) : (
                <div className="grid">
                    {templates.map(t => (
                        <div key={t.id} className="card glass">
                            <span className="template-category">{t.category} • {t.language}</span>
                            <span className="template-name">{t.name}</span>
                            <div className="template-body">{t.content}</div>
                            <div className={`status ${t.status?.toLowerCase() || 'pending'}`}>
                                ● {t.status || 'PENDING'}
                            </div>
                        </div>
                    ))}
                    {templates.length === 0 && <div className="glass" style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center' }}>Nenhum template encontrado</div>}
                </div>
            )}
        </div>
    );
}
