'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import Text3DWrapper from './Text3DWrapper'
import * as THREE from 'three'

interface CareerTreeProps {
  careerPath: string
  relatedCareers: string[]
  skills: string[]
}

function CareerNode({ 
  position, 
  text, 
  color = '#00FFFF', 
  size = 0.5,
  isMain = false
}: {
  position: [number, number, number]
  text: string
  color?: string
  size?: number
  isMain?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1
      if (isMain) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
      }
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isMain ? 0.3 : 0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text3DWrapper
        position={[0, size + 0.5, 0]}
        fontSize={isMain ? 0.3 : 0.2}
        color={color}
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
        textAlign="center"
      >
        {text}
      </Text3DWrapper>
    </group>
  )
}

function ConnectingLine({ 
  start, 
  end, 
  color = '#00FFFF' 
}: {
  start: [number, number, number]
  end: [number, number, number]
  color?: string
}) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end])

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  )
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null!)
  const count = 100

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return positions
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#00FFFF"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function CareerTree3DScene({ careerPath, relatedCareers, skills }: CareerTreeProps) {
  // Create 3D positions for career nodes
  const mainPosition: [number, number, number] = [0, 0, 0]
  
  const relatedPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    const radius = 4
    const angleStep = (2 * Math.PI) / relatedCareers.length
    
    relatedCareers.forEach((_, index) => {
      const angle = index * angleStep
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = Math.random() * 2 - 1
      positions.push([x, y, z])
    })
    
    return positions
  }, [relatedCareers])

  const skillPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    const radius = 2.5
    const angleStep = (2 * Math.PI) / skills.length
    
    skills.forEach((_, index) => {
      const angle = index * angleStep + Math.PI / skills.length
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = -2 + Math.random() * 1
      positions.push([x, y, z])
    })
    
    return positions
  }, [skills])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} color="#00FFFF" intensity={0.8} />
      <pointLight position={[-10, -10, -10]} color="#FF007F" intensity={0.5} />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Main Career Node */}
      <CareerNode
        position={mainPosition}
        text={careerPath}
        color="#00FFFF"
        size={0.8}
        isMain={true}
      />

      {/* Related Career Nodes */}
      {relatedCareers.map((career, index) => (
        <React.Fragment key={career}>
          <CareerNode
            position={relatedPositions[index]}
            text={career}
            color="#FF007F"
            size={0.5}
          />
          <ConnectingLine
            start={mainPosition}
            end={relatedPositions[index]}
            color="#FF007F"
          />
        </React.Fragment>
      ))}

      {/* Skill Nodes */}
      {skills.map((skill, index) => (
        <React.Fragment key={skill}>
          <CareerNode
            position={skillPositions[index]}
            text={skill}
            color="#8B00FF"
            size={0.3}
          />
          <ConnectingLine
            start={mainPosition}
            end={skillPositions[index]}
            color="#8B00FF"
          />
        </React.Fragment>
      ))}

      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={15}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  )
}

const CareerTree3D: React.FC<CareerTreeProps> = ({ careerPath, relatedCareers, skills }) => {
  return (
    <div className="w-full h-96 relative">
      <Canvas
        camera={{ position: [8, 5, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <CareerTree3DScene
          careerPath={careerPath}
          relatedCareers={relatedCareers}
          skills={skills}
        />
      </Canvas>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-neon-cyan"></div>
            <span className="text-xs text-white">Main Career</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-neon-pink"></div>
            <span className="text-xs text-white">Related Careers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-neon-purple"></div>
            <span className="text-xs text-white">Required Skills</span>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg p-3">
        <p className="text-xs text-gray-300">
          Drag to rotate • Scroll to zoom
        </p>
      </div>
    </div>
  )
}

export default CareerTree3D