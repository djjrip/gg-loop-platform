import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Monitor, Shield, Gamepad2, CheckCircle, Zap, Trophy, Lock, Eye, Github, ExternalLink } from 'lucide-react';

export default function DesktopDownload() {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = () => {
        setDownloading(true);
        // Open GitHub releases page for download
        window.open('https://github.com/djjrip/gg-loop-platform/releases', '_blank');
        setTimeout(() => setDownloading(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0d0907] via-[#1a120b] to-[#0d0907] text-white">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#C19A6B] to-[#D4A373] bg-clip-text text-transparent">
                        GG LOOP Desktop
                    </h1>
                    <p className="text-xl text-[#C19A6B] mb-2">Verification App for Windows</p>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Verify your gameplay, earn points for ACTUALLY playing, and redeem real rewards.
                        No idle farming — we track real inputs.
                    </p>
                </motion.div>

                {/* Download Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#C19A6B] to-[#D4A373] text-black font-bold text-lg rounded-xl shadow-lg shadow-[#C19A6B]/30 hover:shadow-[#C19A6B]/50 transition-all duration-300 hover:scale-105"
                    >
                        <Download className="w-6 h-6" />
                        {downloading ? 'Downloading...' : 'Download for Windows'}
                    </button>
                    <p className="mt-4 text-sm text-gray-500">
                        v1.0.0 • Windows 10/11 • ~80 MB (zip)
                    </p>
                </motion.div>

                {/* Trust Signals */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-green-900/20 border border-green-700/50 rounded-xl p-6 mb-12 text-left"
                >
                    <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Safe & Transparent
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                            <Lock className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <div>
                                <span className="text-green-300 font-medium">No Kernel Access</span>
                                <p className="text-gray-400">Unlike invasive anti-cheats, we only read process names and input activity. No deep system access.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Eye className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <div>
                                <span className="text-green-300 font-medium">What We Track</span>
                                <p className="text-gray-400">Mouse movement, keyboard input timing (not keystrokes), and which game is running. That's it.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Github className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <div>
                                <span className="text-green-300 font-medium">Open Source</span>
                                <p className="text-gray-400">
                                    View our code on{' '}
                                    <a
                                        href="https://github.com/djjrip/gg-loop-platform"
                                        target="_blank"
                                        className="text-green-400 hover:underline inline-flex items-center gap-1"
                                    >
                                        GitHub <ExternalLink className="w-3 h-3" />
                                    </a>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <div>
                                <span className="text-green-300 font-medium">No Screenshots or Recording</span>
                                <p className="text-gray-400">We never capture your screen, webcam, or audio. Period.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[#1a120b]/50 border border-[#3E2723] rounded-xl p-6"
                    >
                        <Gamepad2 className="w-10 h-10 text-[#C19A6B] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">18+ Games Supported</h3>
                        <p className="text-gray-400 text-sm">
                            Valorant, League, CS2, Warframe, Apex, and more
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-[#1a120b]/50 border border-[#3E2723] rounded-xl p-6"
                    >
                        <Shield className="w-10 h-10 text-[#C19A6B] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Anti-Cheat Verified</h3>
                        <p className="text-gray-400 text-sm">
                            We track real WASD, mouse, and click inputs
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-[#1a120b]/50 border border-[#3E2723] rounded-xl p-6"
                    >
                        <Trophy className="w-10 h-10 text-[#C19A6B] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Real Rewards</h3>
                        <p className="text-gray-400 text-sm">
                            Gift cards, Discord Nitro, game credits
                        </p>
                    </motion.div>
                </div>

                {/* How It Works */}
                <div className="text-left mb-16">
                    <h2 className="text-2xl font-bold text-center mb-8 text-[#C19A6B]">How It Works</h2>

                    <div className="space-y-4 max-w-2xl mx-auto">
                        <div className="flex items-start gap-4 bg-[#1a120b]/50 border border-[#3E2723] rounded-lg p-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#C19A6B] rounded-full flex items-center justify-center text-black font-bold">1</div>
                            <div>
                                <h4 className="font-semibold mb-1">Download & Extract</h4>
                                <p className="text-gray-400 text-sm">Download the zip, extract anywhere, run "GG Loop Desktop.exe"</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 bg-[#1a120b]/50 border border-[#3E2723] rounded-lg p-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#C19A6B] rounded-full flex items-center justify-center text-black font-bold">2</div>
                            <div>
                                <h4 className="font-semibold mb-1">Sign In with Twitch/Google/Discord</h4>
                                <p className="text-gray-400 text-sm">Connect your account to sync points across devices</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 bg-[#1a120b]/50 border border-[#3E2723] rounded-lg p-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#C19A6B] rounded-full flex items-center justify-center text-black font-bold">3</div>
                            <div>
                                <h4 className="font-semibold mb-1">Play Your Games</h4>
                                <p className="text-gray-400 text-sm">Launch a supported game — the app detects it automatically</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 bg-[#1a120b]/50 border border-[#3E2723] rounded-lg p-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#C19A6B] rounded-full flex items-center justify-center text-black font-bold">4</div>
                            <div>
                                <h4 className="font-semibold mb-1">Actually Play (No Idle)</h4>
                                <p className="text-gray-400 text-sm">We verify WASD, mouse, and clicks — idle = no points</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 bg-[#1a120b]/50 border border-[#3E2723] rounded-lg p-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#C19A6B] rounded-full flex items-center justify-center text-black font-bold">5</div>
                            <div>
                                <h4 className="font-semibold mb-1">Earn & Redeem</h4>
                                <p className="text-gray-400 text-sm">Earn points based on active playtime, redeem in the Shop</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Supported Games */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-center mb-8 text-[#C19A6B]">Supported Games</h2>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center text-sm">
                        {['Valorant', 'League of Legends', 'CS2', 'Dota 2', 'Apex Legends', 'PUBG',
                            'Fortnite', 'Overwatch 2', 'Warframe', 'Destiny 2', 'Rocket League', 'TF2',
                            'Rust', 'Dead by Daylight', 'ARK', 'GTA V', 'Minecraft', 'Roblox'
                        ].map((game) => (
                            <div key={game} className="bg-[#1a120b]/50 border border-[#3E2723] rounded-lg p-3">
                                <span className="text-gray-300">{game}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ */}
                <div className="mb-16 text-left">
                    <h2 className="text-2xl font-bold text-center mb-8 text-[#C19A6B]">FAQ</h2>
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <div className="bg-[#1a120b]/50 border border-[#3E2723] rounded-lg p-4">
                            <h4 className="font-semibold text-[#C19A6B] mb-2">Is this safe to download?</h4>
                            <p className="text-gray-400 text-sm">Yes. The app is open source on GitHub. It uses Electron (same tech as Discord). No kernel access, no screenshots, no keylogging.</p>
                        </div>
                        <div className="bg-[#1a120b]/50 border border-[#3E2723] rounded-lg p-4">
                            <h4 className="font-semibold text-[#C19A6B] mb-2">Why does Windows warn me?</h4>
                            <p className="text-gray-400 text-sm">We haven't purchased a code signing certificate yet (costs $300+/year). Click "More info" → "Run anyway" to proceed.</p>
                        </div>
                        <div className="bg-[#1a120b]/50 border border-[#3E2723] rounded-lg p-4">
                            <h4 className="font-semibold text-[#C19A6B] mb-2">What data do you collect?</h4>
                            <p className="text-gray-400 text-sm">Only: which game is running, mouse movement patterns, keyboard timing (not what you type), and session duration. We never access game memory or screen content.</p>
                        </div>
                        <div className="bg-[#1a120b]/50 border border-[#3E2723] rounded-lg p-4">
                            <h4 className="font-semibold text-[#C19A6B] mb-2">Will this get me banned in games?</h4>
                            <p className="text-gray-400 text-sm">No. We don't inject into games, modify game files, or access game memory. We're completely external and game-agnostic.</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-[#C19A6B]/10 to-[#D4A373]/10 border border-[#C19A6B] rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-4">Ready to Earn?</h2>
                    <p className="text-gray-400 mb-6">
                        Download the desktop app, sign up, and start playing to earn real rewards.
                    </p>
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#C19A6B] text-black font-bold rounded-lg hover:bg-[#D4A373] transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Download Now
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-[#3E2723] text-center text-sm text-gray-500">
                    <p>GG LOOP Desktop • Windows 10/11 • Powered by AWS</p>
                    <p className="mt-2">
                        <a href="https://github.com/djjrip/gg-loop-platform" target="_blank" className="text-[#C19A6B] hover:underline">View on GitHub</a>
                        {' • '}
                        <a href="/privacy" className="text-[#C19A6B] hover:underline">Privacy Policy</a>
                        {' • '}
                        <a href="/terms" className="text-[#C19A6B] hover:underline">Terms</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
