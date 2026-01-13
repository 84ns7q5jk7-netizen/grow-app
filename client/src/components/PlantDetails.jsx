import { useState, useEffect } from 'react';
import { X, Droplets, Sprout, Calendar, Save, Loader2 } from 'lucide-react';
import '../index.css';

const PlantDetails = ({ plant, onClose }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [logs, setLogs] = useState([]);

    // States
    const [showWaterForm, setShowWaterForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form Data
    const [waterVolume, setWaterVolume] = useState('');
    const [waterPH, setWaterPH] = useState('');
    const [waterNutrients, setWaterNutrients] = useState('');

    const [editData, setEditData] = useState({
        name: plant.name,
        strain: plant.strain,
        stage: plant.stage,
        substrate: plant.substrate || '',
        pot_volume: plant.pot_volume || '',
        planted_date: plant.planted_date ? plant.planted_date.split('T')[0] : '',
        harvest_date: plant.harvest_date ? plant.harvest_date.split('T')[0] : ''
    });

    useEffect(() => {
        fetchLogs();
    }, [plant.id]);

    const fetchLogs = async () => {
        try {
            const res = await fetch(`/api/notes/${plant.id}`);
            const data = await res.json();
            if (data.data) setLogs(data.data);
        } catch (e) { console.error(e); }
    };

    const handleWater = async () => {
        if (!waterVolume) return;
        setIsSaving(true);

        const desc = `Полив: ${waterVolume}л${waterPH ? `, pH: ${waterPH}` : ''}${waterNutrients ? `, Удобр: ${waterNutrients}` : ''}`;

        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plant_id: plant.id,
                    grow_id: plant.grow_id || 1,
                    content: desc
                })
            });
            if (res.ok) {
                setShowWaterForm(false);
                setWaterVolume('');
                setWaterPH('');
                fetchLogs();
            }
        } catch (e) { console.error(e); }
        setIsSaving(false);
    };

    const savePlantData = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/plants/${plant.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                setIsEditing(false);
            }
        } catch (e) { console.error(e); }
        setIsSaving(false);
    };

    return (
        <div className="bottom-sheet-overlay" onClick={onClose}>
            <div
                className="bottom-sheet"
                onClick={e => e.stopPropagation()}
                style={{ background: '#0f172a' }} // Solid background for better performance on mobile
            >

                {/* Handle Bar */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '15px' }}>
                    <div style={{ width: '50px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                </div>

                {/* Header Actions */}
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        {isEditing ? (
                            <input
                                className="input-field"
                                value={editData.name}
                                onChange={e => setEditData({ ...editData, name: e.target.value })}
                                style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    padding: '5px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid #4ade80'
                                }}
                                autoFocus
                            />
                        ) : (
                            <h2 onClick={() => setIsEditing(true)} style={{ margin: 0, fontSize: '28px', color: '#f8fafc' }}>{editData.name}</h2>
                        )}
                        <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
                            {editData.strain || 'Сорт'} • {editData.stage}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {isEditing && (
                            <button
                                onClick={savePlantData}
                                disabled={isSaving}
                                style={{
                                    background: '#818cf8',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '44px',
                                    height: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: isSaving ? 0.7 : 1
                                }}
                            >
                                {isSaving ? <Loader2 size={20} className="spin" color="white" /> : <Save size={20} color="white" />}
                            </button>
                        )}
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={20} color="#94a3b8" />
                        </button>
                    </div>
                </div>

                {/* Segmented Control */}
                <div style={{ padding: '0 20px', marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '16px', display: 'flex' }}>
                        <button
                            onClick={() => setActiveTab('info')}
                            style={{ flex: 1, background: activeTab === 'info' ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s' }}
                        >
                            Инфо
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            style={{ flex: 1, background: activeTab === 'history' ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s' }}
                        >
                            История
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 40px 20px' }}>
                    {activeTab === 'info' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* Actions Panel */}
                            {!showWaterForm ? (
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button onClick={() => setShowWaterForm(true)} style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', border: '1px solid #06b6d4', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '20px' }}>
                                        <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '12px', borderRadius: '50%' }}>
                                            <Droplets color="#06b6d4" size={24} />
                                        </div>
                                        <span style={{ fontWeight: '600', color: '#cffafe' }}>Полить</span>
                                    </button>
                                    <button style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', border: '1px solid #4ade80', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '20px' }}>
                                        <div style={{ background: 'rgba(74, 222, 128, 0.2)', padding: '12px', borderRadius: '50%' }}>
                                            <Sprout color="#4ade80" size={24} />
                                        </div>
                                        <span style={{ fontWeight: '600', color: '#dcfce7' }}>Удобрить</span>
                                    </button>
                                </div>
                            ) : (
                                <div style={{ padding: '20px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid #06b6d4', borderRadius: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <h3 style={{ margin: 0 }}>💧 Запись полива</h3>
                                        <button onClick={() => setShowWaterForm(false)} style={{ background: 'none', border: 'none', color: '#94a3b8' }}><X size={18} /></button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                        <div>
                                            <label className="text-secondary" style={{ fontSize: '13px' }}>Объем (Л)</label>
                                            <input type="number" className="input-field" value={waterVolume} onChange={e => setWaterVolume(e.target.value)} placeholder="0.0" style={{ fontSize: '18px', padding: '12px' }} />
                                        </div>
                                        <div>
                                            <label className="text-secondary" style={{ fontSize: '13px' }}>pH</label>
                                            <input type="number" className="input-field" value={waterPH} onChange={e => setWaterPH(e.target.value)} placeholder="6.5" style={{ fontSize: '18px', padding: '12px' }} />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label className="text-secondary" style={{ fontSize: '13px' }}>Удобрения (мл/л)</label>
                                        <input type="text" className="input-field" value={waterNutrients} onChange={e => setWaterNutrients(e.target.value)} placeholder="A: 2, B: 2" style={{ padding: '12px' }} />
                                    </div>
                                    <button className="btn-primary" onClick={handleWater} disabled={isSaving} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                        {isSaving ? <Loader2 className="spin" /> : 'Сохранить'}
                                    </button>
                                </div>
                            )}

                            {/* Params Panel */}
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <Calendar size={20} color="#f87171" />
                                    <span style={{ fontSize: '18px', fontWeight: '600' }}>Параметры</span>
                                </div>

                                <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Субстрат</label>
                                        {isEditing ? (
                                            <input type="text" className="input-field" placeholder="Кокос" value={editData.substrate} onChange={e => setEditData({ ...editData, substrate: e.target.value })} style={{ padding: '10px' }} />
                                        ) : (
                                            <div style={{ fontSize: '16px', fontWeight: '500' }}>{editData.substrate || '-'}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Горшок (Л)</label>
                                        {isEditing ? (
                                            <input type="text" className="input-field" placeholder="15" value={editData.pot_volume} onChange={e => setEditData({ ...editData, pot_volume: e.target.value })} style={{ padding: '10px' }} />
                                        ) : (
                                            <div style={{ fontSize: '16px', fontWeight: '500' }}>{editData.pot_volume || '-'}</div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Посадка</label>
                                        {isEditing ? (
                                            <input type="date" className="input-field" value={editData.planted_date} onChange={e => setEditData({ ...editData, planted_date: e.target.value })} style={{ padding: '10px', fontSize: '14px', width: '100%' }} />
                                        ) : (
                                            <div style={{ fontSize: '16px' }}>{editData.planted_date || '-'}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Харвест</label>
                                        {isEditing ? (
                                            <input type="date" className="input-field" value={editData.harvest_date} onChange={e => setEditData({ ...editData, harvest_date: e.target.value })} style={{ padding: '10px', fontSize: '14px', width: '100%' }} />
                                        ) : (
                                            <div style={{ fontSize: '16px' }}>{editData.harvest_date || '-'}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {logs.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>История пуста</div>}
                            {logs.map(log => (
                                <div key={log.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <span style={{ fontSize: '15px', color: '#e2e8f0' }}>{log.description || log.content}</span>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PlantDetails;
