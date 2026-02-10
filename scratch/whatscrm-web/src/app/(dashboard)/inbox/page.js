'use client';
import { useState, useEffect } from 'react';
import ConversationList from '@/components/ConversationList';
import ChatPanel from '@/components/ChatPanel';
import ContactInfo from '@/components/ContactInfo';
import api from '@/lib/api';

export default function InboxPage() {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation.id);
        }
    }, [activeConversation]);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/api/v1/conversations');
            setConversations(data.data || []);
        } catch (err) {
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (id) => {
        try {
            const { data } = await api.get(`/api/v1/conversations/${id}/messages`);
            setMessages(data.data || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    const handleSendMessage = async (content) => {
        if (!activeConversation) return;
        try {
            const { data } = await api.post(`/api/v1/conversations/${activeConversation.id}/messages`, {
                content_type: 'text',
                content
            });
            setMessages([data, ...messages]);
            // Update last message in list
            setConversations(conversations.map(c =>
                c.id === activeConversation.id ? { ...c, last_message_at: data.created_at, messages: [data] } : c
            ));
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const handleAnonymize = async (id) => {
        if (!confirm('Deseja mesmo anonimizar este contato? (LGPD)')) return;
        try {
            await api.post(`/api/v1/contacts/${id}/anonymize`);
            alert('Contato anonimizado com sucesso');
            fetchConversations();
        } catch (err) {
            console.error('Error anonymizing contact:', err);
        }
    };

    return (
        <div className="inbox-page">
            <style jsx>{`
        .inbox-page {
          display: flex;
          height: 100%;
        }
        .loading {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }
      `}</style>

            {loading ? (
                <div className="loading">Carregando conversas...</div>
            ) : (
                <>
                    <ConversationList
                        conversations={conversations}
                        activeId={activeConversation?.id}
                        onSelect={setActiveConversation}
                    />
                    <ChatPanel
                        conversation={activeConversation}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                    />
                    <ContactInfo
                        contact={activeConversation?.contact}
                        onAnonymize={handleAnonymize}
                    />
                </>
            )}
        </div>
    );
}
