import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, PlayIcon, AcademicCapIcon, ChartBarIcon, CheckCircleIcon, StarIcon, ScaleIcon } from '@heroicons/react/24/outline';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
        {/* 복잡한 배경 패턴 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(59,130,246,0.05)_50%,transparent_70%)]"></div>
        </div>

        {/* 그리드 패턴 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            {/* 로고 및 브랜딩 - 더 현대적인 디자인 */}
            <div className="mb-12">
              <div className="relative inline-block">
                {/* 모던한 법률 아이콘 - 저울 */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <ScaleIcon className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur-xl"></div>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md mx-auto border border-white/20 shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">한동노무법인</h2>
                <p className="text-blue-200 text-xl font-medium">박실로 노무사</p>
              </div>
            </div>

            {/* 메인 타이틀 - 더 임팩트 있는 타이포그래피 */}
            <h1 className="text-6xl lg:text-8xl font-black text-white mb-8 leading-none tracking-tight">
              노무사 <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI교육</span> 플랫폼
            </h1>
            
            <p className="text-2xl lg:text-3xl text-blue-100 mb-6 max-w-5xl mx-auto leading-relaxed font-light">
              현업 노무사들을 위한 전문 AI 강의 플랫폼
            </p>
            <p className="text-lg lg:text-xl text-blue-200/80 mb-16 max-w-3xl mx-auto">
              실무에 바로 적용할 수 있는 노하우를 배우세요
            </p>

            {/* CTA 버튼들 - 더 세련된 디자인 */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                to="/courses"
                className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-4 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <PlayIcon className="h-7 w-7 relative z-10" />
                <span className="relative z-10">강의 시작하기</span>
                <ArrowRightIcon className="h-6 w-6 group-hover:translate-x-2 transition-transform relative z-10" />
              </Link>
              
              <Link
                to="/ai-tools"
                className="group relative bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 hover:border-white/50 px-10 py-5 rounded-2xl text-xl font-bold transition-all duration-300 flex items-center justify-center gap-4 transform hover:scale-105"
              >
                <ChartBarIcon className="h-7 w-7" />
                <span>AI 도구 소개</span>
                <ArrowRightIcon className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            {/* 신뢰도 지표 */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-blue-200/60">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <span className="text-sm font-medium">전문 노무사 강의</span>
              </div>
              <div className="flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span className="text-sm font-medium">실무 중심 교육</span>
              </div>
              <div className="flex items-center gap-2">
                <PlayIcon className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium">온라인 학습</span>
              </div>
            </div>
          </div>
        </div>

        {/* 장식적 요소들 - 더 복잡하고 아름다운 애니메이션 */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-500"></div>
      </section>

      {/* Features Section - 더 모던한 카드 디자인 */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">
              실무 중심의 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI 교육</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              노무사 업무에 특화된 AI 도구 활용법을 배우고 업무 효율성을 극대화하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                  <AcademicCapIcon className="h-12 w-12 text-blue-600" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">전문 강의</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                노무사 실무에 필요한 AI 활용법을 체계적으로 학습할 수 있는 전문 강의를 제공합니다.
              </p>
            </div>

            <div className="group text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 transform hover:-translate-y-2">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-green-100 to-green-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                  <ChartBarIcon className="h-12 w-12 text-green-600" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">실무 적용</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                이론이 아닌 실제 업무에 바로 적용할 수 있는 실용적인 AI 도구 활용법을 배웁니다.
              </p>
            </div>

            <div className="group text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                  <PlayIcon className="h-12 w-12 text-purple-600" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">온라인 학습</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                언제 어디서나 편리하게 학습할 수 있는 온라인 플랫폼을 통해 효율적으로 공부하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - 더 드라마틱한 디자인 */}
      <section className="relative py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight">
            지금 바로 시작하세요
          </h2>
          <p className="text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            노무사 업무의 디지털 혁신을 경험해보세요
          </p>
          <Link
            to="/courses"
            className="group inline-flex items-center gap-4 bg-white text-blue-600 px-12 py-6 rounded-2xl text-2xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-2xl transform hover:scale-105"
          >
            <PlayIcon className="h-8 w-8" />
            <span>강의 둘러보기</span>
            <ArrowRightIcon className="h-7 w-7 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer - 더 깔끔하고 모던한 디자인 */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* 푸터에도 모던한 아이콘 적용 */}
            <div className="inline-block mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ScaleIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-3 tracking-tight">노무사 AI교육 플랫폼</h3>
            <p className="text-gray-400 mb-8 text-xl">한동노무법인 박실로 노무사</p>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mx-auto mb-8"></div>
            <p className="text-gray-500 text-sm">
              © 2025 노무사 AI교육 플랫폼. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 