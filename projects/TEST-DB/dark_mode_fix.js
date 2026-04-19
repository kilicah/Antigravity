const fs = require('fs');
const path = 'C:\\X\\Antigravity\\projects\\TEST-DB\\src\\app\\products\\components\\ProductTableClient.tsx';

let text = fs.readFileSync(path, 'utf8');

// Replace light mode classes with dark mode classes
text = text.replace('bg-slate-50/95 backdrop-blur-md shadow-sm border-b border-slate-200', 'bg-[#0B1120]/95 backdrop-blur-md shadow-lg border-b border-slate-800');
text = text.replace('bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-800', 'bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-white');
text = text.replace('bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60', 'bg-[#0F172A]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800');
text = text.replace('bg-white/90 backdrop-blur-xl p-3 rounded-xl border border-slate-200/60 shadow-md', 'bg-[#1E293B]/80 backdrop-blur-xl p-3 rounded-xl border border-slate-700/60 shadow-xl');
text = text.replace('bg-white/50 focus:bg-white text-sm focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-colors placeholder:text-slate-400 text-slate-800', 'bg-slate-900/50 focus:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-slate-500 text-white');
text = text.replace(/border border-slate-200 rounded-lg/g, 'border border-slate-700 rounded-lg');

text = text.replace('? "bg-white text-slate-800"', '? "bg-blue-600 text-white"');
text = text.replace(': "bg-transparent text-slate-500 border-transparent shadow-none hover:bg-slate-100"', ': "bg-transparent text-slate-400 border-transparent shadow-none hover:bg-slate-800 hover:text-slate-300"');

text = text.replace('bg-slate-50/95 backdrop-blur-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]', 'bg-[#0B1120]/90 backdrop-blur-sm border-b border-slate-800');
text = text.replace('text-slate-500 text-[11px] uppercase tracking-wider', 'text-slate-400 text-[11px] uppercase tracking-wider');
text = text.replace(/hover:bg-slate-100\/50/g, 'hover:bg-slate-800/50');
text = text.replace(/text-slate-800">\{sortConfig\.dir === "asc"/g, 'text-blue-400">{sortConfig.dir === "asc"');

text = text.replace(/text-slate-900/g, 'text-slate-200');
text = text.replace(/hover:bg-slate-50\/80/g, 'hover:bg-slate-800/40');
text = text.replace(/bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/g, 'bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-blue-300');
text = text.replace(/divide-slate-100\/50/g, 'divide-slate-800/50');
text = text.replace(/bg-indigo-50\/50/g, 'bg-blue-900/40');
text = text.replace(/text-indigo-600/g, 'text-blue-500');

text = text.replace(/text-slate-600/g, 'text-slate-300');
text = text.replace(/text-blue-700/g, 'text-blue-400');
text = text.replace(/text-rose-900/g, 'text-rose-400');
text = text.replace(/text-indigo-700/g, 'text-indigo-300');
text = text.replace(/bg-indigo-50\/30/g, 'bg-indigo-900/30');

// Modal
text = text.replace('bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200', 'bg-slate-900 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-3xl overflow-hidden border border-slate-700');
text = text.replace('bg-slate-50 px-6 py-4 border-b border-slate-200', 'bg-slate-800 px-6 py-4 border-b border-slate-700');

text = text.replace(/w-full bg-slate-50 border border-slate-200/g, 'w-full bg-slate-800 border border-slate-700');
text = text.replace(/w-full bg-white border border-rose-200/g, 'w-full bg-slate-800 border border-rose-500/30');

text = text.replace('text-xl font-bold text-slate-800', 'text-xl font-bold text-white');
text = text.replace('text-sm font-bold text-slate-800', 'text-sm font-bold text-slate-200');

text = text.replace('p-5 border-t border-slate-200 bg-slate-50 shrink-0', 'p-5 border-t border-slate-700 bg-slate-800 shrink-0');
text = text.replace('border border-slate-300 text-slate-700 font-bold hover:bg-slate-100', 'border border-slate-600 text-slate-300 font-bold hover:bg-slate-700');
text = text.replace(/focus:ring-slate-800 focus:border-slate-800/g, 'focus:ring-blue-500 focus:border-blue-500');

fs.writeFileSync(path, text, 'utf8');
console.log("Dark mode conversion completed!");
