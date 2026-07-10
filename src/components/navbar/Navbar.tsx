import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Menu, X, Search, LogOut } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { AurexivaLogo } from '@/components/common/AurexivaLogo'
import { useScroll } from '@/hooks/useScroll'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { cn } from '@/utils/cn'

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const isScrolled = useScroll(10)
  const { user, signOut } = useAuth()
  const { totalCount } = useCart()

  const handleLogout = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  const categories = [
    { name: 'Home', path: '/' },
    { name: 'Footwear', path: '/products?category=footwear' },
    { name: 'Kids Clothing', path: '/products?category=kids-clothing' },
    { name: 'Electronics', path: '/products?category=electronics' },
  ]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setIsMobileMenuOpen(false)
    }
  }

  // Parameter-aware active route checking for exact indicator underline matching
  const isLinkActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    if (location.pathname === '/products') {
      const searchParams = new URLSearchParams(location.search)
      const category = searchParams.get('category')
      const targetParams = new URLSearchParams(path.split('?')[1] || '')
      const targetCategory = targetParams.get('category')
      return category === targetCategory
    }
    return false
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 bg-white h-[88px] flex items-center border-b border-[#EAEAEA]',
        isScrolled ? 'shadow-[0_10px_30px_rgba(0,0,0,0.025)] border-b-[#EAEAEA]/30' : 'shadow-none'
      )}
    >
      <Container>
        <div className="flex items-center justify-between gap-4">
          {/* Logo Brand Mark */}
          <div className="flex-1 lg:flex-initial">
            <Link to="/" className="inline-block transition-transform duration-300 hover:scale-[1.01]">
              <AurexivaLogo width={38} height={38} showText={true} />
            </Link>
          </div>

          {/* Desktop Categories Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {categories.map((cat) => {
              const active = isLinkActive(cat.path)
              return (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className={cn(
                    'relative py-1 text-xs font-semibold tracking-wider uppercase transition-colors duration-300 select-none whitespace-nowrap after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 after:ease-out',
                    active
                      ? 'text-primary after:w-full'
                      : 'text-secondary hover:text-primary after:w-0 hover:after:w-full'
                  )}
                >
                  {cat.name}
                </Link>
              )
            })}
          </nav>

          {/* Search, Cart, Login / Profile Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-6 flex-1 lg:flex-initial">
            {/* Desktop Search Button */}
            <button
              onClick={() => navigate('/products')}
              className="p-2 text-primary hover:text-accent transition-colors duration-200 cursor-pointer"
              aria-label="Search Catalog"
            >
              <Search className="h-[20px] w-[20px]" />
            </button>

            {/* Profile */}
            <Link
              to={user ? '/profile' : '/login'}
              className="p-2 text-primary hover:text-accent transition-colors duration-200"
              aria-label={user ? 'Profile' : 'Sign In'}
            >
              <User className="h-[20px] w-[20px]" />
            </Link>

            {/* Cart Link with Badge */}
            <Link
              to="/cart"
              className="p-2 text-primary hover:text-accent transition-colors duration-200 relative"
              aria-label="Cart"
            >
              <ShoppingBag className="h-[20px] w-[20px]" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-[16px] w-[16px] rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center border border-white">
                  {totalCount > 9 ? '9+' : totalCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-primary hover:text-accent transition-colors duration-200 lg:hidden cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 bg-background border-t border-border-custom animate-fadeIn lg:hidden flex flex-col p-6">
          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-8">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-border-custom bg-white py-2.5 pl-10 pr-4 text-xs tracking-wide focus:outline-none focus:border-primary rounded-sm"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-secondary/40" />
          </form>

          {/* Mobile navigation links */}
          <nav className="flex flex-col gap-6 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary/40 select-none">
              Categories
            </span>
            {categories.map((cat) => {
              const active = isLinkActive(cat.path)
              return (
                <Link
                  key={cat.name}
                  to={cat.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'text-sm font-semibold tracking-wider uppercase border-b border-border-custom/50 pb-2 transition-colors duration-200',
                    active ? 'text-primary font-bold' : 'text-secondary'
                  )}
                >
                  {cat.name}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center border border-primary py-2.5 text-xs font-semibold tracking-wider uppercase text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-sm"
                >
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-secondary hover:text-error transition-colors duration-300 py-2.5 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center border border-primary py-2.5 text-xs font-semibold tracking-wider uppercase text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
