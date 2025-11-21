import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, Loader2, Stethoscope, Pill } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AIMedicineBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Auto-scroll to bottom
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // NOTE: Adjust URL if your backend port is different (e.g., 8000)
            const response = await fetch('http://127.0.0.1:8000/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: [...messages, userMessage],
                    // FIX: Removed 'model: "mistral-small-latest"' to rely on the backend's OpenRouter default model
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setMessages(prev => [...prev, data]);

        } catch (error) {
            console.error(error);
            const errorMessage: Message = { 
                role: 'assistant', 
                content: "I'm having trouble connecting to the medical database. Please check your internet connection." 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button (Doctor Icon) */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, type: 'spring' }}
            >
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full w-16 h-16 bg-teal-600 hover:bg-teal-700 shadow-xl flex items-center justify-center border-4 border-white"
                >
                    <Stethoscope className="w-8 h-8 text-white" />
                </Button>
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[380px] h-[600px] max-h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-teal-600 text-white shadow-md">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-md leading-tight">MediCheck AI</h3>
                                    <p className="text-xs text-teal-100 opacity-90">Virtual Health Assistant</p>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 text-white rounded-full h-8 w-8"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-4 bg-slate-50">
                            <div className="space-y-4">
                                {/* Welcome Message */}
                                {messages.length === 0 && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
                                            <p className="text-sm leading-relaxed">
                                                Hello! 👋 I am your AI Medical Assistant. <br/><br/>
                                                I can help you verify medicines, explain side effects, or provide general health info. How can I help you today?
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Message List */}
                                {messages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div 
                                            className={`
                                                max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed
                                                ${msg.role === 'user' 
                                                    ? 'bg-teal-600 text-white rounded-tr-none' 
                                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                                }
                                            `}
                                        >
                                            {/* Render text with simple formatting */}
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Loading Indicator */}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                                            <div className="flex items-center space-x-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                                                <span className="text-xs text-gray-500 font-medium">Analyzing...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about medicine..."
                                    disabled={isLoading}
                                    className="flex-1 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                                <Button 
                                    onClick={handleSend} 
                                    disabled={isLoading || !input.trim()}
                                    className="bg-teal-600 hover:bg-teal-700 w-10 h-10 p-0 rounded-full flex items-center justify-center"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </Button>
                            </div>
                            <div className="mt-2 flex items-center justify-center space-x-1 opacity-50">
                                <Pill className="w-3 h-3 text-gray-400" />
                                <p className="text-[10px] text-center text-gray-400">
                                    AI is not a doctor. Advice is for info only.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}