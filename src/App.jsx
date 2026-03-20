import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  LayoutGrid, 
  ChevronRight,
  Database,
  ArrowRight
} from 'lucide-react';
import { DEFAULT_RULES, calculateScore, generateMockListingData } from './utils/VastuEngine';
import LogoImg from './logo/Final_logo.jpg';

const VastuAura = () => {
  const [view, setView] = useState('search'); // search, dashboard, admin
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState(() => {
    const savedRules = localStorage.getItem('vastuaura-rules');
    return savedRules ? JSON.parse(savedRules) : DEFAULT_RULES;
  });
  const [currentScore, setCurrentScore] = useState(null);
  const [address, setAddress] = useState('');
  const [mlsUrl, setMlsUrl] = useState('');

  // Persist rules in localStorage
  useEffect(() => {
    localStorage.setItem('vastuaura-rules', JSON.stringify(rules));
  }, [rules]);

  // Handle address/MLS URL submission
  const handleAnalyze = async () => {
    if (!address && !mlsUrl) return;
    setLoading(true);

    // Mock data generation based on address
    const simulatedRules = generateMockListingData(address || mlsUrl, rules);
    
    // Logic extraction complete
    setTimeout(() => {
      const finalResult = calculateScore(simulatedRules);
      setCurrentScore(finalResult);
      setLoading(false);
      setView('dashboard');
    }, 2500);
  };

  // Add a new rule (Admin)
  const addRule = (newRule) => {
    setRules([...rules, newRule]);
  };

  const ScoreGauge = ({ score }) => {
    const size = 220;
    const strokeWidth = 12;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="gauge-container">
        <svg className="gauge-svg">
          <circle className="gauge-bg" cx={center} cy={center} r={radius} />
          <motion.circle 
            className="gauge-progress" 
            cx={center} cy={center} r={radius} 
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="score-display">
          <span className="score-value gold-gradient">{score}</span>
          <span className="score-label">Vastu Score</span>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="nav-bar">
        <h2 className="gold-gradient" style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1.4rem' }}>
          <img src={LogoImg} alt="Vastu Aura Logo" style={{ height: '85px', border: '1.5px solid var(--primary)', borderRadius: '10px' }} />
          Vastu Aura
        </h2>
        <button onClick={() => setView(view === 'admin' ? 'search' : 'admin')}>
          <Settings size={22} color={view === 'admin' ? 'var(--primary)' : 'var(--text-dim)'} />
        </button>
      </nav>

      <AnimatePresence mode="wait">
        {/* Search / Input View */}
        {view === 'search' && (
          <motion.div 
            key="search"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="view-content"
            style={{ padding: '24px' }}
          >
            <div className="glass-card" style={{ marginTop: '20px', textAlign: 'center' }}>
              <motion.img 
                src={LogoImg} 
                alt="Vastu Aura" 
                style={{ width: '220px', height: '220px', marginBottom: '25px', border: '2px solid var(--primary)', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              />
              <h1 style={{ marginBottom: '10px' }}>Evaluate your Home's Harmony.</h1>
              <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '25px' }}>
                Enter a US address or MLS listing URL to calculate the Vastu score and get remediation advice.
              </p>

              <div className="input-group">
                <label className="input-label">Property Address</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    className="premium-input" 
                    placeholder="e.g. 123 Harmony St, San Francisco"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', right: '15px', top: '15px' }} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">MLS Listing URL (Zillow/Redfin)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    className="premium-input" 
                    placeholder="https://..."
                    value={mlsUrl}
                    onChange={(e) => setMlsUrl(e.target.value)}
                  />
                  <Database size={18} color="var(--text-dim)" style={{ position: 'absolute', right: '15px', top: '15px' }} />
                </div>
              </div>

              <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Settings size={20} />
                  </motion.div>
                ) : (
                  <>Analyze Vastu <ArrowRight size={20} /></>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Dashboard View */}
        {view === 'dashboard' && currentScore && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="view-content"
          >
            <div style={{ padding: '0 24px' }}>
              <ScoreGauge score={currentScore.score} />
              
              <div className="glass-card" style={{ marginBottom: '15px', textAlign: 'center' }}>
                <h3 className="gold-gradient">{currentScore.verdict} Harmony</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Property is {currentScore.score}% compliant with traditional Vastu Shastra.</p>
              </div>

              {/* Key Highlights */}
              <div className="glass-card" style={{ padding: '15px' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Facing</span>
                       <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>{currentScore.facing}</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Main Door</span>
                       <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{currentScore.breakdown[0].condition}</div>
                    </div>
                 </div>
                 <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', textAlign: 'center', marginBottom: '8px' }}>Top Complainces</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
                       {currentScore.breakdown.filter(i => i.isPositive).slice(0, 3).map((item, i) => (
                          <span key={i} className="badge badge-success" style={{ fontSize: '0.65rem' }}>{item.name}</span>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="glass-card">
                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', textAlign: 'center' }}>Detailed Compliance</h3>
                {Object.entries(currentScore.categoryScores).map(([category, data], i) => (
                  <div key={i} style={{ marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary)' }}>{category}</span>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{Math.round(data.scoreTotal / data.count)}% Match</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', marginBottom: '15px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${data.scoreTotal / data.count}%` }}
                        style={{ height: '100%', background: `linear-gradient(90deg, var(--gold-mid), var(--primary))` }}
                      />
                    </div>
                    {data.items.map((item, idx) => (
                      <div key={idx} style={{ padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.name}</span>
                          <span style={{ fontSize: '0.8rem', color: item.isPositive ? '#10b981' : '#ef4444' }}>{item.points} pts</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>{item.condition}: {item.recommendation}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="glass-card" style={{ marginBottom: '40px' }}>
                <h3>Professional Advice</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', margin: '10px 0' }}>
                  Every home unique. Our certified Vastu consultants can provide a personalized architectural plan for corrections.
                </p>
                <button className="btn-secondary" style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                  <Phone size={18} /> Contact Vastu Expert
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Admin View */}
        {view === 'admin' && (
          <motion.div 
            key="admin"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="view-content"
            style={{ padding: '24px' }}
          >
            <div className="glass-card">
              <h2 className="gold-gradient">Rule Engine Settings</h2>
              <p style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>Manage the Vastu scoring logic and importance weights.</p>
              
              <div style={{ marginTop: '20px' }}>
                {rules.map((rule, idx) => (
                  <div key={idx} style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>{rule.name}</span>
                      <span className="gold-gradient">W: {rule.weight}%</span>
                    </div>
                  </div>
                ))}
                
                <button className="btn-primary" style={{ marginTop: '20px', padding: '12px', fontSize: '1rem' }}>
                  <LayoutGrid size={18} /> Add New Rule
                </button>
              </div>
            </div>
            <button className="btn-secondary" onClick={() => setView('search')}>Back to App</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VastuAura;
