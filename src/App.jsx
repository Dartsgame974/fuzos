import React, { useState, useEffect, useMemo, useCallback } from 'react';
import fuzosData from './data/fuzos_data.json';
import { 
  Sun, 
  Moon, 
  Search, 
  Play, 
  ExternalLink, 
  X, 
  Calendar, 
  Clock, 
  Award, 
  Sparkles, 
  Video,
  Tv,
  ChevronRight,
  ChevronLeft,
  Shuffle,
  Construction,
  RotateCcw
} from 'lucide-react';

const CHANNEL_CONFIG = {
  'FuzeIII': { bg: 'var(--channel-fuze3-bg)', color: 'var(--channel-fuze3-text)', avatar: './assets/avatars/FuzeIII.jpg' },
  'Fuze III': { bg: 'var(--channel-fuze3-bg)', color: 'var(--channel-fuze3-text)', avatar: './assets/avatars/FuzeIII.jpg' },
  'Fuzay²': { bg: 'var(--channel-fuzay-bg)', color: 'var(--channel-fuzay-text)', avatar: './assets/avatars/FuzayAuCarre.jpg' },
  'Fiouze': { bg: 'var(--channel-fiouze-bg)', color: 'var(--channel-fiouze-text)', avatar: './assets/avatars/Fiouze.jpg' },
  'Fuze Clips': { bg: 'var(--channel-clips-bg)', color: 'var(--channel-clips-text)', avatar: './assets/avatars/FuzeClips.jpg' },
  'Clips Fuze': { bg: 'var(--channel-clips-bg)', color: 'var(--channel-clips-text)', avatar: './assets/avatars/FuzeClips.jpg' },
  'Fuze Plays': { bg: 'var(--channel-plays-bg)', color: 'var(--channel-plays-text)', avatar: './assets/avatars/Autre.jpg' },
  'Aywen': { bg: 'var(--channel-aywen-bg)', color: 'var(--channel-aywen-text)', avatar: './assets/avatars/Autre.jpg' },
  'Sans Permission': { bg: 'var(--channel-sansperm-bg)', color: 'var(--channel-sansperm-text)', avatar: './assets/avatars/Autre.jpg' },
  'Autre': { bg: 'var(--channel-fuze3-bg)', color: 'var(--channel-fuze3-text)', avatar: './assets/avatars/Autre.jpg' }
};

