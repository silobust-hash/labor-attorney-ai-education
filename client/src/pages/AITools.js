import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CpuChipIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const AITools = () => {
  const [aiTools, setAiTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAiTools();
  }, []);

  const fetchAiTools = async () => {
    try {
      const response = await axios.get('/api/courses/ai-tools/list');
      setAiTools(response.data || []);
    } catch (error) {
      console.error('AI 도구 로드 오류:', error);
      setAiTools([]);
    } finally {
      setLoading(false);
    }
  };

  const openToolDetail = (tool) => {
    setSelectedTool(tool);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTool(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <CpuChipIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI 도구 소개
            </h1>
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-gray-600 mb-4">
                안녕하세요, 한동노무법인 박실로 노무사입니다.
              </p>
              <p className="text-gray-600">
                노무사 실무에서 활용할 수 있는 다양한 AI 도구들을 소개해드립니다. 
                각 도구의 장단점과 실무 활용법을 확인해보세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {aiTools.length === 0 ? (
          <div className="text-center py-12">
            <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">AI 도구가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              관리자가 AI 도구를 등록하면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiTools.map((tool) => (
              <div 
                key={tool.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => openToolDetail(tool)}
              >
                {/* Tool Image */}
                {tool.image_url && (
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img 
                      src={tool.image_url} 
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Tool Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{tool.name}</h3>
                    {tool.category && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {tool.category}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4 overflow-hidden" style={{ 
                    display: '-webkit-box', 
                    WebkitLineClamp: 3, 
                    WebkitBoxOrient: 'vertical' 
                  }}>
                    {tool.description}
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                      <span>{tool.advantages?.length || 0} 장점</span>
                    </div>
                    <div className="flex items-center">
                      <XCircleIcon className="w-4 h-4 text-red-500 mr-1" />
                      <span>{tool.disadvantages?.length || 0} 단점</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>{new Date(tool.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            AI 도구를 활용한 실무 교육을 받아보세요
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            실제 업무에서 바로 적용할 수 있는 AI 도구 활용법을 체계적으로 학습할 수 있습니다.
          </p>
          <Link 
            to="/courses"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            강의 수강하기
            <PlusIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 한동노무법인 박실로 노무사. All rights reserved.
          </p>
        </div>
      </div>

      {/* Tool Detail Modal */}
      {showModal && selectedTool && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedTool.name}</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Tool Image */}
              {selectedTool.image_url && (
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={selectedTool.image_url} 
                    alt={selectedTool.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">도구 설명</h4>
                <p className="text-gray-600">{selectedTool.description}</p>
              </div>
              
              {/* Advantages */}
              {selectedTool.advantages && selectedTool.advantages.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    장점
                  </h4>
                  <ul className="space-y-2">
                    {selectedTool.advantages.map((advantage, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Disadvantages */}
              {selectedTool.disadvantages && selectedTool.disadvantages.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                    단점
                  </h4>
                  <ul className="space-y-2">
                    {selectedTool.disadvantages.map((disadvantage, index) => (
                      <li key={index} className="flex items-start">
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{disadvantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Practical Usage */}
              {selectedTool.practical_usage && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <LightBulbIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    실무 활용법
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{selectedTool.practical_usage}</p>
                  </div>
                </div>
              )}
              
              {/* Category and Date */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                {selectedTool.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {selectedTool.category}
                  </span>
                )}
                <span>등록일: {new Date(selectedTool.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITools; 