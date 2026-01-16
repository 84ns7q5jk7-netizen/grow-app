import { useState, useEffect } from 'react';
import { Shield, Clock, Globe, Activity, RefreshCw } from 'lucide-react';
import '../index.css';

const AdminPanel = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ uptime: 0, logCount: 0 });
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const logsRes = await fetch('/api/admin/logs');
            const statsRes = await fetch('/api/admin/stats');

            if (logsRes.ok) setLogs((await logsRes.json()).data);
            if (statsRes.ok) setStats(await statsRes.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Auto-refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}ч ${m}м`;
    };

    return (
        <div style={{ padding: '20px', paddingBottom: '100px', animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <div style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    padding: '10px',
                    borderRadius: '12px',
                    color: '#f87171'
                }}>
                    <Shield size={24} />
                </div>
                <div>
                    <h1 className="title-large" style={{ fontSize: '24px', margin: 0 }}>Админ Панель</h1>
                    <div className="text-secondary" style={{ fontSize: '13px' }}>Логи и состояние системы</div>
                </div>
                <button
                    onClick={fetchData}
                    style={{
                        marginLeft: 'auto',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}
                >
                    <RefreshCw size={20} className={loading ? "spin" : ""} />
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#94a3b8' }}>
                        <Clock size={16} />
                        <span style={{ fontSize: '12px' }}>Время работы</span>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatUptime(stats.uptime)}</div>
                </div>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#94a3b8' }}>
                        <Activity size={16} />
                        <span style={{ fontSize: '12px' }}>Всего входов</span>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.logCount}</div>
                </div>
            </div>

            {/* Access Logs List */}
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Последние входы</h3>
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                {logs.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Нет записей</div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} style={{
                            padding: '15px',
                            borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontWeight: '500' }}>
                                    <Globe size={14} color="#818cf8" />
                                    <span>{log.ip?.replace('::ffff:', '') || 'N/A'}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                            </div>
                            <div style={{ fontSize: '11px', color: '#475569', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                {log.user_agent}
                            </div>
                            <div style={{
                                fontSize: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                alignSelf: 'flex-start',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                marginTop: '4px'
                            }}>
                                {log.method} {log.path}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AdminPanel;
