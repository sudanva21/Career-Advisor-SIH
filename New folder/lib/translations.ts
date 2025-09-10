// Translation keys and default English text
// This file contains all the text that needs to be translated in the application

export interface TranslationData {
  // Navigation
  nav: {
    home: string
    colleges: string
    features: string
    pricing: string
    dashboard: string
    signIn: string
    signOut: string
    profile: string
    settings: string
  }
  
  // Features dropdown
  features: {
    careerQuiz: {
      name: string
      description: string
    }
    collegeFinder: {
      name: string
      description: string
    }
    aiRoadmap: {
      name: string
      description: string
    }
    jobHunting: {
      name: string
      description: string
    }
    careerTree: {
      name: string
      description: string
    }
    learningResources: {
      name: string
      description: string
    }
    subscriptionPlans: {
      name: string
      description: string
    }
    signInRequired: string
  }
  
  // Common UI elements
  common: {
    loading: string
    error: string
    success: string
    save: string
    cancel: string
    continue: string
    back: string
    next: string
    submit: string
    search: string
    filter: string
    clear: string
    close: string
    open: string
    language: string
  }
  
  // Hero section
  hero: {
    title: string
    subtitle: string
    ctaExplore: string
    ctaQuiz: string
    scrollDown: string
  }
  
  // Feature cards
  featureCards: {
    personalizedQuiz: {
      title: string
      description: string
    }
    collegeRecommendations: {
      title: string
      description: string
    }
    careerVisualization: {
      title: string
      description: string
    }
  }
  
  // Footer
  footer: {
    description: string
    quickLinks: string
    features: string
    support: string
    legal: string
    about: string
    contact: string
    help: string
    team: string
    blog: string
    press: string
    privacy: string
    terms: string
    copyright: string
  }
  
  // Auth forms
  auth: {
    signIn: string
    signUp: string
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    forgotPassword: string
    rememberMe: string
    noAccount: string
    haveAccount: string
    createAccount: string
    signInToAccount: string
    resetPassword: string
  }
  
  // Dashboard
  dashboard: {
    welcome: string
    overview: string
    recentActivity: string
    recommendations: string
    profile: string
    settings: string
    subscription: string
    support: string
  }
}

// Default English translations
export const defaultTranslations: TranslationData = {
  nav: {
    home: 'Home',
    colleges: 'Colleges',
    features: 'Features',
    pricing: 'Pricing',
    dashboard: 'Dashboard',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    profile: 'Profile',
    settings: 'Settings'
  },
  
  features: {
    careerQuiz: {
      name: 'Career Quiz',
      description: 'AI-powered career assessment'
    },
    collegeFinder: {
      name: 'College Finder',
      description: 'Find colleges with AI recommendations'
    },
    aiRoadmap: {
      name: 'AI Roadmap',
      description: 'Generate personalized career roadmaps'
    },
    jobHunting: {
      name: 'Job Hunting',
      description: 'AI-powered job matching and outreach'
    },
    careerTree: {
      name: '3D Career Tree',
      description: 'Interactive career exploration'
    },
    learningResources: {
      name: 'Learning Resources',
      description: 'Curated study materials'
    },
    subscriptionPlans: {
      name: 'Subscription Plans',
      description: 'View and upgrade your plan'
    },
    signInRequired: 'Sign in required'
  },
  
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    close: 'Close',
    open: 'Open',
    language: 'Language'
  },
  
  hero: {
    title: 'Your Personalized Career & College Guide',
    subtitle: 'Discover your path with AI-powered quizzes, 3D career maps & nearby government college suggestions.',
    ctaExplore: 'Explore Features',
    ctaQuiz: 'Take Career Quiz',
    scrollDown: 'Scroll to explore'
  },
  
  featureCards: {
    personalizedQuiz: {
      title: 'Personalized Career Quiz',
      description: 'AI-driven assessment to discover your strengths and ideal career paths'
    },
    collegeRecommendations: {
      title: 'Smart College Recommendations',
      description: 'Find the perfect colleges based on your preferences and career goals'
    },
    careerVisualization: {
      title: '3D Career Visualization',
      description: 'Interactive 3D maps to explore career paths and opportunities'
    }
  },
  
  footer: {
    description: 'Your comprehensive platform for career guidance and college recommendations powered by AI.',
    quickLinks: 'Quick Links',
    features: 'Features',
    support: 'Support',
    legal: 'Legal',
    about: 'About',
    contact: 'Contact',
    help: 'Help',
    team: 'Team',
    blog: 'Blog',
    press: 'Press',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    copyright: 'All rights reserved.'
  },
  
  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember me',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    createAccount: 'Create Account',
    signInToAccount: 'Sign in to your account',
    resetPassword: 'Reset Password'
  },
  
  dashboard: {
    welcome: 'Welcome back!',
    overview: 'Overview',
    recentActivity: 'Recent Activity',
    recommendations: 'Recommendations',
    profile: 'Profile',
    settings: 'Settings',
    subscription: 'Subscription',
    support: 'Support'
  }
}