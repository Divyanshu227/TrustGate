"use client";

import { motion } from 'framer-motion';
import { ShieldAlert, Zap, TerminalSquare } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeSpam = async () => {
    if (!message) return;
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({
        classification: 'Error',
        confidence: 0,
        reasons: ["Failed to connect to AI engine."]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
      
      {/* Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary mb-8"
        >
          <Zap size={16} />
          <span className="text-sm font-medium tracking-wide uppercase">AI-Powered Threat Detection</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-center mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500"
        >
          Protect Your Platform.<br/>Zero Compromise.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg md:text-xl text-center max-w-2xl mb-12"
        >
          TrustGate is the intelligent gateway against spam, phishing, and toxic content. Built for modern developers and enterprise systems.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-3xl glass-panel rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <TerminalSquare className="text-primary" />
            <h2 className="text-xl font-semibold text-white">Live AI Analysis Demo</h2>
          </div>
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste a message here to scan for threats (e.g. 'Click here to win $5000')..."
            className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors resize-none mb-4"
          />
          
          <button 
            onClick={analyzeSpam}
            disabled={loading || !message}
            className="w-full bg-primary hover:bg-primary/80 text-background font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Analyzing Neural Pathways...' : 'Scan for Threats'}
            {!loading && <ShieldAlert size={18} />}
          </button>
          
          {result && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-6 p-4 rounded-xl border ${result.classification === 'Spam' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">{result.classification} Detected</span>
                <span className="font-mono text-sm">{result.confidence}% Confidence</span>
              </div>
              <ul className="list-disc list-inside text-sm opacity-80">
                {result.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
              </ul>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
