'use client';

export default function ContactInfo({ contact, onAnonymize }) {
    if (!contact) return <div className="contact-info glass">Selecione um contato</div>;

    return (
        <div className="contact-info glass animate-fade-in">
            <style jsx>{`
        .contact-info {
          width: 300px;
          height: 100%;
          border-left: 1px solid var(--border);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(15, 23, 42, 0.5);
        }
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
          border: 4px solid var(--border);
        }
        .name {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 4px;
          text-align: center;
        }
        .phone {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 32px;
        }
        .section {
          width: 100%;
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }
        .detail-item {
          font-size: 14px;
          margin-bottom: 8px;
        }
        .anonymize-btn {
          margin-top: auto;
          width: 100%;
          padding: 12px;
          border: 1px solid var(--error);
          color: var(--error);
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
        }
        .anonymize-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>

            <div className="avatar">
                {contact.name ? contact.name[0].toUpperCase() : '?'}
            </div>
            <h2 className="name">{contact.name || 'Sem Nome'}</h2>
            <span className="phone">{contact.phone_number}</span>

            <div className="section">
                <span className="section-title">Dados do Contato</span>
                <div className="detail-item">Opt-in: {contact.opt_in ? '✅ Sim' : '❌ Não'}</div>
                <div className="detail-item">ID WA: {contact.wa_id}</div>
            </div>

            <button className="anonymize-btn" onClick={() => onAnonymize(contact.id)}>
                Anonimizar (LGPD)
            </button>
        </div>
    );
}
