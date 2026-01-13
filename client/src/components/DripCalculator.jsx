import { useState } from 'react';
import { Timer, Droplets, ArrowRight } from 'lucide-react';
import '../index.css';

const DripCalculator = () => {
    const [volume, setVolume] = useState(''); // Liters needed
    const [flowRate, setFlowRate] = useState(''); // L/h per dripper
    const [plants, setPlants] = useState('1'); // Number of drippers
    const [result, setResult] = useState(null);

    const calculate = () => {
        const v = parseFloat(volume);
        const f = parseFloat(flowRate);
        const p = parseInt(plants);

        if (v && f && p) {
            // Total flow = flowRate * plants
            // Time (hours) = Volume / Total Flow
            const totalFlow = f * p;
            const timeHours = v / totalFlow;
            const timeMinutes = Math.round(timeHours * 60);

            setResult({
                minutes: timeMinutes,
                hours: Math.floor(timeMinutes / 60),
                minsRemainder: timeMinutes % 60
            });
        }
    };

    return (
        <div style={{ padding: '20px', animation: 'fadeIn 0.3s' }}>
            <h1 className="title-large">💧 Калькулятор полива</h1>
            <p className="text-secondary" style={{ marginBottom: '20px' }}>
                Рассчитайте время работы помпы для капельного полива.
            </p>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>Общий объем воды (литры)</label>
                    <input
                        type="number"
                        className="input-field"
                        placeholder="Например, 10"
                        value={volume}
                        onChange={e => setVolume(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>Скорость капельницы (л/ч)</label>
                    <input
                        type="number"
                        className="input-field"
                        placeholder="Например, 2"
                        value={flowRate}
                        onChange={e => setFlowRate(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>Количество растений</label>
                    <input
                        type="number"
                        className="input-field"
                        value={plants}
                        onChange={e => setPlants(e.target.value)}
                    />
                </div>

                <button className="btn-primary" onClick={calculate} style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    Рассчитать <ArrowRight size={20} />
                </button>
            </div>

            {result !== null && (
                <div className="glass-panel" style={{ marginTop: '20px', padding: '20px', background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(30, 41, 59, 0.8) 100%)', border: '1px solid #818cf8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <Timer color="#c084fc" size={24} />
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Результат</span>
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f8fafc' }}>
                        {result.minutes} <span style={{ fontSize: '16px', color: '#94a3b8' }}>мин</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '5px' }}>
                        Таймер на {result.hours > 0 ? `${result.hours} ч ` : ''}{result.minsRemainder} мин
                    </div>
                </div>
            )}
        </div>
    );
};

export default DripCalculator;
