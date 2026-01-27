import { useState, useEffect } from 'react'
import PlantConstructor from './components/PlantConstructor'
import AIAssistant from './components/AIAssistant'
import Journal from './components/Journal'
import DripCalculator from './components/DripCalculator'
import AdminPanel from './components/AdminPanel'
import TipsWidget from './components/TipsWidget'
import SensorChart from './components/SensorChart'
import { LayoutDashboard, Grid, Sparkles, Droplets, Thermometer, AlertTriangle, Shield, Calculator, Book } from 'lucide-react'
import './index.css'

// Widget Dashboard Component
const Dashboard = ({ onOpenAdmin }) => {
    const [sensors, setSensors] = useState([]);
    const [showAlert, setShowAlert] = useState(null);

    useEffect(() => {
        const loadData = () => {
            fetch('/api/sensors/dashboard')
                .then(res => res.json())
                .then(response => {
                    const rows = response.data || [];
                    const now = new Date();

                    // Process each sensor row
                    const processed = rows.map(row => {
                        const dataTime = row.timestamp ? new Date(row.timestamp) : new Date(0);
                        const diffSeconds = (now - dataTime) / 1000;
                        const isConnected = diffSeconds < 150; // 150s timeout (2.5 mins)

                        return {
                            id: row.grow_id,
                            name: `Box #${row.grow_id}`, // Could fetch name from 'grows' table later
                            temperature: row.temperature !== undefined ? Number(row.temperature).toFixed(1) : '--',
                            humidity: row.humidity !== undefined ? Math.round(row.humidity) : '--',
                            co2: row.co2,
                            isConnected
                        };
                    });

                    // If no data, show at least one "Empty/Offline" placeholder
                    if (processed.length === 0) {
                        setSensors([{ id: 1, name: 'Main Box', temperature: '--', humidity: '--', isConnected: false }]);
                    } else {
                        setSensors(processed);
                    }

                    // Check alerts (simple logic: if ANY box is critical)
                    const critical = processed.find(p => p.isConnected && (p.temperature < 15 || p.temperature > 28));
                    if (critical) {
                        if (critical.temperature < 15) setShowAlert('low_temp');
                        else setShowAlert('high_temp');
                    } else {
                        setShowAlert(null);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch sensors", err);
                });
        };

        loadData();
        const timer = setInterval(loadData, 5000); // 5 seconds polling
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
                            {showAlert === 'low_temp' ? 'Температура слишком низкая (< 15°C)' : 'Температура слишком высокая (> 28°C)'}
                        </div>
                    </div>
                </div>
            )}

            {/* Render Sensor Cards Loop */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                {sensors.map(sensor => (
                    <div key={sensor.id} className="glass-panel" style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>{sensor.name}</span>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: sensor.isConnected ? '#4ade80' : '#ef4444',
                                boxShadow: sensor.isConnected ? '0 0 8px #4ade80' : 'none'
                            }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {/* Temp */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'rgba(248, 113, 113, 0.15)', padding: '10px', borderRadius: '12px' }}>
                                    <Thermometer color="#f87171" size={24} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Температура</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: sensor.isConnected ? 'white' : '#64748b' }}>
                                        {sensor.temperature}°C
                                    </div>
                                </div>
                            </div>

                            {/* Humidity */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'rgba(96, 165, 250, 0.15)', padding: '10px', borderRadius: '12px' }}>
                                    <Droplets color="#60a5fa" size={24} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Влажность</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: sensor.isConnected ? 'white' : '#64748b' }}>
                                        {sensor.humidity}%
                                    </div>
                                </div>
                            </div>

                            {/* CO2 (Only for Box 1 for now) */}
                            {sensor.id == 1 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', gridColumn: 'span 2' }}>
                                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '12px' }}>
                                        <div style={{ color: '#34d399', fontWeight: 'bold', fontSize: '14px' }}>CO2</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Углекислый газ</div>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: sensor.isConnected ? 'white' : '#64748b' }}>
                                            {sensor.co2 || '--'} ppm
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <SensorChart />

            {/* Tips Widget */}
            <TipsWidget />
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
                {activeTab === 'calc' && <DripCalculator />}
                {activeTab === 'journal' && <Journal />}
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
                        onClick={() => setActiveTab('journal')}
                        style={{ background: 'none', border: 'none', color: activeTab === 'journal' ? '#818cf8' : '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                    >
                        <Book size={24} />
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
