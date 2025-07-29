import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  ChartBarIcon, 
  ClockIcon, 
  AcademicCapIcon,
  CheckCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalTime: 0,
    averageScore: 0
  });

  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 새로 가입한 사용자는 진도가 0으로 시작
    setStats({
      totalCourses: 0,
      completedCourses: 0,
      totalLessons: 0,
      completedLessons: 0,
      totalTime: 0,
      averageScore: 0
    });
    
    setRecentCourses([]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            안녕하세요, {user?.name || '노무사'}님!
          </h1>
          <p className="mt-2 text-gray-600">
            오늘도 AI 교육을 통해 더 나은 노무 서비스를 제공해보세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">수강 중인 강의</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">완료한 강의</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 학습 시간</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTime}시간</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 점수</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}점</p>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 학습 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">최근 학습</h2>
            </div>
            <div className="p-6">
              {recentCourses.length > 0 ? (
                recentCourses.map((course) => (
                  <div key={course.id} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{course.title}</h3>
                      <span className="text-sm text-gray-500">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>다음 강의: {course.nextLesson}</p>
                      <p>마지막 접속: {course.lastAccessed}</p>
                    </div>
                    <Link 
                      to={`/courses/${course.id}`}
                      className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      계속하기
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">아직 수강한 강의가 없습니다</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    첫 번째 강의를 시작해보세요!
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/courses"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      강의 둘러보기
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">추천 강의</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AcademicCapIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-900">AI 도구 실무 활용</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    실제 노무 업무에서 AI 도구를 활용하는 방법을 배워보세요.
                  </p>
                  <Link 
                    to="/courses/3"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    강의 보기 →
                  </Link>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AcademicCapIcon className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium text-gray-900">근로기준법 AI 분석</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    AI를 활용한 근로기준법 케이스 분석 방법을 학습합니다.
                  </p>
                  <Link 
                    to="/courses/4"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    강의 보기 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 제작자 정보 */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                플랫폼 제작: 한동노무법인 박실로 노무사
              </p>
              <p className="text-xs text-gray-600 mt-1">
                노무사 업무의 디지털 혁신을 위한 AI 교육 플랫폼
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 