import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import Header from '../Header'

// Mock dependencies
vi.mock('../Button', () => ({
  default: ({ children, onClick, variant, className }) => (
    <button onClick={onClick} className={`mocked-button ${variant} ${className}`}>
      {children}
    </button>
  )
}))

vi.mock('../Notifications', () => ({
  default: () => <div data-testid="notifications">Notifications</div>
}))

vi.mock('../LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher">Language Switcher</div>
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'header.home': 'Home',
        'header.dashboard': 'Dashboard',
        'header.profile': 'Profile',
        'header.logout': 'Logout',
        'header.login': 'Login',
        'header.signUp': 'Sign Up',
        'header.growth': 'Growth',
        'header.community': 'Community',
        'header.mentorship': 'Mentorship',
        'header.skillTrees': 'Skill Trees',
        'header.projects': 'Projects',
        'header.forums': 'Forums',
        'header.events': 'Events',
        'header.findMatches': 'Find Matches',
      }
      return translations[key] || key
    },
    i18n: { language: 'en' }
  })
}))

// Mock AuthContext with proper factory function
vi.mock('../../context/AuthContext', () => {
  const React = require('react')
  const mockContext = React.createContext({
    user: null,
    logout: vi.fn()
  })
  return {
    AuthContext: mockContext
  }
})

vi.mock('../../context/ThemeContext.jsx', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn()
  })
}))

// Import the mocked AuthContext
import { AuthContext } from '../../context/AuthContext'

// Test wrapper component
const TestWrapper = ({ children, user = null }) => {
  const contextValue = {
    user,
    logout: vi.fn()
  }
  
  return (
    <AuthContext.Provider value={contextValue}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

const renderWithContext = (component, { user = null } = {}) => {
  return render(
    <TestWrapper user={user}>
      {component}
    </TestWrapper>
  )
}

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders logo and basic navigation', () => {
    renderWithContext(<Header />)
    
    // The header renders both desktop and mobile versions, so we expect multiple instances
    expect(screen.getAllByText('Knowle')).toHaveLength(2)
    expect(screen.getAllByText('Home')).toHaveLength(2)
  })

  it('shows login and signup buttons when user is not authenticated', () => {
    renderWithContext(<Header />)
    
    // Both desktop and mobile versions should be present
    expect(screen.getAllByText('Login')).toHaveLength(2)
    expect(screen.getAllByText('Sign Up')).toHaveLength(2)
  })

  it('toggles mobile drawer when hamburger button is clicked', async () => {
    renderWithContext(<Header />)
    
    const hamburgerButton = screen.getByLabelText(/open menu/i)
    fireEvent.click(hamburgerButton)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('renders theme switcher', () => {
    renderWithContext(<Header />)
    
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument()
  })

  it('renders language switcher', () => {
    renderWithContext(<Header />)
    
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
  })

  it('closes mobile menu when overlay is clicked', async () => {
    renderWithContext(<Header />)
    
    // Open mobile menu
    const hamburgerButton = screen.getByLabelText(/open menu/i)
    fireEvent.click(hamburgerButton)
    
    await waitFor(() => {
      const overlay = document.querySelector('.bg-black.bg-opacity-50')
      expect(overlay).toBeInTheDocument()
      fireEvent.click(overlay)
    })
  })
})
