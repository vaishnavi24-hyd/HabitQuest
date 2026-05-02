import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Shield, Zap, TrendingUp, Star, Info } from 'lucide-react';
import './HeroEvolution.css';

const STAGE_CONFIG = [
  {
    maxDays: 3,
    title: 'Rookie Runner',
    quote: ['Every legend starts somewhere.', 'Take the first step.'],
    desc: 'Starting your journey.',
    dayRange: '1 - 3',
    color: '#38bdf8', // Blue
    img: '/heroes/stage_1.png',
    rewards: [
      { icon: <Shield size={20} />, title: 'Basic Gear', sub: 'Starting Items' },
      { icon: <Zap size={20} />, title: 'Energy Aura', sub: 'Weak Glow' }
    ]
  },
  {
    maxDays: 10,
    title: 'Endurance Soldier',
    quote: ['Discipline builds power.', 'You are adapting.'],
    desc: 'Discipline builds unshakable strength.',
    dayRange: '4 - 10',
    color: '#10b981', // Green
    img: '/heroes/stage_2.png',
    rewards: [
      { icon: <Shield size={20} />, title: 'Light Armor', sub: 'Defense Boost' },
      { icon: <Zap size={20} />, title: 'Stamina Surge', sub: 'More Energy' },
      { icon: <TrendingUp size={20} />, title: '+100 XP', sub: 'Bonus' }
    ]
  },
  {
    maxDays: 20,
    title: 'Elite Warrior',
    quote: ['Your resolve is absolute.', 'You are becoming unstoppable.'],
    desc: 'Power awakens. You lead, you inspire.',
    dayRange: '11 - 20',
    color: '#a855f7', // Purple
    img: '/heroes/stage_3.png',
    rewards: [
      { icon: <Zap size={20} />, title: 'Energy Blade', sub: 'Weapon Unlocked' },
      { icon: <Star size={20} />, title: 'Elite Status', sub: 'Respect' }
    ]
  },
  {
    maxDays: Infinity,
    title: 'Legendary Champion',
    quote: ['A paragon of focus.', 'Your power is limitless.'],
    desc: 'A legend is born. Unstoppable. Unbreakable.',
    dayRange: '21+',
    color: '#f59e0b', // Gold/Orange
    img: '/heroes/stage_4.png',
    rewards: [
      { icon: <Star size={20} />, title: 'Legendary Cape', sub: 'Aesthetics' },
      { icon: <Zap size={20} />, title: 'Max Power', sub: 'Overwhelming Aura' }
    ]
  }
];

// Removed 3D primitive Superhero and Scene as user requested real human image

// Replaced Scene with simple image rendering

export default function HeroEvolution({ currentStreak = 0 }) {
  let stageIndex = STAGE_CONFIG.findIndex(s => currentStreak <= s.maxDays);
  if (stageIndex === -1) stageIndex = 3;
  
  const config = STAGE_CONFIG[stageIndex];
  
  const currentStageMin = stageIndex === 0 ? 0 : STAGE_CONFIG[stageIndex - 1].maxDays;
  const currentStageMax = config.maxDays === Infinity ? currentStageMin + 30 : config.maxDays;
  const progressPercent = Math.min(100, Math.max(0, ((currentStreak - currentStageMin) / (currentStageMax - currentStageMin)) * 100));

  return (
    <div className="hero-evo-layout">
      
      {/* LEFT PANEL: 3D Hero + Current Stage Info */}
      <div className="hero-left-panel">
        <div className="hero-image-wrapper">
          <div className="hero-bg-glow" style={{ background: `radial-gradient(circle, ${config.color}30 0%, transparent 60%)` }}></div>
          <img src={config.img} alt={config.title} className="hero-human-img" />
          
          {/* Subtle R3F overlay for true 3D particles over the 2D image */}
          <div className="hero-particles-overlay">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <Sparkles 
                count={(stageIndex + 1) * 30 + 20} 
                scale={5} 
                size={(stageIndex + 1) * 2 + 2} 
                speed={0.4} 
                opacity={0.8} 
                color={config.color} 
                position={[0, 0, 0]}
              />
            </Canvas>
          </div>
        </div>
        
        <div className="current-stage-info">
          <p className="cs-label">CURRENT STAGE</p>
          <h2 className="cs-title">{config.title}</h2>
          <p className="cs-day">Day {currentStreak} of {currentStageMax}</p>
          
          <div className="cs-progress-row">
            <div className="cs-progress-bar">
              <div className="cs-progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: config.color }}></div>
            </div>
            <span className="cs-progress-text">{Math.round(progressPercent)}% Complete</span>
          </div>

          <div className="cs-quote-box">
            <p>{config.quote[0]}</p>
            <p>{config.quote[1]}</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Timeline + Next Rewards */}
      <div className="hero-right-panel">
        <div className="hr-header">
          <h3>HABIT EVOLUTION <Info size={16} color="#94a3b8" /></h3>
          <p>Your hero evolves as you stay consistent.</p>
        </div>

        <div className="timeline-container">
          {STAGE_CONFIG.map((stage, idx) => {
            const isActive = idx === stageIndex;
            return (
              <div key={idx} className={`timeline-item ${isActive ? 'active' : ''}`}>
                <div className="timeline-line"></div>
                <div className="timeline-dot-wrapper">
                  <div className="timeline-dot" style={{ borderColor: isActive ? stage.color : '#334155', backgroundColor: isActive ? stage.color : 'transparent' }}></div>
                </div>
                
                <div className="timeline-card" style={{ borderColor: isActive ? stage.color : 'transparent' }}>
                  <img src={stage.img} alt={stage.title} className="timeline-img" />
                  <div className="timeline-card-info">
                    <span className="tc-stage-label" style={{ color: isActive ? stage.color : '#64748b' }}>STAGE {idx + 1}</span>
                    <h4 className="tc-title" style={{ color: isActive ? stage.color : '#94a3b8' }}>{stage.title}</h4>
                    <p className="tc-day">Day {stage.dayRange}</p>
                    <p className="tc-desc">{stage.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {config.maxDays !== Infinity && (
          <div className="next-rewards-section">
            <h4 className="nr-title">NEXT EVOLUTION REWARD</h4>
            <div className="nr-items">
              {config.rewards.map((r, i) => (
                <div key={i} className="nr-item">
                  <div className="nr-icon" style={{ color: config.color }}>{r.icon}</div>
                  <div className="nr-text">
                    <span className="nr-main">{r.title}</span>
                    <span className="nr-sub">{r.sub}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="nr-unlock-text">
              Complete <strong style={{ color: '#fff' }}>{config.maxDays - currentStreak + 1}</strong> more days to unlock next evolution!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
