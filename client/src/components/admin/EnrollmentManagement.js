import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [enrollmentsRes, statsRes] = await Promise.all([
        axios.get('/api/admin/enrollments', {
          headers: { 'admin-password': 'admin123' }
        }),
        axios.get('/api/admin/enrollments/stats', {
          headers: { 'admin-password': 'admin123' }
        })
      ]);
      
      setEnrollments(enrollmentsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (enrollmentId, status) => {
    try {
      const response = await axios.put(`/api/admin/enrollments/${enrollmentId}/status`, {
        status
      }, {
        headers: { 'admin-password': 'admin123' }
      });
      
      alert(response.data.message);
      loadData();
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">전체 신청</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">대기중</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">승인됨</div>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">거부됨</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </div>
      </div>

      {/* 수강신청 목록 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">수강신청 목록</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  신청자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  강의
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  신청일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  승인자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.user?.name || '알 수 없음'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.user?.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        {enrollment.user?.license_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.course?.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.course?.category}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(enrollment.enrolled_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(enrollment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.approver?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {enrollment.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleStatusChange(enrollment.id, 'approved')}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleStatusChange(enrollment.id, 'rejected')}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          거부
                        </button>
                      </div>
                    )}
                    {enrollment.status !== 'pending' && (
                      <span className="text-gray-400">처리완료</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {enrollments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              수강신청이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentManagement; 