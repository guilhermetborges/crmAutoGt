'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const { data } = await api.get('/api/v1/contacts');
            setContacts(data.data || []);
        } catch (err) {
            console.error('Error fetching contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = contacts.filter(c =>
        (c.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        c.phone_number.includes(search)
    );

    return (
        <div className="admin-page animate-fade-in">
            <style jsx>{`
        .admin-page { padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .title { font-size: 24px; font-weight: 700; }
        .search-input { 
          padding: 10px 16px; 
          background: var(--surface); 
          border: 1px solid var(--border); 
          border-radius: 12px; 
          color: white; 
          width: 300px;
        }
        .table-container { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 16px 24px; background: rgba(255, 255, 255, 0.02); color: var(--text-muted); font-size: 13px; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid var(--border); }
        td { padding: 16px 24px; border-bottom: 1px solid var(--border); font-size: 14px; }
        .avatar { width: 32px; height: 32px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; }
      `}</style>

            <div className="header">
                <h1 className="title">Contatos</h1>
                <input
                    className="search-input"
                    placeholder="Buscar contato..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="table-container">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>WA ID</th>
                                <th>Opt-in</th>
                                <th>Criado em</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContacts.map(contact => (
                                <tr key={contact.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="avatar">{contact.name ? contact.name[0].toUpperCase() : '?'}</div>
                                            {contact.name || 'Sem Nome'}
                                        </div>
                                    </td>
                                    <td>{contact.phone_number}</td>
                                    <td>{contact.wa_id}</td>
                                    <td>{contact.opt_in ? '✅' : '❌'}</td>
                                    <td>{new Date(contact.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
