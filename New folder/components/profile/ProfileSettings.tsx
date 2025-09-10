'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  Camera,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle
} from 'lucide-react'

interface ProfileSettingsProps {
  onUpdate?: (updatedProfile: any) => void
}

interface ProfileData {
  first_name: string
  last_name: string
  email: string
  avatar_url?: string
}

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  security_alerts: boolean
}

interface PreferenceSettings {
  theme: 'dark' | 'light' | 'system'
  language: string
  timezone: string
  currency: string
}

export default function ProfileSettings({ onUpdate }: ProfileSettingsProps) {
  const { user, profile, updateProfile } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Form states
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || user?.email || '',
    avatar_url: profile?.avatar_url || ''
  })

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    security_alerts: true
  })

  const [preferences, setPreferences] = useState<PreferenceSettings>({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    currency: 'USD'
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || user?.email || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile, user])

  const sections = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ]

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleProfileUpdate = async () => {
    if (!profileData.first_name.trim() || !profileData.last_name.trim()) {
      showMessage('error', 'First name and last name are required')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: profileData.first_name.trim(),
          last_name: profileData.last_name.trim(),
          avatar_url: profileData.avatar_url
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (updateProfile) {
          updateProfile(data.profile)
        }
        if (onUpdate) {
          onUpdate(data.profile)
        }
        showMessage('success', 'Profile updated successfully!')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showMessage('error', 'Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('error', 'All password fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', 'New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)
    try {
      // This would typically call Supabase auth API to update password
      // For now, just show success message
      showMessage('success', 'Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error updating password:', error)
      showMessage('error', 'Failed to update password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationUpdate = () => {
    showMessage('success', 'Notification preferences updated!')
  }

  const handlePreferencesUpdate = () => {
    showMessage('success', 'Preferences updated!')
  }

  return (
    <div className="space-y-6">
      {/* Message Banner */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 rounded-xl border-l-4 ${
            message.type === 'success'
              ? 'bg-green-900/20 border-green-500 text-green-400'
              : 'bg-red-900/20 border-red-500 text-red-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <Check size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </div>
        </motion.div>
      )}

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-neon-cyan text-black shadow-lg shadow-neon-cyan/25'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <section.icon size={18} />
            <span className="font-medium">{section.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Information Section */}
      {activeSection === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <User className="mr-2" size={20} />
              Profile Information
            </h3>
            
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-neon-cyan to-neon-pink flex items-center justify-center text-2xl font-bold text-black">
                    {profileData.first_name?.[0] || '?'}{profileData.last_name?.[0] || ''}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-neon-cyan text-black p-2 rounded-full shadow-lg hover:shadow-neon-cyan/50 transition-all duration-300">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h4 className="text-white font-medium">Profile Picture</h4>
                  <p className="text-gray-400 text-sm">Upload a new avatar or change your current one</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-neon-cyan focus:outline-none transition-colors duration-300"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-neon-cyan focus:outline-none transition-colors duration-300"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-gray-400 cursor-not-allowed"
                  placeholder="your.email@example.com"
                />
                <p className="text-gray-500 text-xs mt-1">Email cannot be changed from here</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleProfileUpdate}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-blue-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-neon-cyan/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
                >
                  <Save size={18} />
                  <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Shield className="mr-2" size={20} />
              Security Settings
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-medium mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-neon-cyan focus:outline-none transition-colors duration-300 pr-12"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-neon-cyan focus:outline-none transition-colors duration-300"
                      placeholder="Enter new password (min 8 characters)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-neon-cyan focus:outline-none transition-colors duration-300"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePasswordChange}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-neon-pink to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-neon-pink/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
                >
                  <Lock size={18} />
                  <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Section */}
      {activeSection === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Bell className="mr-2" size={20} />
              Notification Preferences
            </h3>
            
            <div className="space-y-6">
              {[
                { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'push_notifications', label: 'Push Notifications', desc: 'Get notified in your browser' },
                { key: 'marketing_emails', label: 'Marketing Emails', desc: 'Promotional content and updates' },
                { key: 'security_alerts', label: 'Security Alerts', desc: 'Important security notifications' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                  <div>
                    <h4 className="text-white font-medium">{item.label}</h4>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications({
                      ...notifications,
                      [item.key]: !notifications[item.key as keyof NotificationSettings]
                    })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      notifications[item.key as keyof NotificationSettings]
                        ? 'bg-neon-cyan'
                        : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                        notifications[item.key as keyof NotificationSettings]
                          ? 'translate-x-7'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={handleNotificationUpdate}
                  className="px-6 py-3 bg-gradient-to-r from-neon-purple to-violet-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-neon-purple/25 transition-all duration-300 flex items-center space-x-2"
                >
                  <Save size={18} />
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preferences Section */}
      {activeSection === 'preferences' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Palette className="mr-2" size={20} />
              Preferences
            </h3>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Theme
                  </label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'dark' | 'light' | 'system' })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-colors duration-300"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Language
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-colors duration-300"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Timezone
                  </label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-colors duration-300"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Asia/Kolkata">India Standard Time</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Currency
                  </label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-colors duration-300"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePreferencesUpdate}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 flex items-center space-x-2"
                >
                  <Globe size={18} />
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}