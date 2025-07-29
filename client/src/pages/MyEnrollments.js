import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const MyEnrollments = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEnrollments = useCallback(async () => {
    try {
      const response = await axios.get('/api/enrollments/my', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setEnrollments(response.data.enrollments);
    } catch (error) {
      console.error('수강신청 현황 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadEnrollments();
    }
  }, [user, loadEnrollments]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: '대기중', color: 'bg-yellow-100 text-yellow-800' },
      approved: { text: '승인됨', color: 'bg-green-100 text-green-800' },
      rejected: { text: '거부됨', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return '관리자 승인을 기다리고 있습니다.';
      case 'approved':
        return '수강신청이 승인되었습니다. 강의를 수강할 수 있습니다.';
      case 'rejected':
        return '수강신청이 거부되었습니다.';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">수강신청 현황을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">내 수강신청 현황</h1>
          <p className="mt-2 text-gray-600">
            신청한 강의의 승인 상태를 확인할 수 있습니다.
          </p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">수강신청이 없습니다</h3>
            <p className="text-gray-500 mb-4">
              아직 신청한 강의가 없습니다. 강의 목록에서 원하는 강의를 찾아 신청해보세요.
            </p>
            <a
              href="/courses"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              강의 목록 보기
            </a>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <li key={enrollment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={enrollment.course?.thumbnail || '/default-course.jpg'}
                            alt={enrollment.course?.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              {enrollment.course?.title}
                            </h3>
                            <div className="ml-2">
                              {getStatusBadge(enrollment.status)}
                            </div>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>{enrollment.course?.category}</span>
                            <span className="mx-2">•</span>
                            <span>{enrollment.course?.duration}분</span>
                            <span className="mx-2">•</span>
                            <span>신청일: {new Date(enrollment.enrolled_at).toLocaleDateString('ko-KR')}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {getStatusMessage(enrollment.status)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {enrollment.status === 'approved' && (
                          <a
                            href={`/courses/${enrollment.course?.id}`}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            강의 보기
                          </a>
                        )}
                        {enrollment.status === 'rejected' && (
                          <button
                            disabled
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed"
                          >
                            재신청 불가
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEnrollments; 