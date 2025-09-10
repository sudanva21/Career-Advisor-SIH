'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Text3DWrapper from '../Text3DWrapper'
import * as THREE from 'three'

interface Skill {
  name: string
  current: number
  target: number
  category: string
}

function SkillBar3D({ skill, position, index }: { 
  skill: Skill
  position: [number, number, number]
  index: number 
}) {
  const progressRef = useRef<THREE.Mesh>(null!)
  const targetRef = useRef<THREE.Mesh>(null!)
  
  const progress = skill.current / 100
  const targetProgress = skill.target / 100
  
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend': return '#00FFFF'
      case 'backend': return '#FF007F'
      case 'programming': return '#8B00FF'
      case 'soft skills': return '#FFD700'
      default: return '#666666'
    }
  }

  const color = getCategoryColor(skill.category)

  useFrame(({ clock }) => {
    if (progressRef.current) {
      // Animate progress bar growth
      const targetScale = progress * 2 // Max width of 2 units
      progressRef.current.scale.x += (targetScale - progressRef.current.scale.x) * 0.05
      
      // Slight pulsing effect
      const pulse = 1 + Math.sin(clock.elapsedTime * 2 + index) * 0.05
      progressRef.current.scale.y = pulse
    }
  })

  return (
    <group position={position}>
      {/* Background bar */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.2, 0.1]} />
        <meshStandardMaterial color="#333333" transparent opacity={0.3} />
      </mesh>

      {/* Target indicator */}
      <mesh 
        ref={targetRef}
        position={[targetProgress * 2 - 1, 0, 0.1]}
      >
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>

      {/* Progress bar */}
      <mesh 
        ref={progressRef}
        position={[-1 + (progress * 2) / 2, 0, 0.05]}
        scale={[0, 1, 1]}
      >
        <boxGeometry args={[1, 0.25, 0.12]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Skill name */}
      <Text3DWrapper
        position={[-1.2, 0, 0]}
        fontSize={0.15}
        color="white"
        anchorX="right"
        anchorY="middle"
        maxWidth={1.5}
      >
        {skill.name}
      </Text3DWrapper>

      {/* Progress percentage */}
      <Text3DWrapper
        position={[1.3, 0, 0]}
        fontSize={0.12}
        color={color}
        anchorX="left"
        anchorY="middle"
      >
        {skill.current}%
      </Text3DWrapper>
    </group>
  )
}

export default function SkillProgress3D({ skills }: { skills: Skill[] }) {
  return (
    <div className="h-48 bg-gradient-to-b from-gray-900/20 to-black/20 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 3]} intensity={0.4} />
        <pointLight position={[-3, -3, 3]} intensity={0.2} color="#00FFFF" />

        {/* Skill Bars */}
        {skills.map((skill, index) => (
          <SkillBar3D
            key={skill.name}
            skill={skill}
            position={[0, 1.5 - index * 0.8, 0]}
            index={index}
          />
        ))}

        {/* Category Legend */}
        <Text3DWrapper
          position={[-2.5, 2, 0]}
          fontSize={0.1}
          color="#888888"
          anchorX="left"
          anchorY="top"
        >
          Skills by Category
        </Text3DWrapper>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
        />
      </Canvas>

      {/* Progress Summary */}
      <div className="absolute bottom-2 left-4 right-4">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Overall Progress</span>
          <span className="text-neon-cyan font-semibold">
            {Math.round(skills.reduce((sum, skill) => sum + skill.current, 0) / skills.length)}%
          </span>
        </div>
      </div>
    </div>
  )
}