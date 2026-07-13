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
    { name: 'Clothing', path: '/products?category=clothing' },
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
    <>
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 bg-primary/95 backdrop-blur-md h-[68px] flex items-center border-b',
        isScrolled ? 'border-white/15' : 'border-white/[0.07]'
      )}
    >
      <Container>
        <div className="flex items-center justify-between gap-6">
          {/* Left: Logo */}
          <Link to="/" className="inline-flex shrink-0 transition-opacity duration-300 hover:opacity-80">
            <AurexivaLogo iconClassName="h-7" textClassName="text-[14px]" />
          </Link>

          {/* Right: Category Links + Search, Cart, Login / Profile Actions */}
          <div className="flex items-center gap-8 xl:gap-10">
            <nav className="hidden lg:flex items-center gap-8 xl:gap-9">
              {categories.map((cat) => {
                const active = isLinkActive(cat.path)
                return (
                  <Link
                    key={cat.name}
                    to={cat.path}
                    className={cn(
                      'relative py-1 text-[11px] font-medium tracking-[0.16em] uppercase transition-colors duration-300 select-none whitespace-nowrap after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-accent after:transition-all after:duration-300 after:ease-out',
                      active
                        ? 'text-white after:w-full'
                        : 'text-white/50 hover:text-white after:w-0 hover:after:w-full'
                    )}
                  >
                    {cat.name}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-1 sm:gap-5">
              {/* Desktop Search Button */}
              <button
                onClick={() => navigate('/products')}
                className="p-2 text-white/60 hover:text-accent transition-colors duration-200 cursor-pointer"
                aria-label="Search Catalog"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>

              {/* Profile */}
              <Link
                to={user ? '/profile' : '/login'}
                className="p-2 text-white/60 hover:text-accent transition-colors duration-200"
                aria-label={user ? 'Profile' : 'Sign In'}
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Link>

              {/* Cart Link with Badge */}
              <Link
                to="/cart"
                className="p-2 text-white/60 hover:text-accent transition-colors duration-200 relative"
                aria-label="Cart"
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {totalCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-[15px] w-[15px] rounded-full bg-accent text-[9px] font-semibold text-primary flex items-center justify-center">
                    {totalCount > 9 ? '9+' : totalCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white/60 hover:text-accent transition-colors duration-200 lg:hidden cursor-pointer"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </header>

      {/* Mobile Drawer Overlay — rendered outside <header> deliberately: the
          header's backdrop-blur creates a new containing block for
          position:fixed descendants, which would confine this drawer's
          `bottom-0` to the header's own height instead of the viewport. */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-[68px] bottom-0 z-40 bg-primary border-t border-white/10 animate-fadeIn lg:hidden flex flex-col p-6">
          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-8">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-xs tracking-wide text-white placeholder:text-white/40 focus:outline-none focus:border-accent rounded-sm"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" strokeWidth={1.5} />
          </form>

          {/* Mobile navigation links */}
          <nav className="flex flex-col gap-6 text-left">
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/40 select-none">
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
                    'text-sm font-medium tracking-[0.12em] uppercase border-b border-white/10 pb-2 transition-colors duration-200',
                    active ? 'text-white' : 'text-white/55'
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
                  className="w-full text-center border border-white/25 py-2.5 text-xs font-medium tracking-[0.12em] uppercase text-white hover:bg-white hover:text-primary transition-all duration-300 rounded-sm"
                >
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-xs font-medium tracking-[0.12em] uppercase text-white/55 hover:text-error transition-colors duration-300 py-2.5 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center border border-white/25 py-2.5 text-xs font-medium tracking-[0.12em] uppercase text-white hover:bg-white hover:text-primary transition-all duration-300 rounded-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}
