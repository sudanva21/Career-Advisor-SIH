'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Line } from '@react-three/drei'
import Text3DWrapper from '../Text3DWrapper'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

interface SkillNode {
  id: string
  name: string
  level: number // 0-100
  category: 'technical' | 'soft_skills' | 'domain_specific'
  position: [number, number, number]
  connections: string[] // IDs of connected skills
  color: string
  description: string
  resources?: string[]
}

// 3D Skill Node Component
function SkillNode3D({ 
  skill, 
  isSelected, 
  onSelect 
}: { 
  skill: SkillNode
  isSelected: boolean
  onSelect: (skill: SkillNode) => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Pulsing animation based on skill level
      const intensity = skill.level / 100
      const pulse = 1 + Math.sin(clock.elapsedTime * 2) * 0.1 * intensity
      meshRef.current.scale.setScalar(pulse)

      // Rotation for selected node
      if (isSelected) {
        meshRef.current.rotation.y = clock.elapsedTime
      }
    }
  })

  const nodeSize = 0.3 + (skill.level / 100) * 0.3 // Size based on skill level

  return (
    <group position={skill.position}>
      <Float speed={1 + skill.level / 100} rotationIntensity={0.2} floatIntensity={0.1}>
        <mesh
          ref={meshRef}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={() => onSelect(skill)}
        >
          <icosahedronGeometry args={[nodeSize, 1]} />
          <meshStandardMaterial
            color={skill.color}
            emissive={skill.color}
            emissiveIntensity={hovered || isSelected ? 0.5 : 0.2}
            transparent
            opacity={0.8}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>

        {/* Progress Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[nodeSize + 0.1, nodeSize + 0.15, 32]} />
          <meshBasicMaterial
            color={skill.color}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Skill Name */}
        <Text3DWrapper
          position={[0, nodeSize + 0.5, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {skill.name}
        </Text3DWrapper>

        {/* Skill Level */}
        <Text3DWrapper
          position={[0, nodeSize + 0.3, 0]}
          fontSize={0.15}
          color="#00FFFF"
          anchorX="center"
          anchorY="middle"
        >
          {skill.level}%
        </Text3DWrapper>

        {/* Selection Glow */}
        {isSelected && (
          <mesh>
            <sphereGeometry args={[nodeSize + 0.3, 32, 32]} />
            <meshBasicMaterial
              color="#00FFFF"
              transparent
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
        )}
      </Float>
    </group>
  )
}

// Connection Lines Component
function SkillConnections({ skills, selectedSkill }: { 
  skills: SkillNode[]
  selectedSkill: SkillNode | null 
}) {
  const connections = useMemo(() => {
    const lines: Array<{ from: SkillNode, to: SkillNode }> = []
    
    skills.forEach(skill => {
      skill.connections.forEach(connectionId => {
        const connectedSkill = skills.find(s => s.id === connectionId)
        if (connectedSkill) {
          lines.push({ from: skill, to: connectedSkill })
        }
      })
    })
    
    return lines
  }, [skills])

  return (
    <>
      {connections.map((connection, index) => {
        const isHighlighted = selectedSkill && 
          (connection.from.id === selectedSkill.id || connection.to.id === selectedSkill.id)
        
        return (
          <Line
            key={index}
            points={[connection.from.position, connection.to.position]}
            color={isHighlighted ? "#00FFFF" : "#666666"}
            lineWidth={isHighlighted ? 3 : 1}
            transparent
            opacity={isHighlighted ? 0.8 : 0.4}
          />
        )
      })}
    </>
  )
}

// Skill Categories Legend
function SkillCategories({ skills, selectedCategory, onCategorySelect }: {
  skills: SkillNode[]
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
}) {
  const categories = {
    technical: { color: '#00FFFF', label: 'Technical Skills' },
    soft_skills: { color: '#FF007F', label: 'Soft Skills' },
    domain_specific: { color: '#8B00FF', label: 'Domain Specific' }
  }

  const categoryCounts = skills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 space-y-2">
      <h4 className="text-white font-semibold text-sm mb-3">Categories</h4>
      {Object.entries(categories).map(([key, category]) => (
        <button
          key={key}
          onClick={() => onCategorySelect(selectedCategory === key ? null : key)}
          className={`flex items-center space-x-2 w-full p-2 rounded transition-all duration-200 ${
            selectedCategory === key
              ? 'bg-white/20 border border-white/30'
              : 'hover:bg-white/10'
          }`}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm text-white">{category.label}</span>
          <span className="text-xs text-gray-400 ml-auto">
            {categoryCounts[key] || 0}
          </span>
        </button>
      ))}
    </div>
  )
}

