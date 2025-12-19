'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type AppRoutes = '/' | '/products' | '/services' | '/faq';

type ChatbotButton = {
  label: string;
  nextId?: string;
  action?: 'handover';
  route?: AppRoutes;
};

type ChatbotNode = {
  id: string;
  message: string;
  buttons?: ChatbotButton[];
  action?: 'handover';
};

type ChatMessage = {
  id: string;
  text: string;
  from: 'bot' | 'user';
};

type ChatbotProps = {
  onClose: () => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Chatbot({ onClose }: ChatbotProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [nodeButtons, setNodeButtons] = useState<ChatbotButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneInput, setPhoneInput] = useState('');
  const [supportRequested, setSupportRequested] = useState(false);

  useEffect(() => {
    loadNode(currentNodeId);
  }, [currentNodeId]);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  async function loadNode(nodeId: string) {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/chatbot/${nodeId}`);
      const node: ChatbotNode = await res.json();

      setTimeout(() => {
        addBotMessage(node.message);
        setNodeButtons(node.buttons || []);

        if (node.action === 'handover') {
          addBotMessage('📱 Please enter your WhatsApp number below.');
        }

        setLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      addBotMessage('❌ Failed to load chatbot.');
      setLoading(false);
    }
  }

  const addBotMessage = (text: string) =>
    setMessages((prev) => [...prev, { id: Date.now().toString(), text, from: 'bot' }]);

  const handleButtonPress = (button: ChatbotButton) => {
    setNodeButtons([]);
    if (button.action === 'handover') return setCurrentNodeId('agent_handover');
    if (button.route) return router.push(button.route);
    if (button.nextId) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: button.label, from: 'user' }]);
      setCurrentNodeId(button.nextId);
    }
  };

  const submitPhone = async () => {
    if (!phoneInput || supportRequested) return;

    setMessages((prev) => [...prev, { id: Date.now().toString(), text: phoneInput, from: 'user' }]);
    setPhoneInput('');
    setLoading(true);
    setSupportRequested(true);

    try {
      const res = await fetch(`${API_URL}/api/chatbot/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput }),
      });
      const data = await res.json();
      setTimeout(() => {
        addBotMessage(data.message);
        setCurrentNodeId('handover_success');
        setNodeButtons([]);
        setLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      addBotMessage('❌ Failed to notify agent.');
      setLoading(false);
    }
  };

  const lastBotMessage = messages[messages.length - 1]?.text ?? '';

  return (
    <div className="flex flex-col w-full h-full bg-gray-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <span className="font-bold text-white">COLLTALK</span>
      </div>

      {/* Chat Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] px-4 py-2 rounded-xl ${
              msg.from === 'bot' ? 'bg-gray-800 self-start text-white' : 'bg-cyan-500 self-end text-black font-bold'
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && <div className="text-gray-400">Loading...</div>}

        {!loading && nodeButtons.length > 0 && !lastBotMessage.includes('WhatsApp') && (
          <div className="flex flex-wrap gap-2 mt-2">
            {nodeButtons.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleButtonPress(btn)}
                className="bg-purple-600 text-white px-3 py-2 rounded-lg font-semibold"
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {!loading && lastBotMessage.includes('WhatsApp') && (
          <div className="flex gap-2 mt-2">
            <input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Enter WhatsApp number"
              className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white outline-none"
            />
            <button
              onClick={submitPhone}
              disabled={supportRequested}
              className={`px-4 py-2 rounded-lg font-bold ${
                supportRequested ? 'bg-gray-500 cursor-not-allowed' : 'bg-cyan-500'
              }`}
            >
              {supportRequested ? 'Support Requested' : 'Send'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
