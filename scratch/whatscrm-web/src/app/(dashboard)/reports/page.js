'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState(null);
  const [slaData, setSlaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [overview, sla] = await Promise.all([
        api.get('/api/v1/reports/overview'),
        api.get('/api/v1/reports/sla')
      ]);
      setMetrics(overview.data || { totalConversations: 0, avgResponseTime: 0, resolvedRate: 0, slaBreaches: 0 });
      setSlaData(sla.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { name: 'Total de Conversas', value: metrics?.totalConversations || 0, icon: '💬', color: '#1f93ff' },
    { name: 'Média 1ª Resposta', value: metrics?.avgResponseTime ? `${metrics.avgResponseTime} min` : '0 min', icon: '⚡', color: '#10b981' },
    { name: 'Taxa de Resolução', value: metrics?.resolvedRate ? `${metrics.resolvedRate}%` : '0%', icon: '✅', color: '#f59e0b' },
    { name: 'Violações SLA', value: metrics?.slaBreaches || 0, icon: '⚠️', color: '#ef4444' },
  ];

  return (
    <div className="reports-page animate-fade-in">
      <style jsx>{`
        .reports-page { padding: 40px; }
        .header { margin-bottom: 32px; }
        .title { font-size: 24px; font-weight: 700; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 48px; }
        .card { padding: 24px; border-radius: 20px; display: flex; flex-direction: column; gap: 16px; }
        .card-top { display: flex; justify-content: space-between; align-items: center; }
        .card-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .card-name { color: var(--text-muted); font-size: 14px; font-weight: 500; }
        .card-value { font-size: 28px; font-weight: 800; }
        .section-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; display: block; }
        .sla-table { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; border-collapse: collapse; }
        .sla-table th { padding: 12px 20px; text-align: left; font-size: 12px; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        .sla-table td { padding: 12px 20px; font-size: 14px; border-bottom: 1px solid var(--border); }
      `}</style>

      <div className="header">
        <h1 className="title">Relatórios</h1>
      </div>

      {loading ? (
        <div>Carregando métricas...</div>
      ) : (
        <>
          <div className="grid">
            {cards.map((card, i) => (
              <div key={i} className="card glass">
                <div className="card-top">
                  <div className="card-icon" style={{ background: `${card.color}22` }}>{card.icon}</div>
                </div>
                <div>
                  <span className="card-name">{card.name}</span>
                  <div className="card-value" style={{ color: card.color }}>{card.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="sla-section">
            <span className="section-title">Violações de SLA Recentes</span>
            {slaData.length > 0 ? (
              <table className="sla-table">
                <thead>
                  <tr>
                    <th>Conversa</th>
                    <th>Setor</th>
                    <th>Tempo Espera</th>
                    <th>Limite</th>
                  </tr>
                </thead>
                <tbody>
                  {slaData.map((sla, i) => (
                    <tr key={i}>
                      <td>#{sla.conversation_id}</td>
                      <td>{sla.sector_name || 'Geral'}</td>
                      <td style={{ color: 'var(--error)' }}>{sla.wait_time} min</td>
                      <td>{sla.limit} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="glass" style={{ padding: '32px', textAlign: 'center', borderRadius: '16px', color: 'var(--text-muted)' }}>
                Nenhuma violação de SLA detectada no período
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