function formatTimestamp(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return 'Date inconnue';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fuzos_theme') || 'light';
  });
  
  // Gigantesque is default
  const [activeMode, setActiveMode] = useState('gigantesque'); // 'gigantesque' | 'objectivement'
  const [channelFilter, setChannelFilter] = useState(null);
  const [yearFilter, setYearFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [displayCount, setDisplayCount] = useState(24);
  
  // Zapper State
  const [isZapperOpen, setIsZapperOpen] = useState(false);
  const [zapperIndex, setZapperIndex] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fuzos_theme', theme);
  }, [theme]);

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setChannelFilter(null);
    setYearFilter(null);
    setSearchQuery('');
    setDisplayCount(24);
  };

  const currentDataset = fuzosData[activeMode] || fuzosData.gigantesque;
  const isGigantesque = activeMode === 'gigantesque';
  const derivWord = isGigantesque ? 'Gigantitude' : 'Objectivité';
  const singleWord = isGigantesque ? 'gigantesque' : 'objectivement';

  // Filter occurrences
  const filteredOccurrences = useMemo(() => {
    let list = currentDataset.occurrences || [];
    if (channelFilter) {
      list = list.filter(o => o.channel.trim() === channelFilter.trim());
    }
    if (yearFilter) {
      list = list.filter(o => o.date && o.date.startsWith(yearFilter));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(o => 
        (o.title && o.title.toLowerCase().includes(q)) ||
        (o.sentence && o.sentence.toLowerCase().includes(q)) ||
        (o.channel && o.channel.toLowerCase().includes(q)) ||
        (o.date && o.date.includes(q))
      );
    }
    return list;
  }, [currentDataset, channelFilter, yearFilter, searchQuery]);

  const displayedOccurrences = filteredOccurrences.slice(0, displayCount);

  // Zapper Navigation Handlers
  const currentZapperClip = useMemo(() => {
    const list = currentDataset.occurrences || [];
    if (!list.length) return null;
    return list[zapperIndex % list.length];
  }, [currentDataset, zapperIndex]);

  const handleZapperNext = useCallback(() => {
    const list = currentDataset.occurrences || [];
    if (!list.length) return;
    setZapperIndex(prev => (prev + 1) % list.length);
  }, [currentDataset]);

  const handleZapperPrev = useCallback(() => {
    const list = currentDataset.occurrences || [];
    if (!list.length) return;
    setZapperIndex(prev => (prev - 1 + list.length) % list.length);
  }, [currentDataset]);

  const handleZapperRandom = useCallback(() => {
    const list = currentDataset.occurrences || [];
    if (!list.length) return;
    const randIdx = Math.floor(Math.random() * list.length);
    setZapperIndex(randIdx);
  }, [currentDataset]);

  // Keyboard Shortcuts (Arrow keys for zapper, Escape for modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveVideoModal(null);
        setIsZapperOpen(false);
      }
      if (isZapperOpen) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleZapperNext();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleZapperPrev();
        } else if (e.key === ' ') {
          e.preventDefault();
          handleZapperRandom();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZapperOpen, handleZapperNext, handleZapperPrev, handleZapperRandom]);

  const openPlayer = (occ) => {
    if (!occ || !occ.videoId) return;
    setActiveVideoModal(occ);
  };

  const startZapper = (initialIndex = 0) => {
    setZapperIndex(initialIndex);
    setIsZapperOpen(true);
  };

  return (
    <div className="app-wrapper">
      {/* Navbar Header */}
      <header className="site-header">
        <div className="container header-inner">
          <a href="#" className="brand-title" onClick={(e) => { e.preventDefault(); handleModeChange('gigantesque'); }}>
            <span>fuzos</span>
            <span className="brand-dot">.</span>
            <span className="brand-badge">stats</span>
          </a>

          <div className="header-controls">
            {/* Zapper Button */}
            <button 
              className="zapper-header-btn" 
              onClick={() => startZapper(0)}
              title="Lancer le zappeur automatique des répliques"
            >
              <Tv size={16} />
              <span>Zappeur</span>
            </button>

            {/* Mode Switch Tabs (Gigantesque First) */}
            <div className="mode-toggle-group">
              <button 
                className={`mode-btn ${activeMode === 'gigantesque' ? 'active' : ''}`}
                onClick={() => handleModeChange('gigantesque')}
              >
                gigantesque
              </button>
              <button 
                className={`mode-btn ${activeMode === 'objectivement' ? 'active' : ''}`}
                onClick={() => handleModeChange('objectivement')}
              >
                objectivement
                <span className="mode-badge-wip">Bientôt</span>
              </button>
            </div>

            {/* Theme Toggle */}
            <button 
              className="theme-toggle-btn"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="hero-section">
        <div className="container hero-content">
          <img 
            src="./assets/fuze_hero.png" 
            alt="Fuze" 
            className="hero-fuze-img" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="hero-title-wrap">
            <h1 className="hero-main-title">
              {singleWord}
              <span className="dot">.</span>
            </h1>
            <div className="hero-subtitle-tag">
              <Sparkles size={16} />
              <span>Tableau de bord statistique officiel des mots de FuzeIII</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Dashboard */}
      <main className="container stats-grid-section">
        
        {/* If Objectivement is selected, show an in-construction informative view */}
        {activeMode === 'objectivement' ? (
          <div className="wip-banner">
            <Construction size={48} color="#f59e0b" />
            <h2 className="wip-title">Module « Objectivement » en cours de reconstruction</h2>
            <p className="wip-desc">
              Le module d'analyse historique pour « Objectivement » est en train d'être réaligné avec la nouvelle base haute précision.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button 
                className="zapper-action-btn primary"
                onClick={() => handleModeChange('gigantesque')}
              >
                Basculer sur Gigantitude (2 752 clips)
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Row: Hero Counter Card + Channels Pills */}
            <div className="top-stats-row">
              <div className="hero-counter-card">
                <span className="hero-counter-badge">Total d'occurrences</span>
                <div className="hero-counter-number">{currentDataset.total}</div>
                <div className="hero-counter-label">{singleWord}</div>
              </div>

              <div className="channels-grid">
                {Object.entries(currentDataset.channels || {}).map(([chName, count]) => {
                  const conf = CHANNEL_CONFIG[chName] || CHANNEL_CONFIG['Autre'];
                  const isSelected = channelFilter === chName;
                  return (
                    <div 
                      key={chName}
                      className={`channel-card ${isSelected ? 'active-filter' : ''}`}
                      style={{ backgroundColor: conf.bg, color: conf.color }}
                      onClick={() => setChannelFilter(isSelected ? null : chName)}
                      title={`Filtrer par ${chName}`}
                    >
                      <img 
                        src={conf.avatar} 
                        alt={chName} 
                        className="channel-avatar" 
                        onError={(e) => { e.target.src = './assets/avatars/Autre.jpg'; }}
                      />
                      <div className="channel-info">
                        <span className="channel-name">{chName}</span>
                        <span className="channel-count">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Years Metrics Row */}
            <div>
              <div className="records-section-title">
                <Calendar size={18} />
                <span>Évolution par Année ({derivWord})</span>
                {yearFilter && (
                  <button 
                    style={{ 
                      marginLeft: 'auto', 
                      fontSize: '0.8rem', 
                      border: 'none', 
                      background: 'var(--bg-card)', 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      color: 'var(--text-muted)'
                    }}
                    onClick={() => setYearFilter(null)}
                  >
                    Effacer le filtre ({yearFilter})
                  </button>
                )}
              </div>
              <div className="metrics-pills-row">
                {Object.entries(currentDataset.years || {}).map(([yr, count]) => {
                  const isSelected = yearFilter === yr;
                  return (
                    <div 
                      key={yr} 
                      className={`metric-pill ${isSelected ? 'highlight' : ''}`}
                      onClick={() => setYearFilter(isSelected ? null : yr)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="metric-label">{derivWord} de {yr}</span>
                      <span className="metric-value">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Periodic Stats Pills */}
            <div className="metrics-pills-row">
              <div className="metric-pill">
                <span className="metric-label">Vidéos Uniques</span>
                <span className="metric-value">{currentDataset.uniqueVideos}</span>
              </div>
              <div className="metric-pill">
                <span className="metric-label">Moyenne par Vidéo</span>
                <span className="metric-value">{currentDataset.avgPerVideo}</span>
              </div>
              <div className="metric-pill">
                <span className="metric-label">Mois Record</span>
                <span className="metric-value" style={{ fontSize: '1.4rem' }}>
                  {currentDataset.bestMonth?.month || 'N/A'} ({currentDataset.bestMonth?.count || 0})
                </span>
              </div>
              <div className="metric-pill">
                <span className="metric-label">Total Analysé</span>
                <span className="metric-value">{currentDataset.total}</span>
              </div>
            </div>

            {/* Highlight Records Cards */}
            <div>
              <div className="records-section-title">
                <Award size={18} />
                <span>Records & Faits Marquants</span>
              </div>

              <div className="records-grid">
                {/* Record 1: Le plus rapide */}
                {currentDataset.records?.fastest && (
                  <div 
                    className="record-card color-default"
                    onClick={() => openPlayer(currentDataset.records.fastest)}
                  >
                    <div className="record-card-top">
                      <span className="record-card-label">La {derivWord.toLowerCase()} la plus rapide</span>
                      <span className="record-card-val">{formatTimestamp(currentDataset.records.fastest.start)}</span>
                    </div>
                    <div className="record-card-thumb-wrap">
                      <img src={currentDataset.records.fastest.thumbnail} alt="Record" className="record-card-thumb" />
                      <div className="record-play-overlay"><Play size={26} /></div>
                    </div>
                  </div>
                )}

                {/* Record 2: Le tout premier */}
                {currentDataset.records?.earliest && (
                  <div 
                    className="record-card color-brown"
                    onClick={() => openPlayer(currentDataset.records.earliest)}
                  >
                    <div className="record-card-top">
                      <span className="record-card-label">Le tout premier {singleWord}</span>
                      <span className="record-card-val">{formatDate(currentDataset.records.earliest.date)}</span>
                    </div>
                    <div className="record-card-thumb-wrap">
                      <img src={currentDataset.records.earliest.thumbnail} alt="Record" className="record-card-thumb" />
                      <div className="record-play-overlay"><Play size={26} /></div>
                    </div>
                  </div>
                )}

                {/* Record 3: La vidéo avec le plus */}
                {currentDataset.records?.topVideo && (
                  <div 
                    className="record-card color-green"
                    onClick={() => openPlayer({
                      videoId: currentDataset.records.topVideo.videoId,
                      start: currentDataset.records.topVideo.occurrences?.[0]?.start || 0,
                      title: currentDataset.records.topVideo.title,
                      channel: currentDataset.records.topVideo.channel,
                      date: currentDataset.records.topVideo.date
                    })}
                  >
                    <div className="record-card-top">
                      <span className="record-card-label">La vidéo avec le plus de {derivWord.toLowerCase()}</span>
                      <span className="record-card-val">{currentDataset.records.topVideo.count} fois</span>
                    </div>
                    <div className="record-card-thumb-wrap">
                      <img src={currentDataset.records.topVideo.thumbnail} alt="Record" className="record-card-thumb" />
                      <div className="record-play-overlay"><Play size={26} /></div>
                    </div>
                  </div>
                )}

                {/* Record 4: La vidéo avec le moins */}
                {currentDataset.records?.leastVideo && (
                  <div 
                    className="record-card color-red"
                    onClick={() => openPlayer({
                      videoId: currentDataset.records.leastVideo.videoId,
                      start: currentDataset.records.leastVideo.occurrences?.[0]?.start || 0,
                      title: currentDataset.records.leastVideo.title,
                      channel: currentDataset.records.leastVideo.channel,
                      date: currentDataset.records.leastVideo.date
                    })}
                  >
                    <div className="record-card-top">
                      <span className="record-card-label">La vidéo avec le moins de {derivWord.toLowerCase()}</span>
                      <span className="record-card-val">{currentDataset.records.leastVideo.count} fois</span>
                    </div>
                    <div className="record-card-thumb-wrap">
                      <img src={currentDataset.records.leastVideo.thumbnail} alt="Record" className="record-card-thumb" />
                      <div className="record-play-overlay"><Play size={26} /></div>
                    </div>
                  </div>
                )}

                {/* Record 5: Le plus récent / frais */}
                {currentDataset.records?.latest && (
                  <div 
                    className="record-card color-sky"
                    onClick={() => openPlayer(currentDataset.records.latest)}
                  >
                    <div className="record-card-top">
                      <span className="record-card-label">Le {singleWord} le plus frais</span>
                      <span className="record-card-val">{formatDate(currentDataset.records.latest.date)}</span>
                    </div>
                    <div className="record-card-thumb-wrap">
                      <img src={currentDataset.records.latest.thumbnail} alt="Record" className="record-card-thumb" />
                      <div className="record-play-overlay"><Play size={26} /></div>
                    </div>
                  </div>
                )}

                {/* Record 6: Record en 1min */}
                {currentDataset.records?.record1Min && (
                  <div 
                    className="record-card color-default"
                    onClick={() => openPlayer({
                      videoId: currentDataset.records.record1Min.video?.videoId,
                      start: currentDataset.records.record1Min.start,
                      title: currentDataset.records.record1Min.video?.title,
                      channel: currentDataset.records.record1Min.video?.channel,
                      date: currentDataset.records.record1Min.video?.date
                    })}
                  >
                    <div className="record-card-top">
                      <span className="record-card-label">Record de {derivWord.toLowerCase()} en 1min</span>
                      <span className="record-card-val">{currentDataset.records.record1Min.count} fois</span>
                    </div>
                    <div className="record-card-thumb-wrap">
                      <img src={currentDataset.records.record1Min.video?.thumbnail} alt="Record" className="record-card-thumb" />
                      <div className="record-play-overlay"><Play size={26} /></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Occurrences Explorer Section */}
            <section className="explorer-section">
              <div className="explorer-header">
                <div className="records-section-title" style={{ margin: 0 }}>
                  <Video size={18} />
                  <span>Explorateur des Occurrences ({filteredOccurrences.length} résultats)</span>
                </div>

                <div className="search-box-wrap">
                  <Search size={18} color="var(--text-muted)" />
                  <input 
                    type="text" 
                    className="search-input"
                    placeholder={`Rechercher une vidéo, phrase, date...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Occurrences Cards Grid */}
              <div className="occurrences-grid">
                {displayedOccurrences.map((occ, idx) => (
                  <div 
                    key={occ.id} 
                    className="occ-card"
                    onClick={() => startZapper(idx)}
                  >
                    <div className="occ-thumb-wrap">
                      <img src={occ.thumbnail} alt={occ.title} className="occ-thumb" loading="lazy" />
                      <span className="occ-time-badge">{formatTimestamp(occ.start)}</span>
                    </div>
                    <div className="occ-body">
                      <h4 className="occ-title">{occ.title}</h4>
                      {occ.sentence && (
                        <p className="occ-sentence">« {occ.sentence} »</p>
                      )}
                      <div className="occ-meta">
                        <span>{occ.channel}</span>
                        <span>{formatDate(occ.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {displayCount < filteredOccurrences.length && (
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button 
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-card)',
                      padding: '12px 28px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setDisplayCount(prev => prev + 24)}
                  >
                    Charger plus de vidéos ({filteredOccurrences.length - displayCount} restantes)
                  </button>
                </div>
              )}
            </section>
          </>
        )}

      </main>

      {/* Standard Video Player Modal */}
      {activeVideoModal && (
        <div className="modal-backdrop" onClick={() => setActiveVideoModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title-text">{activeVideoModal.title}</span>
              <button className="modal-close-btn" onClick={() => setActiveVideoModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-player-wrap">
              <iframe
                key={`${activeVideoModal.videoId}_${Math.floor(activeVideoModal.start)}`}
                src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.videoId}?start=${Math.floor(activeVideoModal.start)}&autoplay=1&rel=0`}
                title={activeVideoModal.title}
                className="modal-player-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="modal-footer">
              <div>
                <strong>{activeVideoModal.channel}</strong> • {formatDate(activeVideoModal.date)} • Timestamp: {formatTimestamp(activeVideoModal.start)}
              </div>
              <a 
                href={`https://www.youtube.com/watch?v=${activeVideoModal.videoId}&t=${Math.floor(activeVideoModal.start)}s`} 
                target="_blank" 
                rel="noreferrer"
                className="modal-external-link"
              >
                <span>Ouvrir sur YouTube</span>
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Zapper Modal (Suivant, Précédent, Aléatoire) */}
      {isZapperOpen && currentZapperClip && (
        <div className="modal-backdrop" onClick={() => setIsZapperOpen(false)}>
          <div className="zapper-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="zapper-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Tv size={18} color="#ef4444" />
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                  Zappeur Gigantitude • Clip #{zapperIndex + 1} / {currentDataset.occurrences?.length}
                </span>
              </div>
              <button className="modal-close-btn" style={{ color: '#fff' }} onClick={() => setIsZapperOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-player-wrap">
              <iframe
                key={`${currentZapperClip.videoId}_${Math.floor(currentZapperClip.start)}`}
                src={`https://www.youtube-nocookie.com/embed/${currentZapperClip.videoId}?start=${Math.floor(currentZapperClip.start)}&autoplay=1&rel=0`}
                title={currentZapperClip.title}
                className="modal-player-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="zapper-controls-bar">
              <div style={{ maxWidth: '400px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentZapperClip.title}
                </div>
                {currentZapperClip.sentence && (
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af', fontStyle: 'italic', marginTop: '2px' }}>
                    « {currentZapperClip.sentence} »
                  </div>
                )}
              </div>

              <div className="zapper-btn-group">
                <button className="zapper-action-btn" onClick={handleZapperPrev} title="Clip précédent (Flèche gauche)">
                  <ChevronLeft size={18} />
                  <span>Précédent</span>
                </button>

                <button className="zapper-action-btn" onClick={handleZapperRandom} title="Zap aléatoire (Barre Espace)">
                  <Shuffle size={16} />
                  <span>Aléatoire</span>
                </button>

                <button className="zapper-action-btn primary" onClick={handleZapperNext} title="Clip suivant (Flèche droite)">
                  <span>Suivant</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <p>Fuzos • Statistiques & Archives communautaires FuzeIII • Hébergé sur GitHub Pages</p>
        </div>
      </footer>
    </div>
  );
}
