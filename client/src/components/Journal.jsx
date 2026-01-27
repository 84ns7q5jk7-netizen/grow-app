import React, { useState, useEffect } from 'react';
import { Book, Plus, Calendar, Save, X, Leaf, Droplets, Scissors, FileText } from 'lucide-react';

const Journal = () => {
    const [entries, setEntries] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // New Entry State
    const [newEntry, setNewEntry] = useState({
        title: '',
        activity_type: 'note',
        content: '',
        date: new Date().toISOString().split('T')[0],
        grow_id: 1
    });

    const [grows, setGrows] = useState([]);

    useEffect(() => {
        fetchEntries();
        fetchGrows();
    }, []);

    const fetchEntries = () => {
        setLoading(true);
        fetch('/api/journal')
            .then(res => res.json())
            .then(data => {
                setEntries(data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching journal:", err);
                setLoading(false);
            });
    };

    const fetchGrows = () => {
        fetch('/api/grows')
            .then(res => res.json())
            .then(data => setGrows(data.data || []));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('/api/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEntry)
        })
            .then(res => res.json())
            .then(() => {
                setShowForm(false);
                setNewEntry({
                    title: '',
                    activity_type: 'note',
                    content: '',
                    date: new Date().toISOString().split('T')[0],
                    grow_id: 1
                });
                fetchEntries();
            });
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'water': return <Droplets size={16} color="#60a5fa" />;
            case 'feed': return <Droplets size={16} color="#a78bfa" />;
            case 'defoliation': return <Scissors size={16} color="#f87171" />;
            case 'training': return <Leaf size={16} color="#4ade80" />;
            default: return <FileText size={16} color="#94a3b8" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'water': return 'Полив';
            case 'feed': return 'Кормление';
            case 'defoliation': return 'Дефолиация';
            case 'training': return 'Тренировка';
            case 'journal': return 'Запись';
            default: return 'Заметка';
        }
    };

    return (
        <div style={{ padding: '20px', paddingBottom: '100px', animation: 'fadeIn 0.4s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 className="title-large" style={{ margin: 0 }}>Журнал</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="glass-panel"
                    style={{
                        border: '1px solid #4ade80',
                        padding: '10px',
                        borderRadius: '50%',
                        color: '#4ade80',
                        cursor: 'pointer',
                        background: 'rgba(74, 222, 128, 0.1)'
                    }}
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '20px', position: 'relative' }}>
                        <button
                            onClick={() => setShowForm(false)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#94a3b8' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Новая запись</h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '14px' }}>Заголовок</label>
                                <input
                                    type="text"
                                    value={newEntry.title}
                                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                                    placeholder="Например: Полив удобрениями"
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '12px',
                                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white'
                                    }}
                                    required /
                                >
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '14px' }}>Тип</label>
                                    <select
                                        value={newEntry.activity_type}
                                        onChange={(e) => setNewEntry({ ...newEntry, activity_type: e.target.value })}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: '12px',
                                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white'
                                        }}
                                    >
                                        <option value="note">📝 Заметка</option>
                                        <option value="water">💧 Полив</option>
                                        <option value="feed">🧪 Кормление</option>
                                        <option value="defoliation">✂️ Дефолиация</option>
                                        <option value="training">🌿 Тренировка</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '14px' }}>Бокс</label>
                                    <select
                                        value={newEntry.grow_id}
                                        onChange={(e) => setNewEntry({ ...newEntry, grow_id: Number(e.target.value) })}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: '12px',
                                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white'
                                        }}
                                    >
                                        {grows.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '14px' }}>Дата</label>
                                <input
                                    type="date"
                                    value={newEntry.date}
                                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '12px',
                                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '14px' }}>Описание</label>
                                <textarea
                                    value={newEntry.content}
                                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                                    placeholder="Подробности..."
                                    rows={4}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '12px',
                                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                style={{
                                    marginTop: '10px', padding: '15px', borderRadius: '12px',
                                    background: '#4ade80', color: '#064e3b', fontWeight: 'bold', border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer'
                                }}
                            >
                                <Save size={20} />
                                Сохранить
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Загрузка...</div>
                ) : entries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                        <Book size={48} style={{ opacity: 0.5, marginBottom: '10px' }} />
                        <div>Журнал пуст</div>
                        <div style={{ fontSize: '13px', marginTop: '5px' }}>Нажмите +, чтобы добавить первую запись</div>
                    </div>
                ) : (
                    entries.map(entry => (
                        <div key={entry.id} className="glass-panel" style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} />
                                        {new Date(entry.timestamp).toLocaleDateString()}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>•</span>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Box #{entry.grow_id}</span>
                                </div>
                                <div style={{
                                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.1)', color: '#e2e8f0',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                    {getTypeIcon(entry.activity_type)}
                                    {getTypeLabel(entry.activity_type)}
                                </div>
                            </div>

                            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>{entry.title || 'Без названия'}</h3>

                            {entry.description && (
                                <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                    {entry.description}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Journal;
