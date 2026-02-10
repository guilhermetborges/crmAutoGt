'use client';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        .modal-content {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          width: 100%;
          max-width: 500px;
          padding: 32px;
          position: relative;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .modal-title {
          font-size: 20px;
          font-weight: 700;
        }
        .close-btn {
          font-size: 24px;
          color: var(--text-muted);
          transition: color 0.2s;
        }
        .close-btn:hover {
          color: white;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

            <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
