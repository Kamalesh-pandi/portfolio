import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { seedDatabase } from './seed';
import profileImg from './assets/kamaleshpandi_profile.png';
import resumePdf from './assets/RESUME.pdf';
import './App.css';

// --- Particle Background Component ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.update();
        p.draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(99, 102, 241, ${1 - dist / 100})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
};

// --- Custom Cursor Component ---
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current && ringRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        ringRef.current.style.transform = `translate3d(${e.clientX - 15}px, ${e.clientY - 15}px, 0)`;
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      <div ref={cursorRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};

// --- Loader Component ---
const Loader = () => (
  <div className="loader-screen">
    <div className="loader-content">
      <h1 className="loader-initials">SK</h1>
      <div className="loader-bar-container">
        <div className="loader-bar" />
      </div>
      <p style={{ marginTop: '20px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>Loading dynamic content...</p>
    </div>
  </div>
);

// --- Modal Component ---
const Modal = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-header">
          <h2>{item.title}</h2>
          <p>{item.issuer ? `${item.issuer} • ${item.date}` : item.description}</p>
        </div>
        <div className="modal-body">
          <div className="image-gallery">
            {item.images?.map((img, idx) => (
              <img key={idx} src={img} alt={`Preview ${idx}`} className="modal-image" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState({
    profile: {},
    skills: [],
    experience: [],
    projects: [],
    awards: []
  });
  const observerRef = useRef(null);
  const carouselRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileSnap = await getDocs(query(collection(db, 'profile'), limit(1)));
        const skillsSnap = await getDocs(collection(db, 'skills'));
        const expSnap = await getDocs(collection(db, 'experience'));
        const projSnap = await getDocs(collection(db, 'projects'));
        const awardsSnap = await getDocs(collection(db, 'awards'));

        const fetchedData = {
          profile: profileSnap.docs[0]?.data() || {},
          skills: skillsSnap.docs.map(doc => doc.data()),
          experience: expSnap.docs.map(doc => doc.data()),
          projects: projSnap.docs.map(doc => doc.data()),
          awards: awardsSnap.docs.map(doc => doc.data())
        };

        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching from Firebase:", error);
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, { threshold: 0.1 });

      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach(el => observerRef.current.observe(el));

      return () => {
        if (observerRef.current) {
          reveals.forEach(el => observerRef.current.unobserve(el));
        }
      };
    }
  }, [loading]);

  if (loading) return <Loader />;

  const { profile, skills, experience, projects, awards } = data;

  return (
    <div className="portfolio-container">
      <div className="noise" />
      <ParticleBackground />
      <CustomCursor />
      
      <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">SK</div>
        <ul className="nav-links">
          <li><a href="#hero">About</a></li>
          <li><a href="#resume">Resume</a></li>
          <li><a href="#projects">Work</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#awards">Awards</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <button
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
        <ul className="mobile-nav-links">
          <li><a href="#hero" onClick={closeMenu}>About</a></li>
          <li><a href="#resume" onClick={closeMenu}>Resume</a></li>
          <li><a href="#projects" onClick={closeMenu}>Work</a></li>
          <li><a href="#skills" onClick={closeMenu}>Skills</a></li>
          <li><a href="#awards" onClick={closeMenu}>Awards</a></li>
          <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
        </ul>
      </div>

      {/* 1. Introduction / About Me */}
      <section id="hero" className="hero-section">
        <div className="container">
          <div className="hero-content reveal">
            <span className="hero-tag">{profile.role}</span>
            <h1 className="hero-name">
              S Kamalesh<br />
              <span className="gradient-text">pandi</span>
            </h1>
            <p className="hero-subtitle bio-text">
              {profile.about}
            </p>
            <div className="hero-ctas">
              <a href="#projects" className="btn btn-primary">See My Work</a>
              <a href={resumePdf} download="S_Kamaleshpandi_Resume.pdf" className="btn btn-outline">Download CV</a>
            </div>
          </div>

          <div className="hero-visual reveal">
            <div className="floating-card">
              <div className="card-avatar">
                <img src={profile.imageUrl || profileImg} alt="S Kamaleshpandi" className="avatar-img-hero" />
              </div>
              <div className="card-info">
                <h3>{profile.role}</h3>
                <p style={{ fontSize: '0.75rem', marginTop: '5px', color: 'var(--text-dim)' }}>
                  {profile.about}
                </p>
              </div>
              <div className="card-stats">
                <div className="stat">
                  <span className="stat-val">{profile.projectsBuilt}</span>
                  <span className="stat-label">Projects</span>
                </div>
                <div className="stat">
                  <span className="stat-val">{profile.yearsExp}</span>
                  <span className="stat-label">Experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Resume / CV Summary */}
      <section id="resume" className="experience-section">
        <div className="container">
          <h2 className="section-title reveal">Resume Summary</h2>
          <div className="resume-grid">
            <div className="timeline-col">
              <h3 className="sub-header reveal">Experience & Education</h3>
              <div className="timeline">
                {experience.map((item, idx) => (
                  <div key={idx} className="timeline-item reveal">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <span className="timeline-date">{item.date}</span>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="resume-cta-box reveal">
              <h3>Interested in the full story?</h3>
              <p>Download my complete CV for a detailed breakdown of my background.</p>
              <a href={resumePdf} download="S_Kamaleshpandi_Resume.pdf" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Download PDF CV</a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Work Samples / Case Studies */}
      <section id="projects" className="projects-section">
        <div className="container">
          <h2 className="section-title reveal">Featured Projects</h2>
          <div className="projects-grid">
            {projects.map((proj, idx) => (
              <div key={idx} className="project-card reveal">
                <div className="project-image">{proj.emoji}</div>
                <div className="project-info">
                  <h3>{proj.title}</h3>
                  <p>{proj.description}</p>
                  <div className="project-tags">
                    {proj.tags?.map((tag, tIdx) => (
                      <span key={tIdx}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="project-actions">
                  {proj.images?.length > 0 && (
                    <button
                      className="proj-btn proj-btn-demo"
                      onClick={() => setSelectedItem(proj)}
                      title="View UI screenshots"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
                      Demo
                    </button>
                  )}
                  {proj.github && (
                    <a
                      href={proj.github}
                      target="_blank"
                      rel="noreferrer"
                      className="proj-btn proj-btn-github"
                      title="View on GitHub"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.625-5.48 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
                      GitHub
                    </a>
                  )}
                </div>
                <div className="sweep-overlay"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Skills List */}
      <section id="skills" className="skills-section">
        <div className="container">
          <h2 className="section-title reveal">Core Competencies</h2>
          <div className="skills-grid-new">
            {skills.map((skill, idx) => (
              <div key={idx} className="skill-item-new reveal">
                <div className="skill-icon-wrapper">
                  <img src={skill.icon} alt={skill.name} className="skill-icon" />
                </div>
                <span className="skill-name">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Awards and Recognition */}
      <section id="awards" className="awards-section">
        <div className="container">
          <h2 className="section-title reveal">Recognition & Certs</h2>
          <div className="carousel-wrapper reveal">
            <button className="carousel-btn prev" onClick={() => scroll('left')} aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            
            <div className="awards-carousel" ref={carouselRef}>
              {awards.map((award, idx) => (
                <div key={idx} className="award-card-new" onClick={() => setSelectedItem(award)}>
                  <div className="award-image-container">
                    {award.images && award.images[0] ? (
                      <img src={award.images[0]} alt={award.title} className="award-img-thumb" />
                    ) : (
                      <div className="award-placeholder">🏆</div>
                    )}
                  </div>
                  <div className="award-content-new">
                    <span className="award-date-new">{award.date}</span>
                    <h3>{award.title}</h3>
                    <p>{award.issuer}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="carousel-btn next" onClick={() => scroll('right')} aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* 6. Contact Information */}
      <section id="contact" className="contact-section">
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="contact-card reveal">

            {/* Avatar + Status */}
            <div className="contact-top">
              <div className="ripple-avatar">
                <div className="ripple"></div>
                <div className="avatar-img">
                  <img src={profile.imageUrl || profileImg} alt="S Kamaleshpandi" className="avatar-img-contact" />
                </div>
              </div>
              
            </div>

            {/* Heading */}
            <h2 className="contact-heading">Let's Build Something <span className="gradient-text">Amazing</span></h2>
            <p className="contact-sub">Open to full-time roles, freelance projects, and exciting collaborations.</p>

            {/* Contact Info Rows */}
            <div className="contact-info-rows">
              <a href={`mailto:${profile.email}`} className="contact-info-row">
                <span className="contact-info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <span>{profile.email}</span>
              </a>
              <a href={`tel:${profile.phone}`} className="contact-info-row">
                <span className="contact-info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.41 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </span>
                <span>{profile.phone}</span>
              </a>
            </div>

            {/* Divider */}
            <div className="contact-divider"></div>

            {/* Social Buttons */}
            <div className="contact-socials">
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="social-btn social-linkedin">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer" className="social-btn social-github">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.625-5.48 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
            </div>

          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2026 {profile.name}. Designed with Excellence.</p>
        {import.meta.env.DEV && (
          <button 
            onClick={async () => {
              if(confirm("Seed initial data to Firestore?")) {
                await seedDatabase();
                window.location.reload();
              }
            }}
            style={{ marginTop: '20px', opacity: 0.3, fontSize: '0.6rem', cursor: 'pointer', background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-dim)', padding: '5px 10px', borderRadius: '5px' }}
          >
            Seed Initial Data
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;
