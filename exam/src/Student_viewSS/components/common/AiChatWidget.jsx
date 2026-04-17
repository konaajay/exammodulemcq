import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend, FiCpu, FiUser } from 'react-icons/fi';
import automationService from '../../../../services/automationService';
import './AiChatWidget.css';

const AiChatWidget = ({ userRole = 'STUDENT', userName = 'Student' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: `Hi ${userName}! Not sure what to do next? I can help you apply for courses or explain doubts!`, sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // 1. Add User Message
        const userMsg = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // 2. Call AI Service (The Backend Sidecar)
            const response = await automationService.sendAiQuery(userMsg.text, userRole);

            // 3. Add AI Response
            const botMsg = {
                id: Date.now() + 1,
                text: response.response,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I'm having trouble connecting to the brain. Please try again later.",
                sender: 'bot'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    className="ai-widget-toggle"
                    onClick={() => setIsOpen(true)}
                    title="Ask AI Assistant"
                >
                    <FiMessageSquare />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="ai-chat-container">
                    {/* Header */}
                    <div className="ai-header">
                        <div className="ai-header-info">
                            <h4>AI Assistant</h4>
                            <span>Online • Automation Active</span>
                        </div>
                        <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="ai-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`ai-message ${msg.sender}`}>
                                {msg.sender === 'bot' && <div className="mb-1 text-xs opacity-50 flex items-center gap-1"><FiCpu size={10} /> AI</div>}
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="ai-message bot">
                                <div className="typing-dots">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="ai-input-base">
                        <input
                            type="text"
                            className="ai-input-field"
                            placeholder="Ask about courses, doubts..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isTyping}
                        />
                        <button
                            className="ai-send-btn"
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                        >
                            <FiSend size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AiChatWidget;
