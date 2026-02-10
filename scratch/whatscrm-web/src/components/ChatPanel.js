'use client';
import { useState } from 'react';

export default function ChatPanel({ conversation, messages, onSendMessage }) {
    const [inputText, setInputText] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        onSendMessage(inputText);
        setInputText('');
    };

    if (!conversation) {
        return (
            <div className="empty-panel">
                <style jsx>{`
          .empty-panel {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            background: var(--bg);
          }
        `}</style>
                Selecione uma conversa para começar
            </div>
        );
    }

    return (
        <div className="chat-panel">
            <style jsx>{`
        .chat-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg);
        }
        .chat-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-name {
          font-weight: 600;
          font-size: 16px;
        }
        .status-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 99px;
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }
        .timeline {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column-reverse; /* Most recent at bottom */
          gap: 16px;
        }
        .message {
          max-width: 70%;
          padding: 10px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          position: relative;
        }
        .message.inbound {
          align-self: flex-start;
          background: var(--surface);
          border-bottom-left-radius: 4px;
        }
        .message.outbound {
          align-self: flex-end;
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .message-time {
          font-size: 10px;
          margin-top: 4px;
          display: block;
          opacity: 0.7;
          text-align: right;
        }
        .composer {
          padding: 20px 24px;
          border-top: 1px solid var(--border);
          background: rgba(15, 23, 42, 0.8);
        }
        .input-wrapper {
          display: flex;
          gap: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 8px 16px;
        }
        .composer-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 8px 0;
          font-size: 14px;
        }
        .send-btn {
          color: var(--primary);
          font-weight: 600;
          font-size: 14px;
        }
      `}</style>

            <div className="chat-header">
                <div className="user-info">
                    <span className="header-name">{conversation.contact.name || conversation.contact.phone_number}</span>
                    <span className="status-badge">#{conversation.status}</span>
                </div>
            </div>

            <div className="timeline">
                {messages.map((m) => (
                    <div key={m.id} className={`message ${m.direction}`}>
                        {m.content}
                        <span className="message-time">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>

            <div className="composer">
                <form onSubmit={handleSend} className="input-wrapper">
                    <input
                        className="composer-input"
                        placeholder="Digite uma mensagem..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <button type="submit" className="send-btn">Enviar</button>
                </form>
            </div>
        </div>
    );
}
