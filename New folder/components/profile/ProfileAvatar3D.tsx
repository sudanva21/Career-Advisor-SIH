'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import Text3DWrapper from '../Text3DWrapper'
import * as THREE from 'three'
import { motion } from 'framer-motion'

interface User {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  avatarConfig?: string
}

// 3D Avatar Model
function Avatar3D({ config }: { config: any }) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle rotation and breathing animation
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.1
      const breathe = 1 + Math.sin(clock.elapsedTime * 2) * 0.05
      groupRef.current.scale.setScalar(breathe)
    }
  })

  // Avatar colors based on config or defaults
  const colors = {
    skin: config?.skinColor || '#FFDBAC',
    hair: config?.hairColor || '#8B4513',
    eyes: config?.eyeColor || '#4169E1',
    clothes: config?.clothesColor || '#FF6B6B'
  }

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Head */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial 
            color={colors.skin}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.25, 0.6, 0.6]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={colors.eyes} />
        </mesh>
        <mesh position={[0.25, 0.6, 0.6]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={colors.eyes} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial 
            color={colors.hair}
            metalness={0.2}
            roughness={0.7}
          />
        </mesh>
      </Float>

      {/* Body */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 1.2]} />
        <meshStandardMaterial 
          color={colors.clothes}
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* Arms */}
      <Float speed={1.5} rotationIntensity={0.2}>
        <mesh position={[-0.8, -0.4, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.8]} />
          <meshStandardMaterial color={colors.skin} />
        </mesh>
        <mesh position={[0.8, -0.4, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.8]} />
          <meshStandardMaterial color={colors.skin} />
        </mesh>
      </Float>

      {/* Hover Effect - Glowing Aura */}
      {hovered && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshBasicMaterial
            color="#00FFFF"
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Level Badge */}
      <Float speed={3} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh position={[1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.3}
          />
        </mesh>
        <Text3DWrapper
          position={[1.2, 0.8, 0.1]}
          fontSize={0.15}
          color="#000"
          anchorX="center"
          anchorY="middle"
        >
          LV{Math.floor(Math.random() * 50) + 1}
        </Text3DWrapper>
      </Float>
    </group>
  )
}

// Avatar Customization Panel
function AvatarCustomization({ config, onChange }: {
  config: any
  onChange: (config: any) => void
}) {
  const colorOptions = {
    skinColor: ['#FFDBAC', '#F5DEB3', '#D2B48C', '#DEB887', '#CD853F'],
    hairColor: ['#8B4513', '#000000', '#654321', '#D2691E', '#FFD700'],
    eyeColor: ['#4169E1', '#8B4513', '#228B22', '#9ACD32', '#708090'],
    clothesColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
  }

  return (
    <div className="space-y-4 mt-6">
      <h4 className="text-white font-semibold mb-4">Customize Your Avatar</h4>
      
      {Object.entries(colorOptions).map(([key, colors]) => (
        <div key={key} className="space-y-2">
          <label className="text-sm text-gray-400 capitalize">
            {key.replace('Color', '').replace(/([A-Z])/g, ' $1')}
          </label>
          <div className="flex space-x-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onChange({ ...config, [key]: color })}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                  config[key] === color
                    ? 'border-neon-cyan shadow-lg shadow-neon-cyan/25 scale-110'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProfileAvatar3D({ user }: { user: User }) {
  const [avatarConfig, setAvatarConfig] = useState(() => {
    try {
      return user.avatarConfig ? JSON.parse(user.avatarConfig) : {}
    } catch {
      return {}
    }
  })
  const [showCustomization, setShowCustomization] = useState(false)

  const handleConfigChange = (newConfig: any) => {
    setAvatarConfig(newConfig)
    // TODO: Save to backend
    // saveAvatarConfig(user.id, newConfig)
  }

  return (
    <div className="space-y-4">
      {/* 3D Avatar Display */}
      <div className="relative h-64 bg-gradient-to-b from-gray-900/30 to-black/30 rounded-xl overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-5, -5, 5]} intensity={0.4} color="#00FFFF" />
          
          <Avatar3D config={avatarConfig} />
          
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>

        {/* Overlay Controls */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowCustomization(!showCustomization)}
            className="px-3 py-2 bg-black/50 backdrop-blur-sm rounded-lg text-sm text-white border border-gray-700 hover:border-neon-cyan transition-all duration-200"
          >
            Customize
          </button>
        </div>
      </div>

      {/* Customization Panel */}
      {showCustomization && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-black/30 rounded-xl p-4 border border-gray-800"
        >
          <AvatarCustomization
            config={avatarConfig}
            onChange={handleConfigChange}
          />
        </motion.div>
      )}

      {/* User Info */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Online</span>
        </div>
        <p className="text-xs text-gray-500">
          Member since {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}