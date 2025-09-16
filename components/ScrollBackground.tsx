'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function ScrollBackground() {
  const [mounted, setMounted] = useState(false)
  const { scrollYProgress } = useScroll()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Transform scroll progress into different movement patterns
  const gridX = useTransform(scrollYProgress, [0, 1], [0, -100])
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 0.05, 0.02])
  
  const lineRotate = useTransform(scrollYProgress, [0, 1], [0, 180])
  const lineScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 0.8])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Animated Grid Background */}
      <motion.div
        className="absolute inset-0"
        style={{ 
          x: gridX, 
          y: gridY,
          opacity,
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(255, 0, 127, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 127, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 50px 50px, 50px 50px',
          backgroundPosition: '0 0, 0 0, 25px 25px, 25px 25px'
        }}
      />
      
      {/* Flowing Lines that React to Scroll */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ 
          rotate: lineRotate,
          scale: lineScale 
        }}
      >
        {/* Diagonal Lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-neon-cyan/30 to-transparent"
            style={{
              height: '200vh',
              left: `${15 + i * 15}%`,
              top: '-50vh',
              transform: 'rotate(45deg)',
              animationDelay: `${i * 0.5}s`
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scaleY: [1, 1.2, 1]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Curved Flow Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFFF" stopOpacity="0" />
              <stop offset="20%" stopColor="#00FFFF" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#FF007F" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FF007F" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.path
              key={i}
              d={`M-100,${200 + i * 150} Q400,${150 + i * 100} 800,${250 + i * 120} T1600,${200 + i * 150}`}
              stroke="url(#flowGradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.8
              }}
            />
          ))}
        </svg>
      </motion.div>
      
      {/* Particle Field */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </div>
  )
}