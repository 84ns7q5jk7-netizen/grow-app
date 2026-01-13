import { useState, useEffect } from 'react';
import { Settings, Plus, Leaf, Box, Trash2 } from 'lucide-react';
import PlantDetails from './PlantDetails';
import '../index.css';

const PlantConstructor = () => {
    const [plants, setPlants] = useState([]);
    const [grows, setGrows] = useState([]);
    const [currentGrow, setCurrentGrow] = useState(null);

    const [rows, setRows] = useState(4);
    const [cols, setCols] = useState(3);
    const [showConfig, setShowConfig] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState(null);

    // Fetch grows on mount
    useEffect(() => {
        fetchGrows();
    }, []);

    // When current grow changes, fetch its plants
    useEffect(() => {
        if (currentGrow) {
            fetchPlants(currentGrow.id);
        }
    }, [currentGrow]);

    const fetchGrows = async () => {
        try {
            const res = await fetch('/api/grows');
            let data = await res.json();
            // Ensure at least 1 grow
            if (data.data.length === 0) {
                const newGrow = await createGrow('Мой Гроубокс');
                data.data = [newGrow];
            }
            setGrows(data.data);
            // Select first one if none selected
            if (!currentGrow) setCurrentGrow(data.data[0]);
        } catch (e) { console.error(e); }
    };

    const createGrow = async (name) => {
        const res = await fetch('/api/grows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, width: 4, length: 3 })
        });
        const data = await res.json();
        return { id: data.id, name };
    };

    const fetchPlants = async (growId) => {
        try {
            const res = await fetch(`/api/plants/${growId}`);
            const data = await res.json();
            setPlants(data.data || []);
        } catch (e) { console.error(e); }
    };

    const handleDeleteGrow = async (id) => {
        if (!confirm('Удалить этот бокс и все растения в нем?')) return;
        try {
            await fetch(`/api/grows/${id}`, { method: 'DELETE' });
            fetchGrows();
        } catch (e) { console.error(e); }
    };

    const handleCreateSecondBox = async () => {
        await createGrow(`Бокс #${grows.length + 1}`);
        fetchGrows();
    };

    const handleCellClick = async (x, y) => {
        if (!currentGrow) return;

        // Check mapping
        const plant = plants.find(p => (p.position_x === x && p.position_y === y) || (p.x === x && p.y === y));

        if (plant) {
            setSelectedPlant(plant);
        } else {
            // Quick add
            try {
                const res = await fetch('/api/plants', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        grow_id: currentGrow.id,
                        name: 'Новое Растение',
                        strain: '-',
                        stage: 'Росток',
                        x, y
                    })
                });
                if (res.ok) {
                    fetchPlants(currentGrow.id);
                }
            } catch (e) { console.error(e); }
        }
    };

    return (
        <div style={{ padding: '20px', paddingBottom: '100px', animation: 'fadeIn 0.3s' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 className="title-large" style={{ marginBottom: '5px' }}>
                        {currentGrow ? currentGrow.name : 'Мой Сад 🌱'}
                    </h1>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {grows.map(g => (
                            <button
                                key={g.id}
                                onClick={() => setCurrentGrow(g)}
                                style={{
                                    background: currentGrow?.id === g.id ? '#818cf8' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    border: currentGrow?.id === g.id ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {g.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Delete Current Box (Hidden feature for total reset if needed, or we can keep it as 'Reset') */}
                    {currentGrow && (
                        <button
                            onClick={() => handleDeleteGrow(currentGrow.id)}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: 'none',
                                borderRadius: '12px',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#f87171'
                            }}
                        >
                            <Trash2 size={20} />
                        </button>
                    )}

                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}
                    >
                        <Settings size={22} />
                    </button>
                </div>
            </div>

            {showConfig && (
                <div className="glass-panel" style={{ marginBottom: '20px', padding: '15px' }}>
                    <h3 style={{ fontSize: '16px', margin: '0 0 10px 0' }}>Размер сетки (2.5D)</h3>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <label style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', marginBottom: '8px', color: '#94a3b8' }}>Ряды: {rows}</div>
                            <input type="range" min="2" max="6" value={rows} onChange={e => setRows(Number(e.target.value))} style={{ width: '100%' }} />
                        </label>
                        <label style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', marginBottom: '8px', color: '#94a3b8' }}>Колонки: {cols}</div>
                            <input type="range" min="2" max="4" value={cols} onChange={e => setCols(Number(e.target.value))} style={{ width: '100%' }} />
                        </label>
                    </div>
                </div>
            )}

            {/* 2.5D Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: '15px',
                width: '100%',
                perspective: '1000px',
                padding: '10px' // Add padding to prevent clipping
            }}>
                {Array.from({ length: rows * cols }).map((_, idx) => {
                    const x = idx % cols;
                    const y = Math.floor(idx / cols);
                    const plant = plants.find(p => (p.position_x === x && p.position_y === y) || (p.x === x && p.y === y));

                    return (
                        <div
                            key={`${x}-${y}`}
                            onClick={() => handleCellClick(x, y)}
                            className={`grid-item-3d ${plant ? 'filled' : ''}`}
                            style={{
                                aspectRatio: '1/1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                            }}
                        >
                            {plant ? (
                                <>
                                    <div style={{ background: plant.stage === 'Цветение' ? '#e879f9' : '#818cf8', padding: '12px', borderRadius: '50%', marginBottom: '8px', boxShadow: '0 8px 15px rgba(0,0,0,0.3)', transform: 'translateZ(20px)' }}>
                                        <Leaf color="white" size={28} style={{ display: 'block' }} />
                                    </div>
                                    <div style={{ fontWeight: '600', fontSize: '13px', textAlign: 'center', transform: 'translateZ(10px)' }}>{plant.name}</div>
                                    <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>{plant.stage}</div>
                                </>
                            ) : (
                                <Plus color="rgba(255,255,255,0.2)" size={28} />
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px', color: '#64748b', fontSize: '13px' }}>
                {currentGrow ? `Бокс: ${currentGrow.name}` : 'Загрузка...'}
            </div>

            {selectedPlant && (
                <PlantDetails
                    plant={selectedPlant}
                    onClose={() => { setSelectedPlant(null); if (currentGrow) fetchPlants(currentGrow.id); }}
                />
            )}
        </div>
    );
};

export default PlantConstructor;
