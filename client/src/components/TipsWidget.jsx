import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { growingTips } from '../data/growingTips';

const TipsWidget = () => {
    const [currentTip, setCurrentTip] = useState('');
    const [index, setIndex] = useState(0);

    // Pick a random tip on mount
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * growingTips.length);
        setIndex(randomIndex);
        setCurrentTip(growingTips[randomIndex]);
    }, []);

    const nextTip = () => {
        const nextIndex = (index + 1) % growingTips.length;
        setIndex(nextIndex);
        setCurrentTip(growingTips[nextIndex]);
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', marginTop: '20px', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                    background: 'rgba(250, 204, 21, 0.2)',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Lightbulb color="#facc15" size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fefce8' }}>
                    Совет Гроверу
                </h3>
                <button
                    onClick={nextTip}
                    style={{
                        marginLeft: 'auto',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.4)',
                        display: 'flex', alignItems: 'center'
                    }}
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            <p style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#e2e8f0',
                minHeight: '40px'
            }}>
                {currentTip}
            </p>
        </div>
    );
};

export default TipsWidget;
