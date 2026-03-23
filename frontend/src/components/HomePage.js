import React, { useState, useEffect } from "react";
import "./HomePage.css";

const heroImages = ["/hero1.jpg", "/hero2.jpg", "/hero3.jpg", "/hero4.jpg", "/hero5.jpg"];

const facilities = [
  { 
    img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop", 
    title: "Smart Classrooms", 
    desc: "Digital classrooms equipped with advanced interactive learning technology and ergonomic seating." 
  },
  { 
    img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop", 
    title: "Modern Labs", 
    desc: "World-class Science and Computer labs designed for practical excellence and research." 
  },
  { 
    img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop", 
    title: "Sports Complex", 
    desc: "Professional-grade courts and indoor facilities to nurture athletic talent and physical growth." 
  },
  { 
    img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop", 
    title: "Secure Campus", 
    desc: "A home-like environment and safe transport fleet monitored by 24/7 security." 
  }
];

const countersData = [
  { label: "years of Golden Memories 🏆", value: 37 },
  { label: "Future Leaders 🚀", value: 950 },
  { label: "Inspiring Mentors ✨", value: 52 },
  { label: "Gold Medals 🥇", value: 68 }
];

export default function HomePage({ onAdmin }) {
  const [slide, setSlide] = useState(0);
  const [counters, setCounters] = useState(countersData.map(() => 0));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const phoneNumber = "9642572506";

  useEffect(() => {
    const interval = setInterval(() => setSlide(s => (s + 1) % heroImages.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll(".stat-number").forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50 && counters[idx] === 0) {
          let start = 0;
          const end = countersData[idx].value;
          const timer = setInterval(() => {
            start += Math.ceil(end / 40);
            if (start >= end) {
              setCounters(p => { const n = [...p]; n[idx] = end; return n; });
              clearInterval(timer);
            } else {
              setCounters(p => { const n = [...p]; n[idx] = start; return n; });
            }
          }, 30);
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [counters]);

  return (
    <div className="home-container">
      {/* --- BRANDED NAVBAR --- */}
      <nav className="main-nav">
        <div className="nav-wrap">
          <div className="nav-brand-lockup">
            <img src="/logo.png" alt="Adarsha Logo" className="nav-logo" />
            <div className="brand-divider"></div>
            <div className="brand-text-group">
              <span className="brand-name-main">ADARSHA</span>
              <span className="brand-name-sub">HIGH SCHOOL</span>
            </div>
          </div>

          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className={`hamburger ${isMenuOpen ? "open" : ""}`}></span>
          </button>

          <div className={`nav-menu ${isMenuOpen ? "mobile-open" : ""}`}>
            <a href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>Our Story</a>
            <a href="#facilities" className="nav-link" onClick={() => setIsMenuOpen(false)}>Campus</a>
            <button className="btn-admin-branded" onClick={() => { onAdmin(); setIsMenuOpen(false); }}>
              <span className="btn-icon">🔒</span> Portal Login
            </button>
          </div>
        </div>
      </nav>

      {/* --- BRANDED HERO --- */}
      <section className="hero-section">
        <div className="hero-slider">
          {heroImages.map((img, idx) => (
            <div 
              key={idx} 
              className={`slide ${idx === slide ? "active" : ""}`}
              style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.75)), url(${img})` }}
            >
              <div className="hero-overlay-content">
                <div className="est-pill">SINCE 1989</div>
                <h1 className="hero-brand-title">
                   <span className="brand-accent">ADARSHA</span> <br/>
                   HIGH SCHOOL
                </h1>
                <p className="hero-motto">"Knowledge is Power, Character is Fate."</p>
                <div className="hero-btns">
                  <a href={`https://wa.me/91${phoneNumber}`} className="btn-brand-cta">Start Admission 2026</a>
                  <a href="#facilities" className="btn-brand-outline">The Adarsha Advantage</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="stats-dashboard">
        <div className="stats-grid">
          {countersData.map((stat, i) => (
            <div className="stat-item" key={i}>
              <div className="stat-number">{counters[i]}+</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FACILITIES --- */}
      <section id="facilities" className="fac-section">
        <div className="sec-heading">
          <h3 className="branded-subtitle">ADARSHA INFRASTRUCTURE</h3>
          <h2 className="branded-maintitle">World Class Campus</h2>
        </div>
        <div className="fac-grid">
          {facilities.map((f, i) => (
            <div className="fac-card-new" key={i}>
              <div className="fac-img-header">
                <img src={f.img} alt={f.title} />
              </div>
              <div className="fac-card-content">
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHATSAPP FLOAT */}
      <a href={`https://wa.me/91${phoneNumber}`} className="wa-float-branded" target="_blank" rel="noreferrer">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" />
        <div className="wa-text">
            <span>Admissions Help</span>
            <strong>96425 72506</strong>
        </div>
      </a>

      {/* --- BRANDED FOOTER --- */}
      <footer className="footer-branded">
        <div className="footer-grid">
          <div className="footer-brand-identity">
            <div className="footer-logo-wrap">
                <img src="/logo.png" alt="Adarsha Logo" />
                <h2>ADARSHA</h2>
            </div>
            <p className="footer-desc">
                A legacy of 37 years in nurturing the leaders of tomorrow. 
                Rooted in tradition, powered by modern technology.
            </p>
          </div>
          <div className="footer-contact-info">
            <h5>Get In Touch</h5>
            <div className="contact-line">📍 Kamalapuram, Mangapet(M), Mulug Dist. 506172</div>
            <div className="contact-line">📞 +91 {phoneNumber}</div>
            <div className="contact-line">📧 admissions@adarshaschool.edu</div>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <p>&copy; {new Date().getFullYear()} Adarsha High School. Established 1989.</p>
        </div>
      </footer>
    </div>
  );
}