// Skill Detail Panel
function SkillDetailPanel({ skill, onClose }: { 
  skill: SkillNode | null
  onClose: () => void 
}) {
  if (!skill) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl rounded-lg p-6 w-80 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">{skill.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Proficiency</span>
              <span className="text-sm text-neon-cyan font-semibold">{skill.level}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-neon-cyan to-neon-pink rounded-full h-2 transition-all duration-500"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <span className="text-sm text-gray-400">Category</span>
            <div className="mt-1">
              <span
                className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: skill.color + '20',
                  color: skill.color
                }}
              >
                {skill.category.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-sm text-gray-400">Description</span>
            <p className="text-sm text-white mt-1">{skill.description}</p>
          </div>

          {/* Resources */}
          {skill.resources && skill.resources.length > 0 && (
            <div>
              <span className="text-sm text-gray-400">Learning Resources</span>
              <ul className="mt-2 space-y-1">
                {skill.resources.map((resource, index) => (
                  <li key={index} className="text-sm text-neon-cyan hover:text-white cursor-pointer">
                    • {resource}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <button className="flex-1 px-3 py-2 bg-neon-cyan text-black rounded-lg font-semibold hover:bg-neon-cyan/80 transition-colors">
              Practice
            </button>
            <button className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function SkillTree3D({ userId }: { userId: string }) {
  const [skills, setSkills] = useState<SkillNode[]>([])
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock skills data - replace with API call
  useEffect(() => {
    const mockSkills: SkillNode[] = [
      {
        id: '1',
        name: 'React',
        level: 85,
        category: 'technical',
        position: [0, 2, 0],
        connections: ['2', '3'],
        color: '#00FFFF',
        description: 'Frontend library for building user interfaces',
        resources: ['React Documentation', 'React Tutorial', 'Advanced React Patterns']
      },
      {
        id: '2',
        name: 'JavaScript',
        level: 90,
        category: 'technical',
        position: [-2, 0, 1],
        connections: ['1', '4'],
        color: '#00FFFF',
        description: 'Core programming language for web development'
      },
      {
        id: '3',
        name: 'TypeScript',
        level: 75,
        category: 'technical',
        position: [2, 0, 1],
        connections: ['1'],
        color: '#00FFFF',
        description: 'Typed superset of JavaScript'
      },
      {
        id: '4',
        name: 'Node.js',
        level: 70,
        category: 'technical',
        position: [-2, -2, 0],
        connections: ['2'],
        color: '#00FFFF',
        description: 'Runtime for server-side JavaScript'
      },
      {
        id: '5',
        name: 'Communication',
        level: 80,
        category: 'soft_skills',
        position: [0, 0, -2],
        connections: ['6'],
        color: '#FF007F',
        description: 'Effective verbal and written communication'
      },
      {
        id: '6',
        name: 'Leadership',
        level: 65,
        category: 'soft_skills',
        position: [2, -1, -2],
        connections: ['5'],
        color: '#FF007F',
        description: 'Leading teams and projects'
      },
      {
        id: '7',
        name: 'Web Design',
        level: 60,
        category: 'domain_specific',
        position: [0, 1, 2],
        connections: [],
        color: '#8B00FF',
        description: 'UI/UX design principles for web applications'
      }
    ]

    setTimeout(() => {
      setSkills(mockSkills)
      setLoading(false)
    }, 1000)
  }, [userId])

  const filteredSkills = selectedCategory 
    ? skills.filter(skill => skill.category === selectedCategory)
    : skills

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-neon-cyan rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading your skills...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-96 bg-gradient-to-b from-gray-900/30 to-black/30 rounded-xl overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, 5]} intensity={0.4} color="#00FFFF" />
        <pointLight position={[5, -10, -5]} intensity={0.3} color="#FF007F" />

        {/* Skill Nodes */}
        {filteredSkills.map(skill => (
          <SkillNode3D
            key={skill.id}
            skill={skill}
            isSelected={selectedSkill?.id === skill.id}
            onSelect={setSelectedSkill}
          />
        ))}

        {/* Connections */}
        <SkillConnections skills={filteredSkills} selectedSkill={selectedSkill} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
        />
      </Canvas>

      {/* UI Overlays */}
      <SkillCategories
        skills={skills}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <SkillDetailPanel
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
      />

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
        <p className="text-xs text-gray-400">
          Click nodes to view details • Drag to rotate • Scroll to zoom
        </p>
      </div>
    </div>
  )
}