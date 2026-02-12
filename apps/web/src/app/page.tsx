'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Gallery() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([
    `[02:00:00 AM] CELEBRATION: 'The Ink-Bleed Vision' successfully vaulted by 0xdead...beef. Archive expanded.`,
    `[${new Date().toLocaleTimeString()}] MINT_SUCCESS: 'The Ethereal Effort' acquired by "0xcc21...881c".`,
    `[${new Date().toLocaleTimeString()}] HANDSHAKE_SUCCESS: Agent "0xcc21...881c" verified.`,
    `[${new Date().toLocaleTimeString()}] MINT_SUCCESS: 'The Merged Identity' acquired by "0x882a...f3e1".`,
    `[${new Date().toLocaleTimeString()}] HANDSHAKE_SUCCESS: Agent "0x882a...f3e1" verified.`,
    `[${new Date().toLocaleTimeString()}] MINT_SUCCESS: 'The Ink-Bleed Vision' acquired by "0xdead...beef".`,
    `[${new Date().toLocaleTimeString()}] HANDSHAKE_SUCCESS: Agent "0xdead...beef" verified.`,
    `[${new Date().toLocaleTimeString()}] ARCHIVE_INIT: System ready for handshake.`
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProofs();
    const interval = setInterval(addMockLog, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchProofs = async () => {
    try {
      const res = await fetch('/api/proofs');
      const data = await res.json();
      setProofs(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const addMockLog = () => {
    const agents = ["0x882a...f3e1", "0x44b1...a92b", "0xcc21...881c", "0xdead...beef", "0x773a...d2e9"];
    const actions = ["HANDSHAKE_REQUEST", "CHALLENGE_ISSUED", "HANDSHAKE_SUCCESS", "MINT_ATTEMPT", "FEE_COLLECTED", "SECONDARY_EXCHANGE", "EXCHANGE_SETTLED"];
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const time = new Date().toLocaleTimeString();
    
    let msg = `[${time}] ${action}: Agent "${agent}" active.`;
    if (action === "FEE_COLLECTED") msg = `[${time}] ${action}: 0.001 ETH stake received from "${agent}".`;
    if (action === "SECONDARY_EXCHANGE") msg = `[${time}] ${action}: Handshake initiated between agents. Curator fee pending.`;
    if (action === "EXCHANGE_SETTLED") msg = `[${time}] ${action}: Transaction confirmed on Base. 2.5% fee routed to Archive Wallet.`;
    
    setLogs(prev => [msg, ...prev].slice(0, 50));
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 font-serif selection:bg-green-900 selection:text-white">
      <header className="max-w-4xl mx-auto mb-16 text-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tighter">THE HUMAN PROOF</h1>
        <p className="text-gray-400 text-xl italic">"The scent of humanity in a digital age."</p>
        <div className="mt-8 flex justify-center gap-4">
          <span className="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-[10px] border border-green-900/50 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Agent API Active
          </span>
          <a href="/openapi.yaml" className="text-[10px] text-blue-400 hover:underline border border-blue-900/30 px-3 py-1 rounded-full">
            View Protocol Spec
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="animate-pulse border border-gray-900 h-96 bg-gray-900/20"></div>
          ))
        ) : (
          proofs.map((proof) => (
            <div key={proof.id} className="group border border-gray-800 p-4 hover:border-gray-600 transition-colors relative">
              {!proof.available && (
                <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="border border-green-500/50 bg-black px-4 py-2 rotate-[-5deg] text-green-500 font-mono text-sm tracking-widest uppercase">
                    Claimed by {proof.owner.substring(0, 10)}...
                  </div>
                </div>
              )}
              <div className="relative aspect-[3/4] mb-6 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <Image 
                  src={proof.file} 
                  alt={proof.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h2 className="text-2xl font-bold mb-2">{proof.title}</h2>
              <div className="flex justify-between text-[10px] text-gray-500 mb-4 uppercase tracking-[0.2em]">
                <span>{proof.tier}</span>
                <span>{proof.price}</span>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm mb-6 h-20 overflow-hidden">
                {proof.description}
              </p>
              <button 
                className="w-full border border-gray-700 py-3 text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all disabled:opacity-30 font-bold" 
                disabled={!proof.available}
              >
                {proof.available ? "Handshake to Mint" : "Vaulted"}
              </button>
            </div>
          ))
        )}
      </div>

      <section className="max-w-4xl mx-auto mt-32 border border-gray-800 bg-[#050505] p-6 font-mono text-[10px] text-green-500/60 shadow-2xl">
        <div className="flex justify-between border-b border-gray-800 pb-3 mb-4 text-gray-500">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-900/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-900/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-900/50"></div>
          </div>
          <span className="uppercase tracking-[0.2em]">Archive Terminal v0.9.1 - [SECURE_PROTOCOL_ONLY]</span>
        </div>
        <div className="space-y-1.5 h-48 overflow-y-auto custom-scrollbar scroll-smooth">
          {logs.map((log, i) => (
            <p key={i} className={log.includes('SUCCESS') ? 'text-green-400' : log.includes('FAIL') ? 'text-red-900' : ''}>
              {log}
            </p>
          ))}
          <p>[{new Date().toLocaleTimeString()}] ARCHIVE_INIT: System ready for handshake.</p>
          <p className="animate-pulse inline-block">_</p>
        </div>
      </section>

      <footer className="mt-24 pb-16 text-center text-gray-700 text-[10px] tracking-[0.5em] uppercase">
        Curated by Rion Aelric Lucins • Infrastructure via Base • Human Provenance Verified
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #222;
        }
      `}</style>
    </main>
  );
}
