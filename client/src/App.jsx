import { useState, useEffect } from 'react'
import PlantConstructor from './components/PlantConstructor'
import AIAssistant from './components/AIAssistant'
import DripCalculator from './components/DripCalculator'
import { LayoutDashboard, Grid, Sparkles, Droplets, Thermometer, Calendar, Calculator } from 'lucide-react'
import './index.css'

// Widget Dashboard Component
const Dashboard = () => {
    const [data, setData] = useState({ temperature: '--', humidity: '--' });

    useEffect(() => {
        const loadData = () => {
            fetch('/api/sensors/latest')
                .then(res => res.json())
                .then(d => {
                    if (d && (d.temperature !== undefined || d.humidity !== undefined)) {
                        setData({
                            temperature: d.temperature !== undefined ? Math.round(d.temperature) : '--',
                            humidity: d.humidity !== undefined ? Math.round(d.humidity) : '--'
                        });
                    }
                })
                .catch(err => console.error("Failed to fetch sensors", err));
        };
        loadData();
        const timer = setInterval(loadData, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ padding: '20px', paddingBottom: '100px', animation: 'fadeIn 0.4s' }}>
            <h1 className="title-large">Обзор</h1>

            {/* Main Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <Thermometer color="#f87171" size={24} />
                        <span className="text-secondary">Темп.</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{data.temperature}°C</div>
                </div>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <Droplets color="#60a5fa" size={24} />
                        <span className="text-secondary">Влажн.</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{data.humidity}%</div>
                </div>
            </div>

            {/* Status Widget */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)' }}>
                    <Calendar color="white" size={28} />
                </div>
                <div>
                    <div className="text-secondary" style={{ fontSize: '13px' }}>Сегодня</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>Полив "Gorilla Glue"</div>
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
            </main>

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
        </div>
    )
}

export default App
