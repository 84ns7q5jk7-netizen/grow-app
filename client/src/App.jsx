import { useState, useEffect } from 'react'
import PlantConstructor from './components/PlantConstructor'
import AIAssistant from './components/AIAssistant'
import DripCalculator from './components/DripCalculator'
import AdminPanel from './components/AdminPanel'
import { LayoutDashboard, Grid, Sparkles, Droplets, Thermometer, AlertTriangle, Shield, Calculator } from 'lucide-react'
import './index.css'

// Widget Dashboard Component
const Dashboard = ({ onOpenAdmin }) => {
    const [data, setData] = useState({ temperature: '--', humidity: '--' });
    const [isConnected, setIsConnected] = useState(false);
    const [showAlert, setShowAlert] = useState(null);

    useEffect(() => {
        const loadData = () => {
            fetch('/api/sensors/latest')
                .then(res => res.json())
                .then(d => {
                    const now = new Date();
                    const dataTime = d.timestamp ? new Date(d.timestamp) : new Date(0);
                    const diffSeconds = (now - dataTime) / 1000;

                    // Connected if data is younger than 60 seconds
                    const connected = diffSeconds < 60;
                    setIsConnected(connected);

                    if (connected) {
                        // Real Data
                        const temp = d.temperature !== undefined ? Number(d.temperature) : 0;
                        setData({
                            temperature: temp.toFixed(1),
                            humidity: d.humidity !== undefined ? Math.round(d.humidity) : '--'
                        });
                        checkAlerts(temp);
                    } else {
                        // Demo/Disconnected Mode - Random "Live" Data
                        // Temp: 21.0 - 25.0, Hum: 45 - 55
                        const randomTemp = 21 + Math.random() * 4;
                        const randomHum = 45 + Math.random() * 10;
                        setData({
                            temperature: randomTemp.toFixed(1),
                            humidity: Math.round(randomHum)
                        });
                        checkAlerts(randomTemp);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch sensors", err);
                    setIsConnected(false);
                });
        };

        const checkAlerts = (temp) => {
            if (temp < 15) setShowAlert('low_temp');
            else if (temp > 25) setShowAlert('high_temp');
            else setShowAlert(null);
        };

        loadData();
        const timer = setInterval(loadData, 3000); // 3 seconds for "live" feel
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ padding: '20px', paddingBottom: '100px', animation: 'fadeIn 0.4s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 className="title-large" style={{ margin: 0 }}>Обзор</h1>
                <button onClick={onOpenAdmin} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.1)' }}>
                    <Shield size={20} />
                </button>
            </div>

            {/* Alert Banner */}
            {showAlert && (
                <div className="glass-panel" style={{
                    padding: '15px',
                    marginBottom: '20px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #f87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'fadeIn 0.3s'
                }}>
                    <AlertTriangle color="#f87171" size={24} />
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#f87171' }}>Внимание!</div>
                        <div style={{ fontSize: '13px', color: '#fca5a5' }}>
                            {showAlert === 'low_temp' ? 'Температура слишком низкая (< 15°C)' : 'Температура слишком высокая (> 25°C)'}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Thermometer color="#f87171" size={24} />
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isConnected ? '#4ade80' : '#ef4444',
                                boxShadow: isConnected ? '0 0 8px #4ade80' : 'none'
                            }} />
                        </div>
                        <span className="text-secondary">Темп.</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{data.temperature}°C</div>
                </div>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Droplets color="#60a5fa" size={24} />
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isConnected ? '#4ade80' : '#ef4444',
                                boxShadow: isConnected ? '0 0 8px #4ade80' : 'none'
                            }} />
                        </div>
                        <span className="text-secondary">Влажн.</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{data.humidity}%</div>
                </div>
            </div>

            {/* Quick Tips Widget */}
            <div className="glass-panel" style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.4)' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color="#fbbf24" />
                    <span>Совет дня</span>
                </h3>
                <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#cbd5e1', margin: 0 }}>
                    Для лучшей аэрации корней используйте тканевые горшки (Smart Pot). Это предотвратит "закручивание" корней.
                </p>
            </div>
        </div>
    );
};

function App() {
    const [activeTab, setActiveTab] = useState('dashboard')

    useEffect(() => {
        // Check for Admin URL
        if (window.location.pathname === '/admin-panel.php') {
            setActiveTab('admin');
        }

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
            window.Telegram.WebApp.setHeaderColor('#0f172a');
            window.Telegram.WebApp.setBackgroundColor('#0f172a');
        }
    }, [])

    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', minHeight: '100vh' }}>

            <main>
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'constructor' && <PlantConstructor />}
                {activeTab === 'ai' && <AIAssistant />}
                {activeTab === 'calc' && <DripCalculator />}
                {activeTab === 'admin' && <AdminPanel />}
            </main>

            {activeTab !== 'admin' && (
                <nav className="glass-panel" style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    maxWidth: '400px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '12px 10px',
                    zIndex: 100,
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(15, 23, 42, 0.8)'
                }}>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        style={{ background: 'none', border: 'none', color: activeTab === 'dashboard' ? '#818cf8' : '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                    >
                        <LayoutDashboard size={24} />
                    </button>
                    <button
                        onClick={() => setActiveTab('constructor')}
                        style={{ background: 'none', border: 'none', color: activeTab === 'constructor' ? '#818cf8' : '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                    >
                        <Grid size={24} />
                    </button>
                    <button
                        onClick={() => setActiveTab('calc')}
                        style={{ background: 'none', border: 'none', color: activeTab === 'calc' ? '#818cf8' : '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                    >
                        <Calculator size={24} />
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        style={{ background: 'none', border: 'none', color: activeTab === 'ai' ? '#818cf8' : '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                    >
                        <Sparkles size={24} />
                    </button>
                </nav>
            )}

            {activeTab === 'admin' && (
                <button
                    onClick={() => setActiveTab('dashboard')}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '12px 24px',
                        borderRadius: '20px',
                        backdropFilter: 'blur(10px)',
                        zIndex: 100
                    }}
                >
                    Закрыть панель
                </button>
            )}
        </div>
    )
}

export default App
