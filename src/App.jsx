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
  ArrowRight,
  Compass as CompassIcon
} from 'lucide-react';
import { DEFAULT_RULES, calculateScore, generateMockListingData } from './utils/VastuEngine';
import LogoImg from './logo/Final_logo.jpg';

const VastuAura = () => {
  const [view, setView] = useState('search'); // search, dashboard, admin, compass
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState(() => {
    const savedRules = localStorage.getItem('vastuaura-rules');
    return savedRules ? JSON.parse(savedRules) : DEFAULT_RULES;
  });
  const [currentScore, setCurrentScore] = useState(null);
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mlsUrl, setMlsUrl] = useState('');

  // Address Autocomplete Logic (Google Maps + Fallback)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (address.length < 5) {
        setSuggestions([]);
        return;
      }

      // Try Google Places First
      if (window.google && window.google.maps && window.google.maps.places) {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({ 
          input: address, 
          componentRestrictions: { country: 'us' } // Precise US focus
        }, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.map(p => p.description));
            setShowSuggestions(true);
          }
        });
      } else {
        // Fallback to high-speed Photon geocoder if Google script is blocked or missing key
        try {
          const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=5&location_bias=us`);
          const data = await res.json();
          const results = data.features.map(f => {
            const p = f.properties;
            return [p.name || p.street, p.city, p.state, 'USA'].filter(Boolean).join(', ');
          });
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (e) { console.error("Autocomplete error", e); }
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 350);
    return () => clearTimeout(timeoutId);
  }, [address]);

  // Persist rules in localStorage
  useEffect(() => {
    localStorage.setItem('vastuaura-rules', JSON.stringify(rules));
  }, [rules]);

  // Handle address/MLS URL submission
  const handleAnalyze = async (selectedAddress) => {
    const finalAddress = selectedAddress || address || mlsUrl;
    if (!finalAddress) return;
    setLoading(true);
    setShowSuggestions(false);

    const simulatedRules = generateMockListingData(finalAddress, rules);
    
    setTimeout(() => {
      const finalResult = calculateScore(simulatedRules);
      setCurrentScore(finalResult);
      setLoading(false);
      setView('dashboard');
    }, 2500);
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

  const VastuCompass = () => {
    const [heading, setHeading] = useState(0);
    const [active, setActive] = useState(false);

    useEffect(() => {
      if (!active) return;
      
      const handleOrientation = (e) => {
        let degree = e.webkitCompassHeading || (360 - e.alpha);
        if (degree !== undefined) setHeading(Math.round(degree));
      };

      const initCompass = async () => {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          try {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res === 'granted') window.addEventListener('deviceorientation', handleOrientation);
          } catch (e) { alert("Permission required for compass"); }
        } else {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      };

      initCompass();
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [active]);

    return (
      <div className="glass-card animate-fade-in" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2 className="gold-gradient" style={{ marginBottom: '10px' }}>Digital Vastu Compass</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '30px' }}>Align your surroundings with cosmic energy directions.</p>
        
        <div style={{ position: 'relative', width: '280px', height: '280px', margin: '0 auto' }}>
          {/* Compass Rose */}
          <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--primary)', borderRadius: '50%', opacity: 0.1 }}></div>
          
          {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map((dir, i) => (
            <div key={dir} style={{ 
              position: 'absolute', 
              top: '-15px', 
              left: '50%', 
              height: '310px', 
              transform: `translateX(-50%) rotate(${i * 45}deg)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              fontWeight: '800',
              color: i % 2 === 0 ? 'var(--primary)' : 'var(--text-dim)'
            }}>{dir}</div>
          ))}

          {/* Rotating Needle (Our Logo) */}
          <motion.img 
            src={LogoImg} 
            alt="Compass Logo" 
            style={{ width: '200px', height: '200px', position: 'absolute', top: '40px', left: '40px', borderRadius: '50%', border: '4px solid var(--primary)', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}
            animate={{ rotate: -heading }}
            transition={{ type: 'spring', stiffness: 40, damping: 15 }}
          />
          
          {/* North Point */}
          <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '40px', background: '#ef4444', borderRadius: '2px', zIndex: 10 }}></div>
        </div>

        <div style={{ marginTop: '50px' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--text)' }}>{heading}°</div>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: '700' }}>Magnetic Heading</p>
          
          {!active && (
            <button className="btn-primary" onClick={() => setActive(true)} style={{ marginTop: '20px' }}>
              Activate Compass
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container" style={{ paddingBottom: '100px' }}>
      {/* Centered Navigation */}
      <nav className="nav-bar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '30px 0', border: 'none', background: 'transparent' }}>
        <motion.img 
          src={LogoImg} 
          alt="Vastu Aura Logo" 
          style={{ height: '110px', border: '2px solid var(--primary)', borderRadius: '24px', boxShadow: '0 15px 30px rgba(0,0,0,0.08)' }} 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        />
        <h2 className="gold-gradient" style={{ fontSize: '2.2rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: '800' }}>
          Vastu Aura
        </h2>
        <button 
           onClick={() => setView(view === 'admin' ? 'search' : 'admin')}
           style={{ position: 'absolute', right: '24px', top: '40px', opacity: 0.6 }}
         >
           <Settings size={22} color="var(--text-dim)" />
         </button>
      </nav>

      {/* Floating Bottom Tab Bar */}
      <div style={{ 
        position: 'fixed', 
        bottom: '25px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(20px)',
        padding: '6px',
        borderRadius: '35px',
        display: 'flex',
        gap: '6px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        zIndex: 1000,
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <button 
          onClick={() => setView('search')}
          style={{ padding: '12px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', background: view === 'search' || view === 'dashboard' ? 'var(--primary)' : 'transparent', color: view === 'search' || view === 'dashboard' ? 'white' : 'var(--text-dim)', transition: 'all 0.3s' }}
        >
          <Search size={20} /> <span style={{ fontWeight: '700' }}>Analyze</span>
        </button>
        <button 
          onClick={() => setView('compass')}
          style={{ padding: '12px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', background: view === 'compass' ? 'var(--primary)' : 'transparent', color: view === 'compass' ? 'white' : 'var(--text-dim)', transition: 'all 0.3s' }}
        >
          <CompassIcon size={20} /> <span style={{ fontWeight: '700' }}>Compass</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'compass' && (
           <motion.div key="compass" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} style={{ padding: '0 24px' }}>
             <VastuCompass />
           </motion.div>
        )}

        {view === 'search' && (
          <motion.div key="search" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ padding: '0 24px' }}>
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
              <h1 style={{ marginBottom: '12px', fontSize: '1.6rem' }}>Evaluate Home Harmony</h1>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginBottom: '35px', lineHeight: '1.5' }}>
                Instant Vastu assessment using architectural data and geographic alignment.
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
                  
                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ position: 'absolute', top: '60px', left: 0, right: 0, background: 'white', border: '1px solid var(--glass-border)', borderRadius: '12px', zIndex: 200, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' }}
                      >
                        {suggestions.map((sug, i) => (
                           <div 
                              key={i} 
                              onClick={() => { setAddress(sug); handleAnalyze(sug); }}
                              style={{ padding: '12px 15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', display: 'flex', gap: '10px', alignItems: 'center' }}
                              className="suggestion-item"
                           >
                             <Search size={14} color="#94a3b8" /> {sug}
                           </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">MLS URL (Zillow/Redfin)</label>
                <div style={{ position: 'relative' }}>
                  <input className="premium-input" placeholder="https://..." value={mlsUrl} onChange={(e) => setMlsUrl(e.target.value)} />
                  <Database size={18} color="var(--text-dim)" style={{ position: 'absolute', right: '15px', top: '15px' }} />
                </div>
              </div>

              <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ height: '60px', marginTop: '10px' }}>
                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }}><Settings size={22} /></motion.div> : <>Start Deep Analysis <ArrowRight size={20} /></>}
              </button>
            </div>
          </motion.div>
        )}

        {view === 'dashboard' && currentScore && (
          <motion.div key="dashboard" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ padding: '0 24px' }}>
            <ScoreGauge score={currentScore.score} />
            
            <div className="glass-card" style={{ marginBottom: '15px', textAlign: 'center' }}>
              <h3 className="gold-gradient">{currentScore.verdict} Harmony</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Property is {currentScore.score}% compliant with traditional Vastu Shastra.</p>
            </div>

            <div className="glass-card" style={{ padding: '15px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: '15px', textAlign: 'center' }}>
                     <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Facing</span>
                     <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)', marginTop: '5px' }}>{currentScore.facing}</div>
                  </div>
                  <div style={{ padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: '15px', textAlign: 'center' }}>
                     <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Main Entrance</span>
                     <div style={{ fontSize: '1rem', fontWeight: '800', marginTop: '5px' }}>{currentScore.breakdown[0].condition}</div>
                  </div>
               </div>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '25px', fontSize: '1.2rem', textAlign: 'center' }}>Vastu Compliance Radar</h3>
              {Object.entries(currentScore.categoryScores).map(([category, data], i) => (
                <div key={i} style={{ marginBottom: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--primary)' }}>{category} Area</span>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{Math.round(data.scoreTotal / data.count)}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(0,0,0,0.04)', borderRadius: '4px', marginBottom: '15px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${data.scoreTotal / data.count}%` }} style={{ height: '100%', background: 'var(--primary)' }} />
                  </div>
                  {data.items.map((item, idx) => (
                    <div key={idx} style={{ padding: '15px 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{item.name}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: item.isPositive ? '#10b981' : '#ef4444' }}>{item.isPositive ? '+' : ''}{item.points}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>{item.condition}: {item.recommendation}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="glass-card" style={{ marginBottom: '50px' }}>
              <button className="btn-primary">Connect with Vastu Expert</button>
              <button className="btn-secondary" style={{ marginTop: '12px' }} onClick={() => setView('search')}>New Analysis</button>
            </div>
          </motion.div>
        )}

        {view === 'admin' && (
          <motion.div key="admin" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '0 24px' }}>
            <div className="glass-card">
              <h3>Vastu Engine Weights</h3>
              {rules.map((rule, i) => (
                 <div key={i} style={{ marginBottom: '15px', padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '700' }}>{rule.name}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{rule.weight}%</span>
                 </div>
              ))}
              <button className="btn-primary" onClick={() => setView('search')} style={{ background: 'var(--text)' }}>Back to App</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VastuAura;
