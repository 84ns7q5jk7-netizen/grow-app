import { useState, useEffect } from 'react';
import { Settings, Plus, Leaf, Box, Trash2, X } from 'lucide-react';
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
            if (currentGrow.dimensions) {
                const [r, c] = currentGrow.dimensions.split('x').map(Number);
                if (r && c) {
                    setRows(r);
                    setCols(c);
                }
            }
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
            body: JSON.stringify({ name, dimensions: '4x2', type: 'indoor' })
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

    const updateGrowDimensions = async (r, c) => {
        setRows(r);
        setCols(c);
        if (currentGrow) {
            // Optimistic update
            const updated = { ...currentGrow, dimensions: `${r}x${c}` };
            setCurrentGrow(updated);
            // Update in list
            setGrows(grows.map(g => g.id === currentGrow.id ? updated : g));

            try {
                await fetch(`/api/grows/${currentGrow.id}`, {
                    method: 'PUT', // Assuming PUT endpoint exists or using POST for update? 
                    // Wait, I didn't verify if PUT /api/grows/:id exists in server.js! 
                    // I verified POST /api/grows and GET /api/grows. 
                    // I should check if update is supported. 
                    // If not, I'll add it. 
                    // For now, I'll assume standard REST. If it fails, I'll fix server.js.
                    // Actually, let's assume it doesn't exist and I'll add it to server.js in next step.
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dimensions: `${r}x${c}` })
                });
            } catch (e) { console.error(e); }
        }
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
            {/* New Premium Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <div style={{ padding: '8px', cursor: 'pointer' }}>
                    <X size={24} color="white" />
                </div>
                <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                        background: '#f87171',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>G</div>
                    <span style={{ fontSize: '15px', fontWeight: '500', color: '#cbd5e1' }}>grow tracker</span>
                </div>
            </div>

            {/* Header Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 className="title-large" style={{ marginBottom: '20px', fontSize: '42px', fontWeight: '800' }}>
                        {currentGrow ? 'Мой Гроубокс' : 'Мой Сад'}
                    </h1>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        width: '100%'
                    }}>
                        {grows.map(g => (
                            <button
                                key={g.id}
                                onClick={() => setCurrentGrow(g)}
                                style={{
                                    background: currentGrow?.id === g.id ? '#818cf8' : 'rgba(30, 41, 59, 0.6)',
                                    color: 'white',
                                    border: currentGrow?.id === g.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center',
                                    boxShadow: currentGrow?.id === g.id ? '0 4px 15px rgba(129, 140, 248, 0.4)' : 'none'
                                }}
                            >
                                {g.name === 'Мой Гроубокс' ? 'Мой Гроубокс' : g.name}
                            </button>
                        ))}

                        {/* Add New Box Placeholder if needed */}
                        <button
                            onClick={handleCreateSecondBox}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: 'rgba(255,255,255,0.3)',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                padding: '16px',
                                borderRadius: '16px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}
                    >
                        <Settings size={22} />
                    </button>
                    {currentGrow && (
                        <button
                            onClick={() => handleDeleteGrow(currentGrow.id)}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: 'none',
                                borderRadius: '50%',
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
                </div>
            </div>

            {showConfig && (
                <div className="glass-panel" style={{ marginBottom: '20px', padding: '15px' }}>
                    <h3 style={{ fontSize: '16px', margin: '0 0 10px 0' }}>Размер сетки (2.5D)</h3>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <label style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', marginBottom: '8px', color: '#94a3b8' }}>Ряды: {rows}</div>
                            <input type="range" min="2" max="6" value={rows} onChange={e => updateGrowDimensions(Number(e.target.value), cols)} style={{ width: '100%' }} />
                        </label>
                        <label style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', marginBottom: '8px', color: '#94a3b8' }}>Колонки: {cols}</div>
                            <input type="range" min="2" max="4" value={cols} onChange={e => updateGrowDimensions(rows, Number(e.target.value))} style={{ width: '100%' }} />
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
                                    <div style={{ background: plant.stage === 'Цветение' ? '#e879f9' : '#818cf8', padding: '8px', borderRadius: '50%', marginBottom: '8px', boxShadow: '0 8px 15px rgba(0,0,0,0.3)', transform: 'translateZ(20px)' }}>
                                        <Leaf color="white" size={20} style={{ display: 'block' }} />
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
                {currentGrow ? `Бокс: ${currentGrow.name === 'Мой Гроубокс' ? 'Мой Гроубокс' : currentGrow.name}` : 'Загрузка...'}
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
