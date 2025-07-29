import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PlayIcon, ClockIcon, CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  // YouTube URL을 embed 형식으로 변환하는 함수
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    console.log('🎬 원본 YouTube URL:', url);
    
    try {
      let videoId = null;
      
      // 다양한 YouTube URL 형식 처리
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
      } else if (url.includes('youtube.com/v/')) {
        videoId = url.split('/v/')[1].split('?')[0];
      } else {
        // URL에서 11자리 영숫자로 된 비디오 ID 추출 시도
        const match = url.match(/[a-zA-Z0-9_-]{11}/);
        if (match) {
          videoId = match[0];
        }
      }
      
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&enablejsapi=1&origin=${window.location.origin}`;
        console.log('✅ 변환된 embed URL:', embedUrl);
        return embedUrl;
      }
      
      console.log('❌ 비디오 ID를 추출할 수 없습니다:', url);
      return null;
    } catch (error) {
      console.error('❌ YouTube URL 변환 오류:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error('강의 로드 오류:', error);
        setError('강의를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollmentStatus = async () => {
      if (user && user.token) {
        try {
          const response = await axios.get(`/api/enrollments/status/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setEnrollmentStatus(response.data.status);
        } catch (error) {
          console.error('수강신청 상태 확인 오류:', error);
        }
      }
    };

    fetchCourse();
    checkEnrollmentStatus();
  }, [id, user]);

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

  // 강의 접근 권한 확인
  const canAccessCourse = () => {
    if (!course) return false;
    
    // 무료 강의라면 누구나 접근 가능
    if (course.is_free) return true;
    
    // 유료 강의라면 로그인 + 승인된 수강신청이 필요
    if (!user) return false;
    
    return enrollmentStatus === 'approved';
  };

  // 수강신청 하기
  const handleEnrollment = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (enrolling) return;

    setEnrolling(true);
    try {
      const response = await axios.post('/api/enrollments', 
        { course_id: id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      alert(response.data.message);
      
      // 수강신청 상태 다시 확인
      const statusResponse = await axios.get(`/api/enrollments/status/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setEnrollmentStatus(statusResponse.data.status);

    } catch (error) {
      console.error('수강신청 오류:', error);
      alert(error.response?.data?.error || '수강신청 중 오류가 발생했습니다.');
    } finally {
      setEnrolling(false);
    }
  };

  // 학습 목록에 추가하기
  const handleAddToWishlist = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (addingToWishlist) return;

    setAddingToWishlist(true);
    try {
      const response = await axios.post('/api/enrollments/wishlist', 
        { course_id: id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      alert(response.data.message);

    } catch (error) {
      console.error('학습 목록 추가 오류:', error);
      alert(error.response?.data?.error || '학습 목록 추가 중 오류가 발생했습니다.');
    } finally {
      setAddingToWishlist(false);
    }
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

  if (error || !course) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error || '강의를 찾을 수 없습니다.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {/* Thumbnail 표시 (YouTube URL이 없는 경우에만) */}
              {!course.video_url && course.thumbnail && (
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                {course.title}
              </h1>
              
              <p className="text-secondary-600 mb-6">
                {course.description}
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-secondary-500">
                <span className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {formatDuration(course.duration)}
                </span>
                <span className="badge badge-primary">
                  {getDifficultyText(course.difficulty)}
                </span>
                <span>{course.category}</span>
                <span>강사: {course.created_by?.name || '알 수 없음'}</span>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                강의 내용
              </h2>
              
              <div className="space-y-6">
                {/* YouTube 동영상이나 업로드된 비디오가 있는 경우 */}
                {course.video_url ? (
                  <div className="border border-secondary-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-secondary-50 border-b border-secondary-200">
                      <h3 className="text-lg font-semibold text-secondary-900">
                        1. {course.title}
                      </h3>
                      <p className="text-secondary-600 text-sm mt-1">
                        {course.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-secondary-500 mt-2">
                        <span className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {formatDuration(course.duration)}
                        </span>
                        {course.video_url && (course.video_url.includes('youtube.com') || course.video_url.includes('youtu.be')) && (
                          <span className="flex items-center text-red-600">
                            <PlayIcon className="w-3 h-3 mr-1" />
                            YouTube
                          </span>
                        )}
                        {course.video_url && !course.video_url.includes('youtube.com') && !course.video_url.includes('youtu.be') && (
                          <span className="flex items-center text-blue-600">
                            <PlayIcon className="w-3 h-3 mr-1" />
                            동영상 파일
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* 강의 내용 = YouTube 영상 */}
                    <div className="p-0">
                      {canAccessCourse() ? (
                        // 접근 권한이 있는 경우 - 실제 강의 영상 표시
                        course.video_url ? (
                          course.video_url.includes('youtube.com') || course.video_url.includes('youtu.be') ? (
                            // YouTube 영상인 경우
                            <div className="w-full h-64 md:h-96 bg-black rounded-lg overflow-hidden relative">
                              {/* 소리 안내 메시지 */}
                              <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-black text-xs px-2 py-1 rounded opacity-75">
                                🔊 소리가 안 들리면 영상을 클릭해보세요
                              </div>
                              {getYouTubeEmbedUrl(course.video_url) ? (
                                <iframe
                                  src={getYouTubeEmbedUrl(course.video_url)}
                                  title={course.title}
                                  className="w-full h-full"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; microphone; camera"
                                  allowFullScreen
                                  referrerPolicy="strict-origin-when-cross-origin"
                                ></iframe>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white">
                                  <div className="text-center">
                                    <PlayIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
                                    <p className="text-lg mb-2">YouTube 영상을 로드할 수 없습니다</p>
                                    <p className="text-sm text-gray-300">URL: {course.video_url}</p>
                                    <a 
                                      href={course.video_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-block mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                    >
                                      YouTube에서 직접 보기
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            // 일반 동영상 파일인 경우
                            <div className="w-full h-64 md:h-96 bg-black rounded-lg overflow-hidden">
                              <video 
                                src={course.video_url} 
                                controls
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('❌ 비디오 로드 오류:', e);
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              >
                                브라우저가 비디오를 지원하지 않습니다.
                              </video>
                              <div className="w-full h-full hidden items-center justify-center text-white">
                                <div className="text-center">
                                  <PlayIcon className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                                  <p className="text-lg mb-2">동영상을 로드할 수 없습니다</p>
                                  <p className="text-sm text-gray-300">파일 형식이나 경로를 확인하세요</p>
                                </div>
                              </div>
                            </div>
                          )
                                                  ) : (
                            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                              <div className="text-center text-gray-500">
                                <PlayIcon className="w-16 h-16 mx-auto mb-2" />
                                <p>동영상이 등록되지 않았습니다</p>
                              </div>
                            </div>
                          )
                      ) : (
                        // 접근 권한이 없는 경우 - 접근 제한 메시지
                        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-600">
                            <LockClosedIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            {course.is_free ? (
                              <div>
                                <p className="text-lg font-medium mb-2">로그인이 필요합니다</p>
                                <p className="text-sm">이 강의를 시청하려면 로그인하세요.</p>
                              </div>
                            ) : !user ? (
                              <div>
                                <p className="text-lg font-medium mb-2">수강신청이 필요합니다</p>
                                <p className="text-sm">이 강의는 수강신청 후 관리자 승인을 받아야 시청할 수 있습니다.</p>
                                <p className="text-sm mt-1">먼저 로그인하세요.</p>
                              </div>
                            ) : enrollmentStatus === 'pending' ? (
                              <div>
                                <p className="text-lg font-medium mb-2">승인 대기 중</p>
                                <p className="text-sm">수강신청이 승인되면 강의를 시청할 수 있습니다.</p>
                              </div>
                            ) : enrollmentStatus === 'rejected' ? (
                              <div>
                                <p className="text-lg font-medium mb-2">수강신청이 거절되었습니다</p>
                                <p className="text-sm">관리자에게 문의하세요.</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-lg font-medium mb-2">수강신청이 필요합니다</p>
                                <p className="text-sm">이 강의는 수강신청 후 관리자 승인을 받아야 시청할 수 있습니다.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : course.course_sections && course.course_sections.length > 0 ? (
                  /* 기존 섹션 기반 강의 내용 */
                  course.course_sections.map((section, sectionIndex) => (
                    <div key={section.id} className="border border-secondary-200 rounded-lg">
                      <div className="p-4 bg-secondary-50 border-b border-secondary-200">
                        <h3 className="text-lg font-semibold text-secondary-900">
                          {sectionIndex + 1}. {section.title}
                        </h3>
                        <p className="text-secondary-600 text-sm mt-1">
                          {section.description}
                        </p>
                      </div>
                      
                      <div className="p-4">
                        {section.lessons && section.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-b-0">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-secondary-500 w-8">
                                {sectionIndex + 1}.{lessonIndex + 1}
                              </span>
                              <div>
                                <h4 className="text-secondary-900 font-medium">
                                  {lesson.title}
                                </h4>
                                <div className="flex items-center space-x-4 text-sm text-secondary-500 mt-1">
                                  <span className="flex items-center">
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    {formatDuration(lesson.duration)}
                                  </span>
                                  {lesson.is_free && (
                                    <span className="badge badge-success text-xs">무료</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {lesson.is_free ? (
                                <button className="btn-primary text-sm px-4 py-2">
                                  <PlayIcon className="w-4 h-4 mr-1" />
                                  시청하기
                                </button>
                              ) : (
                                <span className="text-secondary-400 text-sm">
                                  로그인 필요
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-secondary-500">
                    <p>아직 강의 내용이 등록되지 않았습니다.</p>
                    <p className="text-sm mt-2">관리자 대시보드에서 YouTube URL 또는 동영상 파일을 업로드하세요.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                강의 정보
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-secondary-600">총 강의 시간</span>
                  <span className="font-medium">{formatDuration(course.duration)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-secondary-600">난이도</span>
                  <span className="font-medium">{getDifficultyText(course.difficulty)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-secondary-600">카테고리</span>
                  <span className="font-medium">{course.category}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-secondary-600">강사</span>
                  <span className="font-medium">{course.created_by?.name || '알 수 없음'}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <button 
                  onClick={handleEnrollment}
                  disabled={enrolling || enrollmentStatus === 'approved'}
                  className={`btn-primary w-full mb-3 ${enrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <PlayIcon className="w-4 h-4 mr-2" />
                  {enrolling ? '신청 중...' : 
                   enrollmentStatus === 'approved' ? '수강 중' :
                   enrollmentStatus === 'pending' ? '승인 대기 중' :
                   enrollmentStatus === 'rejected' ? '수강신청 거절됨' :
                   '강의 수강 신청'}
                </button>
                
                <button 
                  onClick={handleAddToWishlist}
                  disabled={addingToWishlist}
                  className={`btn-outline w-full ${addingToWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  {addingToWishlist ? '추가 중...' : '학습 목록에 추가'}
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <h4 className="text-sm font-medium text-secondary-900 mb-3">
                  강의 정보
                </h4>
                <p className="text-sm text-secondary-400">
                  강의에 대한 자세한 정보를 확인하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail; 