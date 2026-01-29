import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GeminiChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Chào nàng! Ngọc Anh đã sẵn sàng giúp nàng rạng rỡ hơn hôm nay rồi đây. Nàng cần tư vấn gì ạ? ✨' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:8080/api/ai/ask', { message: userMsg });
            const { reply, suggested_products } = res.data;
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: reply || 'Ngọc Anh đang nghe đây ạ...',
                suggestions: suggested_products || [] 
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Hệ thống đang bảo trì một chút, nàng đợi em tí nhé! 🌸' }]);
        } finally { setLoading(false); }
    };

    return (
        <div className="beauty-chat-container">
            {/* Nút Chat tròn vo, đổ bóng mịn */}
            <button onClick={() => setIsOpen(!isOpen)} className={`chat-trigger ${isOpen ? 'active' : ''}`}>
                <i className={isOpen ? "bi bi-x-lg" : "bi bi-chat-heart-fill"}></i>
                {!isOpen && <span className="badge-dot"></span>}
            </button>

            {/* Cửa sổ Chat trắng sứ */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="ai-avatar">NA</div>
                        <div className="ai-status">
                            <span className="name">Ngọc Anh Beauty AI</span>
                            <span className="status">Đang trực tuyến</span>
                        </div>
                    </div>

                    <div className="chat-body hide-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-row ${msg.role}`}>
                                <div className="bubble">{msg.text}</div>
                                
                                {msg.suggestions?.length > 0 && (
                                    <div className="product-shelf hide-scrollbar">
                                        {msg.suggestions.map((p, i) => (
                                            <div key={i} className="product-mini-card">
                                                <div className="img-box">
                                                    <img src={`http://localhost:8080/api/public/products/image/${p.image}`} alt={p.productName} />
                                                </div>
                                                <div className="p-detail">
                                                    <span className="p-name">{p.productName}</span>
                                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                                        <span className="p-price">{(p.specialPrice || p.price).toLocaleString()}₫</span>
                                                        <a href={`/product/${p.productId}`} className="view-btn">Mua</a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && <div className="typing"><span></span><span></span><span></span></div>}
                        <div ref={scrollRef} />
                    </div>

                    <div className="chat-footer">
                        <div className="input-group-custom">
                            <input 
                                type="text" 
                                placeholder="Hỏi về toner, serum..." 
                                value={input} 
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button onClick={handleSend} disabled={loading}>
                                <i className="bi bi-send-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .beauty-chat-container { position: fixed; bottom: 30px; right: 30px; z-index: 9999; font-family: 'Quicksand', sans-serif; }

                /* Nút mở chat */
                .chat-trigger {
                    width: 60px; height: 60px; border-radius: 50%; border: none;
                    background: #ff8fa3; color: white; font-size: 24px;
                    box-shadow: 0 10px 25px rgba(255, 143, 163, 0.4);
                    transition: all 0.3s ease; position: relative;
                }
                .chat-trigger:hover { transform: scale(1.05); background: #ff758f; }
                .badge-dot { position: absolute; top: 15px; right: 15px; width: 10px; height: 10px; background: #fff; border: 2px solid #ff8fa3; border-radius: 50%; }

                /* Cửa sổ chat */
                .chat-window {
                    position: absolute; bottom: 80px; right: 0; width: 360px; height: 520px;
                    background: #fff; border-radius: 30px; display: flex; flex-direction: column;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1); overflow: hidden;
                    animation: fadeInUp 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

                .chat-header { padding: 25px 20px; display: flex; align-items: center; gap: 12px; background: #fff; }
                .ai-avatar { width: 40px; height: 40px; background: #ffccd5; border-radius: 15px; display: flex; align-items: center; justify-content: center; color: #ff758f; font-weight: bold; }
                .ai-status .name { display: block; font-size: 15px; font-weight: 700; color: #333; }
                .ai-status .status { font-size: 12px; color: #198754; font-weight: 500; }

                .chat-body { flex: 1; padding: 0 20px 20px; overflow-y: auto; background: #fff; }
                .chat-row { margin-bottom: 15px; display: flex; flex-direction: column; }
                .bubble { max-width: 85%; padding: 12px 18px; font-size: 14px; line-height: 1.6; border-radius: 20px; }
                .ai .bubble { background: #f8f9fa; color: #444; border-bottom-left-radius: 4px; }
                .user .bubble { background: #ff8fa3; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }

                /* Shelf sản phẩm */
                .product-shelf { display: flex; gap: 10px; overflow-x: auto; margin-top: 10px; padding: 5px 0; }
                .product-mini-card { min-width: 140px; background: #fff; border-radius: 20px; border: 1px solid #f0f0f0; overflow: hidden; transition: 0.3s; }
                .product-mini-card:hover { border-color: #ff8fa3; }
                .img-box { height: 100px; background: #fff5f6; }
                .img-box img { width: 100%; height: 100%; object-fit: contain; }
                .p-detail { padding: 10px; }
                .p-name { font-size: 11px; font-weight: 600; color: #333; height: 32px; display: block; overflow: hidden; }
                .p-price { font-size: 12px; color: #ff4d6d; font-weight: 700; }
                .view-btn { font-size: 10px; background: #ffccd5; color: #ff4d6d; padding: 2px 8px; border-radius: 10px; text-decoration: none; font-weight: 700; }

                /* Footer */
                .chat-footer { padding: 20px; background: #fff; }
                .input-group-custom { display: flex; background: #f8f9fa; border-radius: 20px; padding: 5px 5px 5px 15px; align-items: center; }
                .input-group-custom input { flex: 1; border: none; background: transparent; font-size: 14px; outline: none; }
                .input-group-custom button { width: 35px; height: 35px; border-radius: 50%; border: none; background: #ff8fa3; color: white; }

                .typing span { width: 5px; height: 5px; background: #ff8fa3; display: inline-block; border-radius: 50%; margin-right: 3px; animation: bounce 1s infinite; }
                .typing span:nth-child(2) { animation-delay: 0.2s; }
                .typing span:nth-child(3) { animation-delay: 0.4s; }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default GeminiChat;