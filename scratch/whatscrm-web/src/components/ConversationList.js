'use client';

export default function ConversationList({ conversations, activeId, onSelect }) {
    return (
        <div className="conv-list">
            <style jsx>{`
        .conv-list {
          width: 340px;
          height: 100%;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          background: rgba(15, 23, 42, 0.5);
        }
        .header {
          padding: 24px 20px;
          border-bottom: 1px solid var(--border);
        }
        .title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .search-container {
          position: relative;
        }
        .search-input {
          width: 100%;
          padding: 10px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: white;
          font-size: 14px;
        }
        .list-container {
          flex: 1;
          overflow-y: auto;
        }
        .item {
          padding: 16px 20px;
          cursor: pointer;
          display: flex;
          gap: 12px;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }
        .item:hover {
          background: var(--surface-hover);
        }
        .item.active {
          background: rgba(31, 147, 255, 0.1);
          border-left: 3px solid var(--primary);
        }
        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          flex-shrink: 0;
        }
        .info {
          flex: 1;
          min-width: 0;
        }
        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .name {
          font-weight: 600;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .time {
          font-size: 11px;
          color: var(--text-muted);
        }
        .last-msg {
          font-size: 13px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .empty {
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
        }
      `}</style>

            <div className="header">
                <h2 className="title">Mensagens</h2>
                <div className="search-container">
                    <input className="search-input" placeholder="Buscar conversas..." />
                </div>
            </div>

            <div className="list-container">
                {conversations.length > 0 ? (
                    conversations.map((c) => (
                        <div
                            key={c.id}
                            className={`item ${activeId === c.id ? 'active' : ''}`}
                            onClick={() => onSelect(c)}
                        >
                            <div className="avatar">
                                {c.contact.name ? c.contact.name[0].toUpperCase() : '?'}
                            </div>
                            <div className="info">
                                <div className="top">
                                    <span className="name">{c.contact.name || c.contact.phone_number}</span>
                                    <span className="time">{new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="last-msg">
                                    {c.messages && c.messages[0] ? c.messages[0].content : 'Inicie uma conversa'}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty">Nenhuma conversa encontrada</div>
                )}
            </div>
        </div>
    );
}
