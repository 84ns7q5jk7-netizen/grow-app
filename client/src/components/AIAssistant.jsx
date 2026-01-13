import { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, User } from 'lucide-react';
import '../index.css';

const GURU_RESPONSES = {
    'привет': 'Йо, бро! Добро пожаловать в гроубокс. Джа с тобой! Чем помочь: свет, вода, или листья желтеют?',
    'полив': 'Слушай сюда, бро. Главное — не перелей. Щупай землю пальцем на фалангу. Если сухо — лей. И pH держи в районе 6.5, окей?',
    'свет': 'Свет — это жизнь, ман. На веге давай им побольше синего спектра (6500K), а на цвете врубай красный (2700K). И режим 18/6 для автиков — самое то.',
    'желтеют': 'Листья желтеют? Это знак, бро. Если снизу — не хватает азота (N), покорми. Если сверху — может быть ожог от лампы или блок по pH. Проверь дренаж!',
    'пш': 'pH — это база. Земля любит 6.0-7.0. Кокос — 5.5-6.5. Если кривой pH — корни блокируют еду, и растиха голодает. Калибруй прибор!',
    'харвест': 'Ооо, самое сладкое время! Смотри на трихомы в лупу. Если они мутные и янтарные (50/50) — руби! Не забудь промыть водичкой (Flushing) недельку до этого.',
    'удобрения': 'Аккуратнее с химией, ман. Лучше недокормить, чем передознуть. Начинай с 1/4 дозы от таблицы. И чередуй с водичкой.',
    'температура': 'Держи 24-26°C днем и не ниже 20°C ночью. Если жарко — терпены улетят, будет сено. Если холодно — корни тормознут.',
    'влажность': 'На веге давай влажно (60-70%), пусть кайфуют. На цвете суши до 40-50%, чтоб плесень (Bortytis) не поймать. Плесень — это враг!',
    'unknown': 'Йо, вопрос сложный. Я пока медитирую над ответом. Спроси про свет, полив, pH или харвест. Мир! ✌️'
};

const AIAssistant = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: 'Йо! Я твой Гроу-Гуру. Спрашивай чё как, помогу поднять урожай! 🌿', sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate "thinking"
        setTimeout(() => {
            const lowerInput = userMsg.text.toLowerCase();
            let answer = GURU_RESPONSES['unknown'];

            // Simple keyword matching for Guru Logic
            if (lowerInput.includes('привет') || lowerInput.includes('здарова')) answer = GURU_RESPONSES['привет'];
            else if (lowerInput.includes('листья') || lowerInput.includes('желт')) answer = GURU_RESPONSES['желтеют'];
            else if (lowerInput.includes('свет') || lowerInput.includes('лампа') || lowerInput.includes('led')) answer = GURU_RESPONSES['свет'];
            else if (lowerInput.includes('полив') || lowerInput.includes('вода') || lowerInput.includes('сколько лить')) answer = GURU_RESPONSES['полив'];
            else if (lowerInput.includes('ph') || lowerInput.includes('пш')) answer = GURU_RESPONSES['пш'];
            else if (lowerInput.includes('харвест') || lowerInput.includes('рубить') || lowerInput.includes('сбор')) answer = GURU_RESPONSES['харвест'];
            else if (lowerInput.includes('удобр') || lowerInput.includes('корм')) answer = GURU_RESPONSES['удобрения'];
            else if (lowerInput.includes('темп')) answer = GURU_RESPONSES['температура'];
            else if (lowerInput.includes('влажн')) answer = GURU_RESPONSES['влажность'];

            const aiMsg = { id: Date.now() + 1, text: answer, sender: 'ai' };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', padding: '10px', animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
                        <Bot size={24} color="white" />
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#30d158', borderRadius: '50%', border: '2px solid #0f172a' }}></div>
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '18px', background: 'linear-gradient(to right, #34d399, #6ee7b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Гроу Гуру
                    </h2>
                    <div style={{ fontSize: '12px', color: '#6ee7b7' }}>Всегда на связи • v2.0</div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px' }}>
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            display: 'flex', gap: '8px'
                        }}
                    >
                        {msg.sender === 'ai' && (
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Sparkles size={14} color="#34d399" />
                            </div>
                        )}
                        <div style={{
                            background: msg.sender === 'user' ? 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)' : 'rgba(30, 41, 59, 0.8)',
                            padding: '12px 16px',
                            borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                            color: 'white',
                            lineHeight: '1.5',
                            fontSize: '15px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            border: msg.sender === 'ai' ? '1px solid rgba(255,255,255,0.05)' : 'none'
                        }}>
                            {msg.text}
                        </div>
                        {msg.sender === 'user' && (
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <User size={14} color="#818cf8" />
                            </div>
                        )}
                    </div>
                ))}
                {isTyping && (
                    <div style={{ alignSelf: 'flex-start', marginLeft: '36px', background: 'rgba(30, 41, 59, 0.5)', padding: '10px 15px', borderRadius: '20px' }}>
                        <div className="typing-dots">
                            <span>.</span><span>.</span><span>.</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="glass-panel" style={{ padding: '10px', display: 'flex', gap: '10px', marginTop: '10px', background: 'rgba(15, 23, 42, 0.9)' }}>
                <input
                    type="text"
                    className="input-field"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Спроси совета, бро..."
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    style={{ background: 'rgba(0,0,0,0.3)', border: 'none' }}
                />
                <button
                    onClick={handleSend}
                    style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        width: '44px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    <Send color="white" size={20} />
                </button>
            </div>
        </div>
    );
};

export default AIAssistant;
