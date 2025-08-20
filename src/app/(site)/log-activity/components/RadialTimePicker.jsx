"use client";
import { useState, useRef, useEffect } from 'react';

// Custom lightweight radial time picker (24h)
export default function RadialTimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState('hour'); // 'hour' | 'minute'
  const [tempHour, setTempHour] = useState(null); // number 0-23
  const [tempMinute, setTempMinute] = useState(null); // number 0-59
  const containerRef = useRef(null);

  // Initialize from value
  useEffect(() => {
    if (value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
      const [h, m] = value.split(':').map(Number);
      setTempHour(h);
      setTempMinute(m);
    } else if (!value) {
      setTempHour(null);
      setTempMinute(null);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e){
      if(!containerRef.current) return;
      if(!containerRef.current.contains(e.target)) setOpen(false);
    }
    if(open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const display = value || '';

  function selectHour(h){
    setTempHour(h);
    // If minute already chosen keep it, else go to minute phase
    setPhase('minute');
  }
  function selectMinute(m){
    setTempMinute(m);
    const hh = String(tempHour).padStart(2,'0');
    const mm = String(m).padStart(2,'0');
    onChange && onChange(`${hh}:${mm}`);
    setOpen(false);
    setPhase('hour');
  }
  function clearTime(){
    setTempHour(null); setTempMinute(null); onChange && onChange(''); setPhase('hour');
  }

  // Build dial marks
  const size = 220; // px
  const radius = 90;
  const center = size/2;
  const outerHours = Array.from({length:12}).map((_,i)=>i); // 0-11
  const innerHours = Array.from({length:12}).map((_,i)=>i+12); //12-23
  // minutes in steps of 5
  const minuteNumbers = Array.from({length:60}).map((_,i)=>i).filter(m=>m%5===0);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setOpen(o=>!o)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-tosca-200 focus:ring-2 focus:ring-tosca-100 transition-all font-mono flex items-center justify-between"
        >
          <span>{display || 'Pilih Jam (opsional)'}</span>
          <span className="text-gray-400">🕒</span>
        </button>
        {value && (
          <button type="button" onClick={clearTime} className="text-xs text-gray-400 hover:text-red-500" aria-label="Clear time">✕</button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 mt-2 shadow-xl border border-gray-200 bg-white rounded-lg p-4 w-[260px]">
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-lg">
              <span className={phase==='hour' ? 'text-tosca-500 font-bold' : 'text-gray-700 cursor-pointer'} onClick={()=>setPhase('hour')}>
                {tempHour!=null?String(tempHour).padStart(2,'0'):'--'}
              </span>
              :
              <span className={phase==='minute' ? 'text-tosca-500 font-bold ml-1' : 'text-gray-700 ml-1 cursor-pointer'} onClick={()=> tempHour!=null && setPhase('minute')}>
                {tempMinute!=null?String(tempMinute).padStart(2,'0'):'--'}
              </span>
            </div>
            <div className="flex gap-2">
              {phase==='minute' && (
                <button type="button" onClick={()=>setPhase('hour')} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Jam</button>
              )}
              {phase==='minute' && tempHour!=null && (
                <button type="button" onClick={() => { if(tempMinute==null) { selectMinute(0); } else { setOpen(false); setPhase('hour'); } }} className="text-xs px-2 py-1 rounded bg-tosca-200 text-white hover:bg-tosca-300">OK</button>
              )}
            </div>
          </div>
          <div className="relative mx-auto" style={{width:size,height:size}}>
            <svg width={size} height={size} className="select-none">
              <circle cx={center} cy={center} r={radius+18} fill="#f8fafc" stroke="#e2e8f0" />
              {phase==='hour' && (
                <>
                  {outerHours.map((num, idx) => {
                    const total = outerHours.length; //12
                    const angle = (Math.PI*2)*(idx/total) - Math.PI/2;
                    const rOut = radius; // outer ring
                    const x = center + rOut * Math.cos(angle);
                    const y = center + rOut * Math.sin(angle);
                    const active = num===tempHour;
                    const label = String(num).padStart(2,'0');
                    return (
                      <g key={label} onClick={()=>selectHour(num)} className="cursor-pointer">
                        <circle cx={x} cy={y} r={active?16:14} fill={active? '#14b8a6':'#ffffff'} stroke={active? '#0d9488':'#cbd5e1'} strokeWidth={1} />
                        <text x={x} y={y+4} textAnchor="middle" fontSize={12} fontFamily="monospace" fill={active?'#ffffff':'#0f172a'}>{label}</text>
                      </g>
                    );
                  })}
                  {innerHours.map((num, idx) => {
                    const total = innerHours.length; //12
                    const angle = (Math.PI*2)*(idx/total) - Math.PI/2;
                    const rIn = radius * 0.60; // inner ring radius
                    const x = center + rIn * Math.cos(angle);
                    const y = center + rIn * Math.sin(angle);
                    const active = num===tempHour;
                    const label = String(num).padStart(2,'0');
                    return (
                      <g key={label} onClick={()=>selectHour(num)} className="cursor-pointer">
                        <circle cx={x} cy={y} r={active?16:14} fill={active? '#14b8a6':'#ffffff'} stroke={active? '#0d9488':'#cbd5e1'} strokeWidth={1} />
                        <text x={x} y={y+4} textAnchor="middle" fontSize={12} fontFamily="monospace" fill={active?'#ffffff':'#0f172a'}>{label}</text>
                      </g>
                    );
                  })}
                </>
              )}
              {phase==='minute' && minuteNumbers.map(num => {
                const total = minuteNumbers.length; //12 marks (0..55 step5)
                const index = minuteNumbers.indexOf(num);
                const angle = (Math.PI*2)*(index/total) - Math.PI/2;
                const r = radius; // use outer ring for minutes
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                const label = String(num).padStart(2,'0');
                const active = num===tempMinute;
                return (
                  <g key={label} onClick={()=>selectMinute(num)} className="cursor-pointer">
                    <circle cx={x} cy={y} r={active?16:14} fill={active? '#14b8a6':'#ffffff'} stroke={active? '#0d9488':'#cbd5e1'} strokeWidth={1} />
                    <text x={x} y={y+4} textAnchor="middle" fontSize={12} fontFamily="monospace" fill={active?'#ffffff':'#0f172a'}>{label}</text>
                  </g>
                );
              })}
              {/* Hand */}
              {(phase==='hour' && tempHour!=null) && (()=>{
                const isOuter = tempHour < 12;
                const index = isOuter ? tempHour : tempHour - 12;
                const total = 12;
                const angle = (Math.PI*2)*(index/total) - Math.PI/2;
                const rHand = isOuter ? (radius-32) : (radius*0.60 - 20);
                const rx = center + rHand*Math.cos(angle);
                const ry = center + rHand*Math.sin(angle);
                return <line x1={center} y1={center} x2={rx} y2={ry} stroke="#0d9488" strokeWidth={3} strokeLinecap="round" />;
              })()}
              {(phase==='minute' && tempMinute!=null) && (()=>{
                const idx = minuteNumbers.indexOf(tempMinute);
                const total = minuteNumbers.length;
                const angle = (Math.PI*2)*(idx/total)-Math.PI/2;
                const rx = center + (radius-32)*Math.cos(angle);
                const ry = center + (radius-32)*Math.sin(angle);
                return <line x1={center} y1={center} x2={rx} y2={ry} stroke="#0d9488" strokeWidth={3} strokeLinecap="round" />;
              })()}
              <circle cx={center} cy={center} r={4} fill="#0d9488" />
            </svg>
          </div>
          {phase==='hour' && <p className="text-xs text-gray-500 mt-2 text-center">Pilih jam (0-23)</p>}
          {phase==='minute' && <p className="text-xs text-gray-500 mt-2 text-center">Pilih menit (kelipatan 5)</p>}
          <div className="flex justify-between mt-3">
            <button type="button" onClick={clearTime} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Clear</button>
            <button type="button" onClick={()=> setOpen(false)} className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
