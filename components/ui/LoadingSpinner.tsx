import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 'md', message = 'Loading...' }: {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0E17]">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-gray-800 border-t-neon-cyan rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`${textSizes[size]} text-gray-400 mt-4 font-medium`}
      >
        {message}
      </motion.p>
    </div>
  )
}