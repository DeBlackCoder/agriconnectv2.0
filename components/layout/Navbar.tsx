'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart, User, Search, Sprout, LayoutDashboard, UserCircle, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    // Check if user is signed in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        setIsSignedIn(response.ok);
      } catch (error) {
        setIsSignedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsSignedIn(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-700 transition-colors">
                <Sprout className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">AgriConnect</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Link
                href="/products"
                className="flex items-center gap-2 text-gray-700 font-medium hover:text-green-600 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Marketplace</span>
              </Link>
              {isSignedIn && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-gray-700 font-medium hover:text-green-600 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-gray-700 font-medium hover:text-green-600 transition-colors"
                  >
                    <UserCircle className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>
              
              {isSignedIn && (
                <Link
                  href="/cart"
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              )}
              
              {!isLoading && (
                isSignedIn ? (
                  <button
                    onClick={() => setShowSignOutModal(true)}
                    className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button className="bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )
              )}
            </div>

            {/* Mobile Actions - Cart + Menu */}
            <div className="lg:hidden flex items-center gap-2">
              {isSignedIn && (
                <Link
                  href="/cart"
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              )}
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6 text-gray-900" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 animate-slideDown">
              <div className="flex flex-col gap-4">
                <Link
                  href="/products"
                  className="flex items-center gap-2 text-gray-700 font-medium hover:text-green-600 transition-colors py-2 animate-fadeInUp"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ animationDelay: '0.1s' }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Marketplace</span>
                </Link>
                {isSignedIn && (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-gray-700 font-medium hover:text-green-600 transition-colors py-2 animate-fadeInUp"
                      onClick={() => setIsMenuOpen(false)}
                      style={{ animationDelay: '0.2s' }}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-gray-700 font-medium hover:text-green-600 transition-colors py-2 animate-fadeInUp"
                      onClick={() => setIsMenuOpen(false)}
                      style={{ animationDelay: '0.3s' }}
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </>
                )}
                
                {!isLoading && (
                  <div className="pt-4 border-t border-gray-200 flex flex-col gap-2 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                    {isSignedIn ? (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowSignOutModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 py-2.5 rounded-lg font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <>
                        <Link href="/auth/login">
                          <Button className="w-full bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 py-2.5 rounded-lg font-medium">
                            Login
                          </Button>
                        </Link>
                        <Link href="/auth/register">
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium">
                            Get Started
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to log in again to access your account."
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        variant="warning"
        icon="logout"
      />
    </>
  );
}
