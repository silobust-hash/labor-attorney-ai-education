import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import EnrollmentManagement from '../components/admin/EnrollmentManagement';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  
  // 강의 관리 상태
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
              title: '',
          description: '',
          category: '',
          difficulty: 'beginner',
          duration: 0,
          price: 0,
          learning_objectives: [],
          videoFile: null,
          thumbnailFile: null,
                    youtube_url: '',
          is_free: false
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [learningObjective, setLearningObjective] = useState('');
  
  // AI 도구 관리 상태
  const [aiTools, setAiTools] = useState([]);
  const [showAddAiTool, setShowAddAiTool] = useState(false);
  const [showEditAiTool, setShowEditAiTool] = useState(false);
  const [newAiTool, setNewAiTool] = useState({
    name: '',
    description: '',
    category: '',
    advantages: '',
    disadvantages: '',
    practical_usage: '',
    imageFile: null
  });
  const [editingAiTool, setEditingAiTool] = useState(null);

  // 인증 및 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // 관리자 인증
  const authenticateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/api/admin/auth', { adminPassword });
      if (response.data.success) {
        setIsAuthenticated(true);
        setAdminPassword('');
      } else {
        alert('잘못된 관리자 비밀번호입니다.');
      }
    } catch (error) {
      alert('인증에 실패했습니다. 비밀번호를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  // 데이터 로드
  const loadData = async () => {
    try {
      const [coursesRes, usersRes, aiToolsRes] = await Promise.all([
        axios.get('/api/admin/courses', {
          headers: { 'admin-password': 'admin123' }
        }),
        axios.get('/api/admin/users', {
          headers: { 'admin-password': 'admin123' }
        }),
        axios.get('/api/admin/ai-tools', {
          headers: { 'admin-password': 'admin123' }
        })
      ]);
      
      setCourses(coursesRes.data);
      setUsers(usersRes.data);
      setAiTools(aiToolsRes.data);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    }
  };

  // 로그아웃
  const logoutAdmin = () => {
    setIsAuthenticated(false);
    setAdminPassword('');
    setActiveTab('courses');
  };

  // 강의 추가
  const addCourse = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newCourse.title);
      formData.append('description', newCourse.description);
      formData.append('category', newCourse.category);
      formData.append('difficulty', newCourse.difficulty);
      formData.append('duration', newCourse.duration);
      formData.append('price', newCourse.price);
      formData.append('youtube_url', newCourse.youtube_url);
      formData.append('is_free', newCourse.is_free);
      
      // 학습 목표 추가
      newCourse.learning_objectives.forEach((objective, index) => {
        formData.append(`learning_objectives[${index}]`, objective);
      });
      
      // 파일 추가
      if (newCourse.videoFile) {
        formData.append('video', newCourse.videoFile);
      }
      if (newCourse.thumbnailFile) {
        formData.append('thumbnail', newCourse.thumbnailFile);
      }
      
      const response = await axios.post('/api/admin/courses', formData, {
        headers: { 
          'admin-password': 'admin123',
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data) {
        // 강의 목록 새로고침
        await loadData();
        setNewCourse({
          title: '',
          description: '',
          category: '',
          difficulty: 'beginner',
          duration: 0,
          price: 0,
          learning_objectives: [],
          videoFile: null,
          thumbnailFile: null,
          youtube_url: ''
        });
        setShowAddCourse(false);
        alert('강의가 성공적으로 추가되었습니다.');
      }
    } catch (error) {
      console.error('강의 추가 오류:', error);
      alert('강의 추가에 실패했습니다.');
    }
  };

  // 강의 수정
  const saveEditCourse = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', editingCourse.title);
      formData.append('description', editingCourse.description);
      formData.append('category', editingCourse.category);
      formData.append('difficulty', editingCourse.difficulty);
      formData.append('duration', editingCourse.duration);
      formData.append('price', editingCourse.price);
      formData.append('youtube_url', editingCourse.youtube_url || '');
      formData.append('is_free', editingCourse.is_free || false);
      
      // 학습 목표 추가
      (editingCourse.learning_objectives || []).forEach((objective, index) => {
        formData.append(`learning_objectives[${index}]`, objective);
      });
      
      // 파일 추가
      if (editingCourse.videoFile) {
        formData.append('video', editingCourse.videoFile);
      }
      if (editingCourse.thumbnailFile) {
        formData.append('thumbnail', editingCourse.thumbnailFile);
      }
      
      const response = await axios.put(`/api/admin/courses/${editingCourse.id}`, formData, {
        headers: { 
          'admin-password': 'admin123',
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data) {
        // 강의 목록 새로고침
        await loadData();
        setEditingCourse(null);
        setShowEditCourse(false);
        alert('강의가 성공적으로 수정되었습니다.');
      }
    } catch (error) {
      console.error('강의 수정 오류:', error);
      alert('강의 수정에 실패했습니다.');
    }
  };

  // 강의 삭제
  const deleteCourse = async (id) => {
    if (!window.confirm('정말 이 강의를 삭제하시겠습니까?')) return;
    
    try {
      console.log('🗑️ 강의 삭제 요청:', id);
      
      const response = await axios.delete(`/api/admin/courses/${id}`, {
        headers: { 'admin-password': 'admin123' }
      });
      
      console.log('✅ 강의 삭제 응답:', response.data);
      
      // 강의 목록에서 제거
      setCourses(courses.filter(c => c.id !== id));
      alert(response.data.message || '강의가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('❌ 강의 삭제 오류:', error);
      const errorMessage = error.response?.data?.error || '강의 삭제에 실패했습니다.';
      const errorDetails = error.response?.data?.details;
      alert(errorDetails ? `${errorMessage}\n상세: ${errorDetails}` : errorMessage);
    }
  };

  // 강의 발행/취소
  const toggleCoursePublish = async (courseId, currentStatus) => {
    try {
      const response = await axios.put(`/api/admin/courses/${courseId}/publish`, {
        is_published: !currentStatus
      }, {
        headers: { 'admin-password': 'admin123' }
      });
      
      if (response.data.success) {
        setCourses(courses.map(course => 
          course.id === courseId 
            ? { ...course, is_published: !currentStatus }
            : course
        ));
        alert(currentStatus ? '강의가 비공개되었습니다.' : '강의가 공개되었습니다.');
      }
    } catch (error) {
      console.error('강의 발행 상태 변경 오류:', error);
      alert('강의 발행 상태 변경에 실패했습니다.');
    }
  };

  // 학습 목표 추가
  const addLearningObjective = () => {
    if (learningObjective.trim()) {
      if (showAddCourse) {
        setNewCourse({
          ...newCourse,
          learning_objectives: [...newCourse.learning_objectives, learningObjective.trim()]
        });
      } else if (showEditCourse) {
        setEditingCourse({
          ...editingCourse,
          learning_objectives: [...(editingCourse.learning_objectives || []), learningObjective.trim()]
        });
      }
      setLearningObjective('');
    }
  };

  // 학습 목표 제거
  const removeLearningObjective = (index) => {
    if (showAddCourse) {
      setNewCourse({
        ...newCourse,
        learning_objectives: newCourse.learning_objectives.filter((_, i) => i !== index)
      });
    } else if (showEditCourse) {
      setEditingCourse({
        ...editingCourse,
        learning_objectives: (editingCourse.learning_objectives || []).filter((_, i) => i !== index)
      });
    }
  };

  // 사용자 삭제 (추후 구현)
  const deleteUser = (id) => {
    console.log('사용자 삭제:', id);
  };

  // 파일 업로드 핸들러
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (showAddCourse) {
      setNewCourse({ ...newCourse, videoFile: file });
    } else if (showEditCourse) {
      setEditingCourse({ ...editingCourse, videoFile: file });
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (showAddCourse) {
      setNewCourse({ ...newCourse, thumbnailFile: file });
    } else if (showEditCourse) {
      setEditingCourse({ ...editingCourse, thumbnailFile: file });
    }
  };

  // AI 도구 추가
  const addAiTool = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newAiTool.name);
      formData.append('description', newAiTool.description);
      formData.append('category', newAiTool.category);
      formData.append('advantages', newAiTool.advantages);
      formData.append('disadvantages', newAiTool.disadvantages);
      formData.append('practical_usage', newAiTool.practical_usage);
      
      if (newAiTool.imageFile) {
        formData.append('image', newAiTool.imageFile);
      }
      
      const response = await axios.post('/api/admin/ai-tools', formData, {
        headers: { 
          'admin-password': 'admin123',
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data) {
        setAiTools([...aiTools, response.data]);
        setNewAiTool({
          name: '',
          description: '',
          category: '',
          advantages: '',
          disadvantages: '',
          practical_usage: '',
          imageFile: null
        });
        setShowAddAiTool(false);
        alert('AI 도구가 성공적으로 추가되었습니다.');
      }
    } catch (error) {
      console.error('AI 도구 추가 오류:', error);
      alert('AI 도구 추가에 실패했습니다.');
    }
  };

  // AI 도구 수정
  const saveEditAiTool = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', editingAiTool.name);
      formData.append('description', editingAiTool.description);
      formData.append('category', editingAiTool.category);
      formData.append('advantages', editingAiTool.advantages);
      formData.append('disadvantages', editingAiTool.disadvantages);
      formData.append('practical_usage', editingAiTool.practical_usage);
      
      if (editingAiTool.imageFile) {
        formData.append('image', editingAiTool.imageFile);
      }
      
      const response = await axios.put(`/api/admin/ai-tools/${editingAiTool.id}`, formData, {
        headers: { 
          'admin-password': 'admin123',
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data) {
        setAiTools(aiTools.map(t => t.id === editingAiTool.id ? response.data : t));
        setEditingAiTool(null);
        setShowEditAiTool(false);
        alert('AI 도구가 성공적으로 수정되었습니다.');
      }
    } catch (error) {
      console.error('AI 도구 수정 오류:', error);
      alert('AI 도구 수정에 실패했습니다.');
    }
  };

  // AI 도구 삭제
  const deleteAiTool = async (id) => {
    if (!window.confirm('정말 이 AI 도구를 삭제하시겠습니까?')) return;
    
    try {
      await axios.delete(`/api/admin/ai-tools/${id}`, {
        headers: { 'admin-password': 'admin123' }
      });
      setAiTools(aiTools.filter(t => t.id !== id));
      alert('AI 도구가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('AI 도구 삭제 오류:', error);
      alert('AI 도구 삭제에 실패했습니다.');
    }
  };

  // AI 도구 이미지 업로드 핸들러
  const handleAiToolImageUpload = (e) => {
    const file = e.target.files[0];
    if (showAddAiTool) {
      setNewAiTool({ ...newAiTool, imageFile: file });
    } else if (showEditAiTool) {
      setEditingAiTool({ ...editingAiTool, imageFile: file });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            관리자 인증
          </h2>
          <form onSubmit={authenticateAdmin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관리자 비밀번호
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '인증 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadData}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>새로고침</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              강의 관리
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrollments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              수강신청 관리
            </button>
            <button
              onClick={() => setActiveTab('ai-tools')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai-tools'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI 도구 관리
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              사용자 관리
            </button>
          </nav>
        </div>

        {/* 탭 내용 */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* 강의 추가 버튼 */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">강의 관리</h2>
              <button
                onClick={() => setShowAddCourse(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                새 강의 추가
              </button>
            </div>

            {/* 강의 목록 */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      난이도
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가격
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        <div className="text-sm text-gray-500">{course.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {course.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.difficulty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.price === 0 ? '무료' : `₩${course.price?.toLocaleString()}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          course.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {course.is_published ? '공개' : '비공개'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setEditingCourse(course);
                            setShowEditCourse(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleCoursePublish(course.id, course.is_published)}
                          className={`px-2 py-1 text-xs rounded ${
                            course.is_published
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {course.is_published ? '비공개' : '공개'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'enrollments' && (
          <EnrollmentManagement />
        )}

        {activeTab === 'ai-tools' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">AI 도구 관리</h2>
            <button
              onClick={() => setShowAddAiTool(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              새 AI 도구 추가
            </button>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aiTools.map((tool) => (
                    <tr key={tool.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tool.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tool.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setEditingAiTool(tool);
                            setShowEditAiTool(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAiTool(tool.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">사용자 관리</h2>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 강의 추가 모달 */}
        {showAddCourse && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">새 강의 추가</h3>
              <form onSubmit={addCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">제목</label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">설명</label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">카테고리</label>
                    <input
                      type="text"
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">난이도</label>
                    <select
                      value={newCourse.difficulty}
                      onChange={(e) => setNewCourse({...newCourse, difficulty: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="beginner">초급</option>
                      <option value="intermediate">중급</option>
                      <option value="advanced">고급</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">수업 시간 (분)</label>
                    <input
                      type="number"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({...newCourse, duration: parseInt(e.target.value)})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">가격 (원)</label>
                    <input
                      type="number"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({...newCourse, price: parseFloat(e.target.value)})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">학습 목표</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={learningObjective}
                      onChange={(e) => setLearningObjective(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="학습 목표를 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={addLearningObjective}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      추가
                    </button>
                  </div>
                  <div className="mt-2 space-y-1">
                    {newCourse.learning_objectives.map((objective, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                        <span className="text-sm">{objective}</span>
                        <button
                          type="button"
                          onClick={() => removeLearningObjective(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          제거
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 유튜브 링크 입력 필드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">유튜브 링크 (선택사항)</label>
                  <input
                    type="url"
                    value={newCourse.youtube_url}
                    onChange={(e) => setNewCourse({...newCourse, youtube_url: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="mt-1 text-sm text-gray-500">유튜브 동영상 URL을 입력하세요. 파일 업로드와 함께 사용할 수 있습니다.</p>
                </div>
                
                {/* 무료 강의 여부 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={newCourse.is_free}
                    onChange={(e) => setNewCourse({...newCourse, is_free: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_free" className="ml-2 block text-sm text-gray-900">
                    무료 공개 강의 (체크 시 누구나 바로 시청 가능, 미체크 시 수강신청 승인 필요)
                  </label>
                </div>
                
                {/* 파일 업로드 필드 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">동영상 파일</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">MP4, AVI, MOV, WMV 형식 지원</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">썸네일 이미지</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">JPG, PNG, GIF 형식 지원</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCourse(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    추가
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 강의 수정 모달 */}
        {showEditCourse && editingCourse && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">강의 수정</h3>
              <form onSubmit={saveEditCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">제목</label>
                  <input
                    type="text"
                    value={editingCourse.title}
                    onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">설명</label>
                  <textarea
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">카테고리</label>
                    <input
                      type="text"
                      value={editingCourse.category}
                      onChange={(e) => setEditingCourse({...editingCourse, category: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">난이도</label>
                    <select
                      value={editingCourse.difficulty}
                      onChange={(e) => setEditingCourse({...editingCourse, difficulty: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="beginner">초급</option>
                      <option value="intermediate">중급</option>
                      <option value="advanced">고급</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">수업 시간 (분)</label>
                    <input
                      type="number"
                      value={editingCourse.duration}
                      onChange={(e) => setEditingCourse({...editingCourse, duration: parseInt(e.target.value)})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">가격 (원)</label>
                    <input
                      type="number"
                      value={editingCourse.price}
                      onChange={(e) => setEditingCourse({...editingCourse, price: parseFloat(e.target.value)})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                                     <div>
                       <label className="block text-sm font-medium text-gray-700">학습 목표</label>
                       <div className="flex space-x-2">
                         <input
                           type="text"
                           value={learningObjective}
                           onChange={(e) => setLearningObjective(e.target.value)}
                           className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                           placeholder="학습 목표를 입력하세요"
                         />
                         <button
                           type="button"
                           onClick={addLearningObjective}
                           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                         >
                           추가
                         </button>
                       </div>
                       <div className="mt-2 space-y-1">
                         {(editingCourse.learning_objectives || []).map((objective, index) => (
                           <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                             <span className="text-sm">{objective}</span>
                             <button
                               type="button"
                               onClick={() => removeLearningObjective(index)}
                               className="text-red-600 hover:text-red-800"
                             >
                               제거
                             </button>
                           </div>
                         ))}
                       </div>
                     </div>
                     
                     {/* 유튜브 링크 입력 필드 */}
                     <div>
                       <label className="block text-sm font-medium text-gray-700">유튜브 링크 (선택사항)</label>
                       <input
                         type="url"
                         value={editingCourse.youtube_url || ''}
                         onChange={(e) => setEditingCourse({...editingCourse, youtube_url: e.target.value})}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         placeholder="https://www.youtube.com/watch?v=..."
                       />
                       <p className="mt-1 text-sm text-gray-500">유튜브 동영상 URL을 입력하세요. 파일 업로드와 함께 사용할 수 있습니다.</p>
                     </div>
                     
                     {/* 무료 강의 여부 */}
                     <div className="flex items-center">
                       <input
                         type="checkbox"
                         id="edit_is_free"
                         checked={editingCourse.is_free || false}
                         onChange={(e) => setEditingCourse({...editingCourse, is_free: e.target.checked})}
                         className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                       />
                       <label htmlFor="edit_is_free" className="ml-2 block text-sm text-gray-900">
                         무료 공개 강의 (체크 시 누구나 바로 시청 가능, 미체크 시 수강신청 승인 필요)
                       </label>
                     </div>
                
                {/* 파일 업로드 필드 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">동영상 파일</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">새 파일을 선택하면 기존 파일이 교체됩니다</p>
                    {editingCourse.video_url && (
                      <p className="mt-1 text-sm text-blue-600">현재: {editingCourse.video_url.split('/').pop()}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">썸네일 이미지</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">새 파일을 선택하면 기존 파일이 교체됩니다</p>
                    {editingCourse.thumbnail && (
                      <p className="mt-1 text-sm text-blue-600">현재: {editingCourse.thumbnail.split('/').pop()}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditCourse(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    저장
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI 도구 추가 모달 */}
        {showAddAiTool && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">새 AI 도구 추가</h3>
              <form onSubmit={addAiTool} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">이름</label>
                  <input
                    type="text"
                    value={newAiTool.name}
                    onChange={(e) => setNewAiTool({...newAiTool, name: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">설명</label>
                  <textarea
                    value={newAiTool.description}
                    onChange={(e) => setNewAiTool({...newAiTool, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">카테고리</label>
                    <input
                      type="text"
                      value={newAiTool.category}
                      onChange={(e) => setNewAiTool({...newAiTool, category: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">장점</label>
                    <textarea
                      value={newAiTool.advantages}
                      onChange={(e) => setNewAiTool({...newAiTool, advantages: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="한 줄에 하나씩 입력하세요"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">단점</label>
                    <textarea
                      value={newAiTool.disadvantages}
                      onChange={(e) => setNewAiTool({...newAiTool, disadvantages: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="한 줄에 하나씩 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">실무 활용법</label>
                    <textarea
                      value={newAiTool.practical_usage}
                      onChange={(e) => setNewAiTool({...newAiTool, practical_usage: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">이미지 (선택사항)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAiToolImageUpload}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">JPG, PNG, GIF 형식 지원</p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddAiTool(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    추가
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI 도구 수정 모달 */}
        {showEditAiTool && editingAiTool && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">AI 도구 수정</h3>
              <form onSubmit={saveEditAiTool} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">이름</label>
                  <input
                    type="text"
                    value={editingAiTool.name || ''}
                    onChange={(e) => setEditingAiTool({...editingAiTool, name: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">설명</label>
                  <textarea
                    value={editingAiTool.description || ''}
                    onChange={(e) => setEditingAiTool({...editingAiTool, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">카테고리</label>
                    <input
                      type="text"
                      value={editingAiTool.category || ''}
                      onChange={(e) => setEditingAiTool({...editingAiTool, category: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">장점</label>
                    <textarea
                      value={editingAiTool.advantages ? (Array.isArray(editingAiTool.advantages) ? editingAiTool.advantages.join('\n') : editingAiTool.advantages) : ''}
                      onChange={(e) => setEditingAiTool({...editingAiTool, advantages: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="한 줄에 하나씩 입력하세요"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">단점</label>
                    <textarea
                      value={editingAiTool.disadvantages ? (Array.isArray(editingAiTool.disadvantages) ? editingAiTool.disadvantages.join('\n') : editingAiTool.disadvantages) : ''}
                      onChange={(e) => setEditingAiTool({...editingAiTool, disadvantages: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="한 줄에 하나씩 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">실무 활용법</label>
                    <textarea
                      value={editingAiTool.practical_usage || ''}
                      onChange={(e) => setEditingAiTool({...editingAiTool, practical_usage: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">이미지 (선택사항)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAiToolImageUpload}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">새 파일을 선택하면 기존 파일이 교체됩니다</p>
                  {editingAiTool.image_url && (
                    <p className="mt-1 text-sm text-blue-600">현재: {editingAiTool.image_url.split('/').pop()}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditAiTool(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    저장
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 