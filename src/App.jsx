import React, { useState, useEffect, useMemo } from 'react';
import fuzosData from './data/fuzos_data.json';
import { 
  Sun, 
  Moon, 
  Search, 
  Play, 
  ExternalLink, 
  X, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award, 
  Sparkles, 
  Flame, 
  Video,
  Filter
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
  const [activeMode, setActiveMode] = useState('objectivement'); // 'objectivement' | 'gigantesque'
  const [channelFilter, setChannelFilter] = useState(null);
  const [yearFilter, setYearFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [displayCount, setDisplayCount] = useState(24);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fuzos_theme', theme);
  }, [theme]);

  // Reset filters when switching modes
  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setChannelFilter(null);
    setYearFilter(null);
    setSearchQuery('');
    setDisplayCount(24);
  };

  const currentDataset = fuzosData[activeMode] || fuzosData.objectivement;
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

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveVideoModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openPlayer = (occ) => {
    if (!occ || !occ.videoId) return;
    setActiveVideoModal(occ);
  };

  return (
    <div className="app-wrapper">
      {/* Navbar Header */}
      <header className="site-header">
        <div className="container header-inner">
          <a href="#" className="brand-title" onClick={(e) => { e.preventDefault(); handleModeChange(activeMode); }}>
            <span>fuzos</span>
            <span className="brand-dot">.</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>stats</span>
          </a>

          <div className="header-controls">
            {/* Mode Toggle */}
            <div className="mode-toggle-group">
              <button 
                className={`mode-btn ${activeMode === 'objectivement' ? 'active' : ''}`}
                onClick={() => handleModeChange('objectivement')}
              >
                objectivement
              </button>
              <button 
                className={`mode-btn ${activeMode === 'gigantesque' ? 'active' : ''}`}
                onClick={() => handleModeChange('gigantesque')}
              >
                gigantesque
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
              const isLatest = yr === '2024' || yr === '2026';
              return (
                <div 
                  key={yr} 
                  className={`metric-pill ${isSelected || (!yearFilter && isLatest) ? 'highlight' : ''}`}
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
            {displayedOccurrences.map((occ) => (
              <div 
                key={occ.id} 
                className="occ-card"
                onClick={() => openPlayer(occ)}
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

      </main>

      {/* Video Player Modal */}
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

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <p>Fuzos • Statistiques & Archives communautaires FuzeIII • Hébergé sur GitHub Pages</p>
        </div>
      </footer>
    </div>
  );
}
