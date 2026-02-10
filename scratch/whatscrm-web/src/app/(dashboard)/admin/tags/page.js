'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function TagsPage() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="admin-page animate-fade-in">
            <style jsx>{`
        .admin-page { padding: 40px; }
        .tag-list { display: flex; flex-wrap: wrap; gap: 12px; }
        .tag-pill { padding: 8px 16px; border-radius: 99px; font-size: 14px; font-weight: 600; border: 1px solid rgba(255, 255, 255, 0.1); }
      `}</style>
            <h1 style={{ marginBottom: '24px' }}>Tags</h1>
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
