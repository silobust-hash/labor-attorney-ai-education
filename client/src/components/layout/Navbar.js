import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="flex items-center">
                    <span className="text-xl font-bold text-gray-800">노무사 AI교육 플랫폼</span>
                  </Link>
                </div>
                
                {/* 진짜 붓글씨체 문구 추가 */}
                <div className="hidden lg:block ml-8">
                  <span 
                    className="text-2xl font-bold transform -rotate-3 inline-block hover:rotate-1 transition-transform duration-300"
                    style={{ 
                      fontFamily: '"Ma Shan Zheng", "Brush Script MT", "Lucida Handwriting", "Segoe Print", "Bradley Hand", cursive',
                      background: 'linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '3px 3px 6px rgba(30,64,175,0.3), 1px 1px 2px rgba(59,130,246,0.5)',
                      letterSpacing: '1px',
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))',
                      fontSize: '22px',
                      fontWeight: '900',
                      transform: 'skew(-5deg, 0deg)',
                      textDecoration: 'none',
                      position: 'relative'
                    }}
                  >
                    내 마음대로 만들었어요 ㅎㅎ
                  </span>
                </div>
                
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <Link
                      to="/"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      홈
                    </Link>
                    <Link
                      to="/courses"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      강의
                    </Link>
                    <Link
                      to="/ai-tools"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      AI도구
                    </Link>
                  </div>
                </div>
              </div>
              <div className="hidden md:ml-6 md:flex md:items-center">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <a
                      href="/my-enrollments"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      수강신청 현황
                    </a>
                    {user.isAdmin && (
                      <Link
                        to="/admin"
                        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        관리자 대시보드
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      로그아웃
                    </button>
                    <UserCircleIcon className="h-8 w-8 text-gray-500" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      로그인
                    </Link>
                    <Link
                      to="/register"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      회원가입
                    </Link>
                  </div>
                )}
              </div>
              <div className="-mr-2 flex items-center md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* 모바일에서도 진짜 붓글씨체 문구 표시 */}
              <div className="text-center py-2">
                <span 
                  className="text-lg font-bold transform -rotate-2 inline-block"
                  style={{ 
                    fontFamily: '"Ma Shan Zheng", "Brush Script MT", "Lucida Handwriting", "Segoe Print", "Bradley Hand", cursive',
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '2px 2px 4px rgba(30,64,175,0.3), 1px 1px 2px rgba(59,130,246,0.4)',
                    letterSpacing: '0.8px',
                    filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))',
                    fontSize: '18px',
                    fontWeight: '800',
                    transform: 'skew(-3deg, 0deg)'
                  }}
                >
                  내 마음대로 만들었어요 ㅎㅎ
                </span>
              </div>
              
              <Disclosure.Button
                as={Link}
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                홈
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                to="/courses"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                강의
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                to="/ai-tools"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                AI도구
              </Disclosure.Button>
              {user && (
                <>
                  <Disclosure.Button
                    as={Link}
                    to="/my-enrollments"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    수강신청 현황
                  </Disclosure.Button>
                  {user.isAdmin && (
                    <Disclosure.Button
                      as={Link}
                      to="/admin"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      관리자 대시보드
                    </Disclosure.Button>
                  )}
                  <Disclosure.Button
                    as="button"
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    로그아웃
                  </Disclosure.Button>
                </>
              )}
              {!user && (
                <>
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    로그인
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
                  >
                    회원가입
                  </Disclosure.Button>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar; 