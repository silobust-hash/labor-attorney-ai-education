import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });

  useEffect(() => {
    // 실제 데이터베이스에서 강의 목록 가져오기
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/courses');
        console.log('📚 가져온 강의 목록:', response.data);
        setCourses(response.data || []);
      } catch (error) {
        console.error('❌ 강의 목록 가져오기 실패:', error);
        setCourses([]); // 오류 시 빈 배열로 설정
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const categories = ['전체', 'AI 기초', '문서 자동화', '법률 조사', '리스크 분석'];
  const difficulties = ['전체', '초급', '중급', '고급'];

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const getDifficultyText = (difficulty) => {
    const difficultyMap = {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급'
    };
    return difficultyMap[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty) => {
    const colorMap = {
      beginner: 'badge-success',
      intermediate: 'badge-warning',
      advanced: 'badge-danger'
    };
    return colorMap[difficulty] || 'badge-secondary';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">강의를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            AI 교육 강의
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            노무사 업무에 특화된 AI 교육 과정을 통해 새로운 역량을 키워보세요.
            체계적인 커리큘럼과 실무 중심의 교육으로 업무 효율성을 높일 수 있습니다.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                검색
              </label>
              <input
                type="text"
                placeholder="강의 제목 또는 설명으로 검색"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                카테고리
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="input-field"
              >
                {categories.map(category => (
                  <option key={category} value={category === '전체' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                난이도
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                className="input-field"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty === '전체' ? '' : difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ category: '', difficulty: '', search: '' })}
                className="btn-secondary w-full"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <img 
                src={course.thumbnail || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop'} 
                alt={course.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop';
                }}
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
                      {getDifficultyText(course.difficulty)}
                    </span>
                    <span className={`badge ${course.is_free ? 'badge-success' : 'badge-primary'}`}>
                      {course.is_free ? '무료' : '승인필요'}
                    </span>
                  </div>
                  <span className="text-secondary-500 text-sm flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {formatDuration(course.duration)}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  {course.title}
                </h3>
                
                <p className="text-secondary-600 mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-secondary-500">
                    {course.category}
                  </span>
                  <span className="text-sm text-secondary-500">
                    {course.created_by?.name || '한동노무법인'}
                  </span>
                </div>
                
                <Link
                  to={`/courses/${course.id}`}
                  className="btn-primary w-full text-center flex items-center justify-center"
                >
                  <PlayIcon className="w-4 h-4 mr-2" />
                  자세히 보기
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-secondary-400" />
            <h3 className="mt-2 text-sm font-medium text-secondary-900">강의가 없습니다</h3>
            <p className="mt-1 text-sm text-secondary-500">
              현재 등록된 강의가 없습니다. 나중에 다시 확인해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses; 