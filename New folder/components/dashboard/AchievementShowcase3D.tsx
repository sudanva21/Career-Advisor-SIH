'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import Text3DWrapper from '../Text3DWrapper'
import * as THREE from 'three'

interface Achievement {
  id: string
  title: string
  type: 'skill' | 'milestone' | 'streak' | 'project'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  position: [number, number, number]
}

function AchievementBadge3D({ achievement, index }: { 
  achievement: Achievement
  index: number 
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'common': return '#9CA3AF'
      case 'rare': return '#3B82F6'
      case 'epic': return '#8B5CF6'
      case 'legendary': return '#F59E0B'
      default: return '#9CA3AF'
    }
  }

  const getGeometry = () => {
    switch (achievement.type) {
      case 'skill': return <icosahedronGeometry args={[0.2]} />
      case 'milestone': return <dodecahedronGeometry args={[0.2]} />
      case 'streak': return <cylinderGeometry args={[0.15, 0.15, 0.3]} />
      case 'project': return <boxGeometry args={[0.25, 0.25, 0.25]} />
      default: return <sphereGeometry args={[0.2]} />
    }
  }

  const color = getRarityColor()

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Rotation based on rarity
      const rotationSpeed = achievement.rarity === 'legendary' ? 2 : 
                           achievement.rarity === 'epic' ? 1.5 :
                           achievement.rarity === 'rare' ? 1 : 0.5
      
      meshRef.current.rotation.y = clock.elapsedTime * rotationSpeed
      meshRef.current.rotation.x = Math.sin(clock.elapsedTime + index) * 0.1
      
      // Pulsing glow for legendary achievements
      if (achievement.rarity === 'legendary') {
        const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.2
        meshRef.current.scale.setScalar(pulse)
      }
    }
  })

  return (
    <group position={achievement.position}>
      <Float 
        speed={2 + index * 0.5} 
        rotationIntensity={0.2} 
        floatIntensity={0.3}
      >
        <mesh ref={meshRef}>
          {getGeometry()}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={
              achievement.rarity === 'legendary' ? 0.5 :
              achievement.rarity === 'epic' ? 0.3 :
              achievement.rarity === 'rare' ? 0.2 : 0.1
            }
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>

        {/* Glow effect for rare+ achievements */}
        {achievement.rarity !== 'common' && (
          <mesh>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={
                achievement.rarity === 'legendary' ? 0.2 :
                achievement.rarity === 'epic' ? 0.15 :
                0.1
              }
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Achievement title */}
        <Text3DWrapper
          position={[0, -0.4, 0]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.5}
        >
          {achievement.title}
        </Text3DWrapper>

        {/* Rarity indicator */}
        <Text3DWrapper
          position={[0, 0.4, 0]}
          fontSize={0.06}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {achievement.rarity.toUpperCase()}
        </Text3DWrapper>
      </Float>
    </group>
  )
}

export default function AchievementShowcase3D({ userId }: { userId: string }) {
  // Mock achievement data - replace with actual API call
  const recentAchievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      type: 'milestone',
      rarity: 'common',
      position: [-1, 0, 0]
    },
    {
      id: '2',
      title: 'Skill Master',
      type: 'skill',
      rarity: 'epic',
      position: [0, 0, 0]
    },
    {
      id: '3',
      title: 'Project Pioneer',
      type: 'project',
      rarity: 'legendary',
      position: [1, 0, 0]
    }
  ]

  return (
    <div className="h-32 bg-gradient-to-b from-gray-900/20 to-black/20 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 1, 4], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={0.6} />
        <pointLight position={[-3, -3, 3]} intensity={0.3} color="#FFD700" />

        {/* Achievement Badges */}
        {recentAchievements.map((achievement, index) => (
          <AchievementBadge3D
            key={achievement.id}
            achievement={achievement}
            index={index}
          />
        ))}
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-2 left-4 right-4">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Latest Achievements</span>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Common</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Epic</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Legendary</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}