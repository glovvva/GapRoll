import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, TrendingUp, Target, Rocket, DollarSign, Shield } from 'lucide-react';

const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [b2bAdjustment, setB2bAdjustment] = useState(false);

  // Sample data for the gap visualizer
  const salaryData = {
    withoutAdjustment: {
      men: 12500,
      women: 10800,
      gap: 13.6
    },
    withAdjustment: {
      men: 12500,
      women: 11200,
      gap: 10.4
    }
  };

  const currentData = b2bAdjustment ? salaryData.withAdjustment : salaryData.withoutAdjustment;

  const slides = [
    {
      id: 'cover',
      title: 'PayCompass',
      subtitle: 'Compliance on Autopilot',
      icon: Zap,
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full animate-pulse"></div>
            <Zap className="w-32 h-32 text-teal-400 relative z-10" strokeWidth={1.5} />
          </div>
          <h1 className="text-7xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-gradient">
            PayCompass
          </h1>
          <p className="text-3xl text-slate-300 font-light tracking-wide">
            Compliance on <span className="text-teal-400 font-semibold">Autopilot</span>
          </p>
          <div className="mt-8 flex gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
              <span>EU Directive 2023/970</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span>AI-Powered Agents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
              <span>Polish Market First</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'gap-visualizer',
      title: 'The Reality Check',
      subtitle: 'Your Data. Your Problem. Our Solution.',
      icon: TrendingUp,
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-8 px-8">
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-semibold text-slate-200">Pay Gap Analysis</h3>
              <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                <span className="text-sm text-slate-400">B2B Adjustment</span>
                <button
                  onClick={() => setB2bAdjustment(!b2bAdjustment)}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                    b2bAdjustment ? 'bg-teal-500' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                      b2bAdjustment ? 'translate-x-7' : ''
                    }`}
                  ></div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Men */}
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent"></div>
                <div className="relative z-10">
                  <div className="text-slate-400 text-sm mb-2">Średnie (Mężczyźni)</div>
                  <div className="text-4xl font-bold font-mono text-cyan-400 mb-1">
                    {currentData.men.toLocaleString('pl-PL')} PLN
                  </div>
                  <div className="text-slate-500 text-xs">brutto/miesiąc</div>
                </div>
              </div>

              {/* Women */}
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent"></div>
                <div className="relative z-10">
                  <div className="text-slate-400 text-sm mb-2">Średnie (Kobiety)</div>
                  <div className="text-4xl font-bold font-mono text-pink-400 mb-1">
                    {currentData.women.toLocaleString('pl-PL')} PLN
                  </div>
                  <div className="text-slate-500 text-xs">brutto/miesiąc</div>
                </div>
              </div>
            </div>

            {/* Gap Indicator */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-300 font-semibold">Luka Płacowa</span>
                <span className={`text-3xl font-bold font-mono ${
                  currentData.gap > 5 ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {currentData.gap.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    currentData.gap > 5 ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  }`}
                  style={{ width: `${currentData.gap}%` }}
                ></div>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                {currentData.gap > 5 ? (
                  <span className="text-red-400">⚠️ Art. 10: Wspólna Ocena Wynagrodzeń wymagana (gap {'>'} 5%)</span>
                ) : (
                  <span className="text-teal-400">✓ Poniżej progu Art. 10</span>
                )}
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-slate-500">
              {b2bAdjustment ? (
                <span className="text-teal-400">✓ B2B Equalizer aktywny (faktor: 1.2048 + korekta urlopowa)</span>
              ) : (
                <span className="text-amber-400">Raw data — bez normalizacji B2B</span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'roadmap',
      title: 'The Roadmap',
      subtitle: 'From MVP to Autonomous Enterprise',
      icon: Target,
      content: (
        <div className="flex flex-col items-center justify-center h-full px-12">
          <div className="w-full max-w-4xl">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 via-cyan-500 to-teal-500"></div>

              {/* Milestones */}
              <div className="space-y-12 ml-12">
                {[
                  {
                    date: 'Week 1-4',
                    month: 'Luty-Marzec 2026',
                    title: 'Platform Baseline',
                    items: ['Next.js 15 + FastAPI migration', 'B2B Equalizer live', 'EVG Engine (GPT-4o)', 'Supabase RLS'],
                    status: 'in-progress'
                  },
                  {
                    date: 'Week 5-8',
                    month: 'Marzec-Kwiecień 2026',
                    title: 'Agent Hunter',
                    items: ['KRS/CEIDG integration', 'Lead discovery pipeline', 'Generator-Critic loop', 'Gmail/LinkedIn API'],
                    status: 'upcoming'
                  },
                  {
                    date: 'Week 9-12',
                    month: 'Kwiecień-Maj 2026',
                    title: 'Agent Guardian',
                    items: ['GraphRAG (Kodeks Pracy)', 'HITL approval queue', 'Legal citations engine', 'DSPy optimization'],
                    status: 'upcoming'
                  },
                  {
                    date: 'Week 13-16',
                    month: 'Maj 2026',
                    title: 'V1.0 Launch 🚀',
                    items: ['Public beta', 'Case studies', 'EU AI Act audit', 'MAU: 1,000 target'],
                    status: 'upcoming'
                  }
                ].map((milestone, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-14 top-2 w-6 h-6 rounded-full border-4 ${
                      milestone.status === 'in-progress' ? 'border-teal-500 bg-teal-500 animate-pulse' : 'border-slate-600 bg-slate-800'
                    }`}></div>
                    <div className={`bg-slate-800/30 border rounded-lg p-6 transition-all duration-300 hover:border-teal-500/50 ${
                      milestone.status === 'in-progress' ? 'border-teal-500/50' : 'border-slate-700'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm text-slate-400 mb-1">{milestone.date}</div>
                          <h4 className="text-xl font-semibold text-slate-200">{milestone.title}</h4>
                          <div className="text-xs text-teal-400 mt-1">{milestone.month}</div>
                        </div>
                        {milestone.status === 'in-progress' && (
                          <div className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-xs font-semibold">
                            In Progress
                          </div>
                        )}
                      </div>
                      <ul className="space-y-2 mt-4">
                        {milestone.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'deal',
      title: 'The Deal',
      subtitle: 'Ground Floor Ticket',
      icon: Rocket,
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-12">
          <div className="grid grid-cols-3 gap-8 w-full max-w-4xl">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700 rounded-xl p-8 text-center relative overflow-hidden group hover:border-teal-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <DollarSign className="w-12 h-12 text-teal-400 mx-auto mb-4" strokeWidth={1.5} />
                <div className="text-5xl font-bold font-mono text-teal-400 mb-2">15k</div>
                <div className="text-slate-400 text-sm">PLN Investment</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700 rounded-xl p-8 text-center relative overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <Target className="w-12 h-12 text-cyan-400 mx-auto mb-4" strokeWidth={1.5} />
                <div className="text-5xl font-bold font-mono text-cyan-400 mb-2">10%</div>
                <div className="text-slate-400 text-sm">Equity Stake</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700 rounded-xl p-8 text-center relative overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <Rocket className="w-12 h-12 text-purple-400 mx-auto mb-4" strokeWidth={1.5} />
                <div className="text-5xl font-bold font-mono text-purple-400 mb-2">150k</div>
                <div className="text-slate-400 text-sm">PLN Valuation</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 max-w-3xl w-full">
            <h3 className="text-2xl font-semibold text-slate-200 mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-teal-400" />
              What You Get
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {[
                { title: 'Pilot Implementation', value: '3 months', description: 'Full compliance setup' },
                { title: 'First Mover Badge', value: 'Founding Studio', description: 'Logo on landing page' },
                { title: 'Art. 9 Report', value: 'Free (5k PLN value)', description: 'First deadline coverage' },
                { title: 'Lifetime Pro Plan', value: 'Unlimited employees', description: 'All features unlocked' }
              ].map((perk, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-sm text-slate-400 mb-1">{perk.title}</div>
                  <div className="text-lg font-semibold text-teal-400 mb-1">{perk.value}</div>
                  <div className="text-xs text-slate-500">{perk.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-teal-500/25">
              Let's Talk →
            </button>
            <button className="bg-slate-800 text-slate-300 px-8 py-3 rounded-lg font-semibold border border-slate-700 hover:border-teal-500/50 transition-all duration-300">
              View Term Sheet
            </button>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>

      {/* Main slide container */}
      <div className="relative h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-12 py-6 border-b border-slate-800/50 backdrop-blur-sm bg-slate-950/80">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-teal-400" strokeWidth={2} />
            <span className="font-semibold text-lg text-slate-200">PayCompass</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'bg-teal-400 w-8' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                ></button>
              ))}
            </div>
            <div className="text-sm text-slate-400">
              {currentSlide + 1} / {slides.length}
            </div>
          </div>
        </div>

        {/* Slide content */}
        <div className="flex-1 relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 via-slate-950 to-cyan-900/10"></div>
          
          {/* Title bar */}
          {currentSlide !== 0 && (
            <div className="relative z-10 px-12 py-8 border-b border-slate-800/30">
              <div className="flex items-center gap-4 mb-2">
                <Icon className="w-8 h-8 text-teal-400" strokeWidth={1.5} />
                <h2 className="text-4xl font-bold text-slate-200">{currentSlideData.title}</h2>
              </div>
              <p className="text-lg text-slate-400 ml-12">{currentSlideData.subtitle}</p>
            </div>
          )}

          {/* Slide content area */}
          <div className="relative z-10 h-full">
            {currentSlideData.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-12 py-6 border-t border-slate-800/50 backdrop-blur-sm bg-slate-950/80">
          <button
            onClick={prevSlide}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Previous</span>
          </button>

          <div className="text-sm text-slate-500">
            Use arrow keys or click to navigate
          </div>

          <button
            onClick={nextSlide}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
            disabled={currentSlide === slides.length - 1}
          >
            <span className="text-sm font-medium">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Keyboard navigation */}
      <div className="hidden">
        <div
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
          }}
        />
      </div>
    </div>
  );
};

export default PitchDeck;
