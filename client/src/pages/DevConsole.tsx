import { useState } from 'react';
import { Send, Code, Bug, DollarSign } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    cost?: number;
}

interface CostStats {
    today: {
        totalCost: string;
        costPerMessage: string;
    };
    estimates: {
        monthlyIfSameUsage: string;
        savingsVsClaudePro: string;
    };
}

export default function DevConsole() {
    const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'debug' | 'costs'>('chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [costs, setCosts] = useState<CostStats | null>(null);

    // Chat tab
    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/bedrock/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.response,
                    cost: data.usage.cost,
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Error: ${data.error}`,
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Failed to send message. Check console for details.',
            }]);
        } finally {
            setLoading(false);
        }
    };

    // Code generation tab
    const [codePrompt, setCodePrompt] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');

    const generateCode = async () => {
        if (!codePrompt.trim() || loading) return;
        setLoading(true);

        try {
            const res = await fetch('/api/bedrock/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: codePrompt }),
            });

            const data = await res.json();

            if (res.ok) {
                setGeneratedCode(data.code);
            } else {
                setGeneratedCode(`Error: ${data.error}`);
            }
        } catch (error) {
            setGeneratedCode('Failed to generate code.');
        } finally {
            setLoading(false);
        }
    };

    // Debug tab
    const [errorInput, setErrorInput] = useState('');
    const [contextInput, setContextInput] = useState('');
    const [debugSolution, setDebugSolution] = useState('');

    const debugError = async () => {
        if (!errorInput.trim() || loading) return;
        setLoading(true);

        try {
            const res = await fetch('/api/bedrock/debug', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: errorInput,
                    context: contextInput,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setDebugSolution(data.solution);
            } else {
                setDebugSolution(`Error: ${data.error}`);
            }
        } catch (error) {
            setDebugSolution('Failed to debug error.');
        } finally {
            setLoading(false);
        }
    };

    // Cost tracker
    const fetchCosts = async () => {
        try {
            const res = await fetch('/api/bedrock/costs');
            const data = await res.json();
            setCosts(data);
        } catch (error) {
            console.error('Failed to fetch costs:', error);
        }
    };

    // Auto-fetch costs when switching to costs tab
    useState(() => {
        if (activeTab === 'costs' && !costs) {
            fetchCosts();
        }
    });

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">AWS Bedrock Dev Console</h1>
                <p className="text-gray-400 mb-8">
                    Using YOUR AWS credits (~$0.003/message) instead of paying Claude.ai $20/month
                </p>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'chat'
                                ? 'border-b-2 border-blue-500 text-blue-500'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Send className="inline mr-2 h-4 w-4" />
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'code'
                                ? 'border-b-2 border-blue-500 text-blue-500'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Code className="inline mr-2 h-4 w-4" />
                        Code Generator
                    </button>
                    <button
                        onClick={() => setActiveTab('debug')}
                        className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'debug'
                                ? 'border-b-2 border-blue-500 text-blue-500'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Bug className="inline mr-2 h-4 w-4" />
                        Debug Helper
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('costs');
                            fetchCosts();
                        }}
                        className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'costs'
                                ? 'border-b-2 border-blue-500 text-blue-500'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <DollarSign className="inline mr-2 h-4 w-4" />
                        Cost Tracker
                    </button>
                </div>

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div className="space-y-4">
                        <div className="bg-gray-800 rounded-lg p-6 h-[500px] overflow-y-auto">
                            {messages.length === 0 ? (
                                <p className="text-gray-500 text-center mt-20">
                                    Start chatting with Claude using your AWS Bedrock credits
                                </p>
                            ) : (
                                messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'
                                            }`}
                                    >
                                        <div
                                            className={`inline-block max-w-xl p-4 rounded-lg ${msg.role === 'user'
                                                    ? 'bg-blue-600'
                                                    : 'bg-gray-700'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                            {msg.cost && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Cost: ${msg.cost.toFixed(4)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Ask Claude anything..."
                                className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Code Generator Tab */}
                {activeTab === 'code' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Describe what you want to build:
                            </label>
                            <textarea
                                value={codePrompt}
                                onChange={(e) => setCodePrompt(e.target.value)}
                                placeholder="E.g., Create a React component that displays a user profile with name, avatar, and bio"
                                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                                disabled={loading}
                            />
                        </div>

                        <button
                            onClick={generateCode}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Generating...' : 'Generate Code'}
                        </button>

                        {generatedCode && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                                    {generatedCode}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {/* Debug Helper Tab */}
                {activeTab === 'debug' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Paste your error message:
                            </label>
                            <textarea
                                value={errorInput}
                                onChange={(e) => setErrorInput(e.target.value)}
                                placeholder="E.g., TypeError: Cannot read property 'map' of undefined"
                                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Context (optional - code, file path, etc.):
                            </label>
                            <textarea
                                value={contextInput}
                                onChange={(e) => setContextInput(e.target.value)}
                                placeholder="E.g., File: server/routes.ts, Line 45"
                                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                                disabled={loading}
                            />
                        </div>

                        <button
                            onClick={debugError}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Debugging...' : 'Debug Error'}
                        </button>

                        {debugSolution && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                                    {debugSolution}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {/* Cost Tracker Tab */}
                {activeTab === 'costs' && (
                    <div className="space-y-6">
                        {costs ? (
                            <>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-gray-800 rounded-lg p-6">
                                        <h3 className="text-lg font-medium mb-4">Today's Usage</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Total Cost:</span>
                                                <span className="font-mono text-green-500">
                                                    ${costs.today.totalCost}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Cost per Message:</span>
                                                <span className="font-mono">
                                                    ${costs.today.costPerMessage}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-800 rounded-lg p-6">
                                        <h3 className="text-lg font-medium mb-4">Estimates</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Monthly (projected):</span>
                                                <span className="font-mono">
                                                    ${costs.estimates.monthlyIfSameUsage}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Savings vs Claude Pro:</span>
                                                <span className="font-mono text-green-500">
                                                    ${costs.estimates.savingsVsClaudePro}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-medium mb-4">Reality Check</h3>
                                    <div className="space-y-2 text-sm">
                                        <p className="text-gray-400">
                                            • Using Claude 3 Haiku (cheapest AWS Bedrock model)
                                        </p>
                                        <p className="text-gray-400">
                                            • Average cost: ~$0.003 per message
                                        </p>
                                        <p className="text-gray-400">
                                            • Claude.ai Pro: $20/month for unlimited messages
                                        </p>
                                        <p className="text-green-500 font-medium mt-4">
                                            You'd need to send ~6,666 messages/month to equal Claude Pro cost
                                        </p>
                                        <p className="text-gray-400 mt-2">
                                            Translation: Use this unlimited. You're saving money.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={fetchCosts}
                                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium"
                                >
                                    Refresh Costs
                                </button>
                            </>
                        ) : (
                            <div className="bg-gray-800 rounded-lg p-12 text-center">
                                <p className="text-gray-400 mb-4">Loading cost data...</p>
                                <button
                                    onClick={fetchCosts}
                                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium"
                                >
                                    Load Costs
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
