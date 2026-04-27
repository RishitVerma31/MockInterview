import React from 'react';
import ScrollReveal from '../components/ScrollReveal';
import ParticleField from '../components/ParticleField';

export default function AnimationShowcase() {
  return (
    <div style={{ minHeight: '100vh', padding: '80px 24px', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Hero Section */}
        <ScrollReveal direction="scale">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h1 className="gradient-text" style={{ fontSize: 56, fontWeight: 900, marginBottom: 16, animation: 'textGlow 3s ease-in-out infinite' }}>
              Animation Showcase
            </h1>
            <p style={{ fontSize: 18, color: 'var(--text2)' }}>
              Explore all the stunning animations and effects
            </p>
          </div>
        </ScrollReveal>

        {/* 3D Cards Section */}
        <ScrollReveal direction="up" delay={0.1}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#fff' }}>
            3D Card Effects
          </h2>
        </ScrollReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 80 }}>
          {[
            { title: 'Extreme 3D', class: 'card-3d-extreme', color: '#7c6af7' },
            { title: 'Glass Effect', class: 'glass-intense', color: '#22d3ee' },
            { title: 'Neon Border', class: 'neon-border', color: '#f472b6' },
          ].map((card, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 0.1}>
              <div className={card.class} style={{
                padding: 32,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: `${card.color}20`,
                  border: `2px solid ${card.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}>
                  ✨
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>{card.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', textAlign: 'center' }}>
                  Hover to see the effect
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Hover Effects */}
        <ScrollReveal direction="up">
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#fff' }}>
            Hover Effects
          </h2>
        </ScrollReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 80 }}>
          {[
            { label: 'Scale', class: 'hover-scale' },
            { label: 'Rotate', class: 'hover-rotate' },
            { label: 'Lift', class: 'hover-lift' },
            { label: 'Glow', class: 'hover-glow-intense' },
          ].map((btn, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 0.05}>
              <button className={btn.class} style={{
                padding: '16px 24px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #7c6af7, #5b4fd4)',
                border: 'none',
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                {btn.label}
              </button>
            </ScrollReveal>
          ))}
        </div>

        {/* Animation Variants */}
        <ScrollReveal direction="up">
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#fff' }}>
            Floating Animations
          </h2>
        </ScrollReveal>

        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 80, flexWrap: 'wrap' }}>
          {[
            { label: 'Slow', class: 'float-slow' },
            { label: 'Medium', class: 'float-medium' },
            { label: 'Fast', class: 'float-fast' },
          ].map((item, i) => (
            <ScrollReveal key={i} direction="scale" delay={i * 0.1}>
              <div className={item.class} style={{
                width: 120,
                height: 120,
                borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(124,106,247,0.2), rgba(34,211,238,0.1))',
                border: '1px solid rgba(124,106,247,0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
                <div style={{ fontSize: 32 }}>🎈</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>{item.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Glow Effects */}
        <ScrollReveal direction="up">
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#fff' }}>
            Glow Effects
          </h2>
        </ScrollReveal>

        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 80, flexWrap: 'wrap' }}>
          {[
            { label: 'Purple', class: 'glow-purple', emoji: '💜' },
            { label: 'Cyan', class: 'glow-cyan', emoji: '💙' },
            { label: 'Pink', class: 'glow-pink', emoji: '💗' },
          ].map((item, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 0.1}>
              <div className={item.class} style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}>
                <div style={{ fontSize: 32 }}>{item.emoji}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>{item.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Particle Field Demo */}
        <ScrollReveal direction="up">
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#fff' }}>
            Particle Field
          </h2>
        </ScrollReveal>

        <ScrollReveal direction="scale" delay={0.2}>
          <div style={{
            position: 'relative',
            height: 300,
            borderRadius: 24,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 80,
          }}>
            <ParticleField count={30} color="124,106,247" />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                Interactive Particles
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text2)' }}>
                Move your mouse to interact
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Text Effects */}
        <ScrollReveal direction="up">
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#fff' }}>
            Text Effects
          </h2>
        </ScrollReveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 80 }}>
          <ScrollReveal direction="left">
            <h3 className="gradient-text" style={{ fontSize: 36, fontWeight: 800 }}>
              Gradient Text Effect
            </h3>
          </ScrollReveal>
          
          <ScrollReveal direction="right">
            <h3 className="text-glow" style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>
              Glowing Text Effect
            </h3>
          </ScrollReveal>

          <ScrollReveal direction="up">
            <h3 style={{
              fontSize: 36,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #7c6af7, #22d3ee, #f472b6, #7c6af7)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradShift 4s ease infinite',
            }}>
              Animated Gradient Text
            </h3>
          </ScrollReveal>
        </div>

        {/* Staggered Children */}
        <ScrollReveal direction="up">
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#fff' }}>
            Staggered Animations
          </h2>
        </ScrollReveal>

        <div className="stagger-children" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16,
          marginBottom: 80,
        }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              padding: 24,
              borderRadius: 16,
              background: 'rgba(124,106,247,0.1)',
              border: '1px solid rgba(124,106,247,0.2)',
              textAlign: 'center',
              color: '#fff',
              fontWeight: 600,
            }}>
              Item {i}
            </div>
          ))}
        </div>

        {/* Morphing Blob */}
        <ScrollReveal direction="scale">
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#fff', textAlign: 'center' }}>
            Morphing Blob
          </h2>
        </ScrollReveal>

        <ScrollReveal direction="scale" delay={0.2}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 80 }}>
            <div className="morph-blob" style={{
              width: 200,
              height: 200,
              background: 'linear-gradient(135deg, rgba(124,106,247,0.3), rgba(34,211,238,0.2))',
              border: '2px solid rgba(124,106,247,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
            }}>
              🌊
            </div>
          </div>
        </ScrollReveal>

        {/* Final CTA */}
        <ScrollReveal direction="up">
          <div style={{
            textAlign: 'center',
            padding: 60,
            borderRadius: 28,
            background: 'linear-gradient(135deg, rgba(124,106,247,0.1), rgba(34,211,238,0.05))',
            border: '1px solid rgba(124,106,247,0.2)',
          }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
              Ready to Experience More?
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text2)', marginBottom: 32 }}>
              These are just a few of the 50+ animations available
            </p>
            <button className="hover-scale hover-glow-intense ripple-effect" style={{
              padding: '16px 40px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #7c6af7, #5b4fd4)',
              border: 'none',
              color: '#fff',
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(124,106,247,0.3)',
            }}>
              Get Started 🚀
            </button>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
