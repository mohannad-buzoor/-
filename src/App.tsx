/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings2, 
  Info, 
  RotateCcw, 
  Anchor, 
  MoveUpRight, 
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { SimulationMode, SimulationState, ForceData } from './types';
import { DEFAULT_STATE, COLORS } from './constants';
import SimulationCanvas from './components/SimulationCanvas';

export default function App() {
  const [state, setState] = useState<SimulationState>(DEFAULT_STATE);
  const [showHelp, setShowHelp] = useState(false);

  const forceData = useMemo((): ForceData => {
    const g = state.g;
    const fg = state.mass * g;
    
    if (state.mode === SimulationMode.SUSPENDED) {
      return {
        fg,
        ft: fg,
        fn: 0,
        ftx: 0,
        fty: fg,
        isFloating: true
      };
    } else {
      const rad = (state.angle * Math.PI) / 180;
      const ft = state.tensionMagnitude;
      const ftx = ft * Math.cos(rad);
      const fty = ft * Math.sin(rad);
      const fn = Math.max(0, fg - fty);
      const isFloating = fty > fg;

      return {
        fg,
        ft,
        fn,
        ftx,
        fty,
        isFloating
      };
    }
  }, [state]);

  const reset = () => setState(DEFAULT_STATE);

  const updateState = (updates: Partial<SimulationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Settings2 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">مستكشف القوى</h1>
              <p className="text-sm text-slate-500">قوة الشد والقوة العمودية - الصف العاشر</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
              title="مساعدة"
            >
              <Info size={20} />
            </button>
            <button 
              onClick={reset}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
              title="إعادة تعيين"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulation & Stats */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="relative aspect-[3/2] lg:aspect-auto lg:h-[500px]">
            <SimulationCanvas state={state} forceData={forceData} />
            
            {/* Status Badge */}
            <AnimatePresence>
              {forceData.isFloating && state.mode === SimulationMode.PULLED && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-4 right-4 bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm"
                >
                  <AlertCircle size={18} />
                  <span className="text-sm font-semibold">انعدام التلامس: الجسم يرتفع عن السطح</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Numerical Values */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard 
              label="الوزن (Fg)" 
              value={forceData.fg} 
              unit="N" 
              color={COLORS.fg} 
              formula="m × g"
            />
            <StatCard 
              label="قوة الشد (FT)" 
              value={forceData.ft} 
              unit="N" 
              color={COLORS.ft} 
              formula={state.mode === SimulationMode.SUSPENDED ? "FT = Fg" : "قيمة مدخلة"}
            />
            {state.mode === SimulationMode.PULLED && (
              <>
                <StatCard 
                  label="القوة العمودية (FN)" 
                  value={forceData.fn} 
                  unit="N" 
                  color={COLORS.fn} 
                  formula="Fg - FTy"
                />
                <StatCard 
                  label="المركبة الرأسية (FTy)" 
                  value={forceData.fty} 
                  unit="N" 
                  color={COLORS.components} 
                  formula="FT × sin(θ)"
                />
                <StatCard 
                  label="المركبة الأفقية (FTx)" 
                  value={forceData.ftx} 
                  unit="N" 
                  color={COLORS.components} 
                  formula="FT × cos(θ)"
                />
              </>
            )}
          </div>
        </div>

        {/* Right Column: Controls & Explanation */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Mode Selector */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">اختر وضع المحاكاة</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateState({ mode: SimulationMode.SUSPENDED, angle: 90 })}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  state.mode === SimulationMode.SUSPENDED 
                  ? 'border-blue-600 bg-blue-50 text-blue-700' 
                  : 'border-slate-100 hover:border-slate-200 text-slate-500'
                }`}
              >
                <Anchor size={24} />
                <span className="text-sm font-bold">تعليق رأسي</span>
              </button>
              <button
                onClick={() => updateState({ mode: SimulationMode.PULLED, angle: 0 })}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  state.mode === SimulationMode.PULLED 
                  ? 'border-blue-600 bg-blue-50 text-blue-700' 
                  : 'border-slate-100 hover:border-slate-200 text-slate-500'
                }`}
              >
                <MoveUpRight size={24} />
                <span className="text-sm font-bold">سحب على سطح</span>
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">المتغيرات</h3>
            
            <SliderControl
              label="الكتلة (m)"
              value={state.mass}
              min={0.5}
              max={50}
              step={0.5}
              unit="kg"
              onChange={(v) => updateState({ mass: v })}
            />

            {state.mode === SimulationMode.PULLED && (
              <>
                <SliderControl
                  label="زاوية الشد (θ)"
                  value={state.angle}
                  min={0}
                  max={90}
                  step={1}
                  unit="°"
                  onChange={(v) => updateState({ angle: v })}
                />
                <SliderControl
                  label="مقدار الشد (FT)"
                  value={state.tensionMagnitude}
                  min={0}
                  max={500}
                  step={10}
                  unit="N"
                  onChange={(v) => updateState({ tensionMagnitude: v })}
                />
              </>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
              <span>تسارع الجاذبية (g)</span>
              <span className="font-mono font-bold">10 m/s²</span>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Info size={20} />
              تحليل فيزيائي
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              {state.mode === SimulationMode.SUSPENDED ? (
                "في حالة التعليق الرأسي الساكن، تكون القوة المحصلة صفراً. لذا فإن قوة الشد في الحبل (FT) تساوي تماماً وزن الجسم (Fg) وتعاكسه في الاتجاه."
              ) : (
                `عند سحب الجسم بزاوية، تتحلل قوة الشد إلى مركبتين. المركبة الرأسية (FTy) تساعد في حمل الجسم، مما يقلل من ضغطه على السطح، وبالتالي تقل القوة العمودية (FN).`
              )}
            </p>
            {state.mode === SimulationMode.PULLED && (
              <div className="mt-4 p-3 bg-blue-800/50 rounded-lg font-mono text-xs">
                FN = Fg - FTy <br/>
                FN = {forceData.fg.toFixed(0)} - {forceData.fty.toFixed(0)} = {forceData.fn.toFixed(0)} N
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">كيفية الاستخدام</h2>
              <ul className="space-y-4 text-slate-600">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                  <p>اختر وضع المحاكاة (تعليق أو سحب) من لوحة التحكم.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                  <p>استخدم أشرطة التمرير لتغيير الكتلة، الزاوية، أو قوة الشد.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                  <p>راقب تغير أطوال أسهم القوى في الرسم والقيم الرقمية في الجداول.</p>
                </li>
              </ul>
              <button 
                onClick={() => setShowHelp(false)}
                className="w-full mt-8 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                فهمت ذلك
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, unit, color, formula }: { label: string, value: number, unit: string, color: string, formula: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold" style={{ color }}>{value.toFixed(1)}</span>
        <span className="text-xs text-slate-400 font-medium">{unit}</span>
      </div>
      <span className="text-[9px] text-slate-400 font-mono italic">{formula}</span>
    </div>
  );
}

function SliderControl({ label, value, min, max, step, unit, onChange }: { label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (v: number) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-700">{label}</label>
        <div className="bg-slate-100 px-2 py-1 rounded text-xs font-mono font-bold text-slate-600">
          {value}{unit}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
