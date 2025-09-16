/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle node modules that should not be bundled for the server
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas']
    }
    
    // Add fallback for canvas which is not needed in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'canvas': false,
    }
    
    // Replace troika-worker-utils with mock for both server and client
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^troika-worker-utils$/,
        require.resolve('./lib/empty-module.mjs')
      )
    )
    
    // Additional alias to ensure consistent module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      'troika-worker-utils$': require.resolve('./lib/empty-module.mjs'),
    }

    // Add custom plugin to handle troika-three-text font data issues
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.TROIKA_FONT_FALLBACK': JSON.stringify(true)
      })
    )
    
    // Handle potential node-specific modules for troika-three-text
    if (isServer) {
      config.externals.push('sharp')
    }
    
    return config
  },
}

module.exports = nextConfig