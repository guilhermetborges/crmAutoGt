'use client';
import { useState } from 'react';

export default function ChatPanel({ conversation, messages, onSendMessage, quickReplies = [], templates = [] }) {
  const [inputText, setInputText] = useState('');
  const [showTools, setShowTools] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const useTool = (content) => {
    setInputText(content);
    setShowTools(false);
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
          position: relative;
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
          flex-direction: column-reverse;
          gap: 16px;
          background-image: radial-gradient(var(--border) 1px, transparent 1px);
          background-size: 20px 20px;
          background-position: center;
        }
        .message {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
          backdrop-filter: blur(12px);
          position: relative;
        }
        .tools-panel {
          position: absolute;
          bottom: 100%;
          left: 24px;
          right: 24px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          margin-bottom: 12px;
          max-height: 300px;
          overflow-y: auto;
          box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
          z-index: 10;
        }
        .tool-section {
          padding: 16px;
          border-bottom: 1px solid var(--border);
        }
        .tool-section:last-child { border-bottom: none; }
        .tool-title { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; display: block; }
        .tool-item {
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .tool-item:hover { background: var(--surface-hover); }
        .tool-shortcode { font-weight: 700; color: var(--primary); }
        .input-wrapper {
          display: flex;
          gap: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 8px 16px;
          align-items: center;
        }
        .composer-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 8px 0;
          font-size: 14px;
        }
        .tool-btn {
          font-size: 20px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .tool-btn:hover { opacity: 1; }
        .send-btn {
          background: var(--primary);
          color: white;
          padding: 8px 16px;
          border-radius: 10px;
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
          <div key={m.id} className={`message ${m.direction} animate-fade-in`}>
            {m.content}
            <span className="message-time">
              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      <div className="composer">
        {showTools && (
          <div className="tools-panel glass animate-fade-in">
            {quickReplies.length > 0 && (
              <div className="tool-section">
                <span className="tool-title">Respostas Rápidas</span>
                {quickReplies.map(qr => (
                  <div key={qr.id} className="tool-item" onClick={() => useTool(qr.content)}>
                    <span className="tool-shortcode">/{qr.shortcode}</span>
                    <span>{qr.content}</span>
                  </div>
                ))}
              </div>
            )}
            {templates.length > 0 && (
              <div className="tool-section">
                <span className="tool-title">Templates (HSM)</span>
                {templates.map(t => (
                  <div key={t.id} className="tool-item" onClick={() => useTool(t.content)}>
                    <span className="tool-shortcode">{t.name}</span>
                    <span>{t.content}</span>
                  </div>
                ))}
              </div>
            )}
            {quickReplies.length === 0 && templates.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Nenhum atalho configurado
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSend} className="input-wrapper">
          <button type="button" className="tool-btn" onClick={() => setShowTools(!showTools)}>⚡</button>
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
