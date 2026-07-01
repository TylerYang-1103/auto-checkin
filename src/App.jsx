import React, { useState, useCallback, useEffect } from 'react';

import CourseList from './components/CourseList';
import CourseForm from './components/CourseForm';
import CheckinStatus from './components/CheckinStatus';
import { useCheckinScheduler } from './hooks/useCheckinScheduler';
import { useReverseGeocode } from './hooks/useReverseGeocode';
import {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  clearAllCourses,
} from './utils/storage';

/**
 * 应用根组件
 * 管理课程数据的增删改查，渲染整体布局
 */
export default function App() {
  // 课程列表状态
  const [courses, setCourses] = useState([]);
  // 表单对话框状态
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  // 位置权限状态
  const [locationGranted, setLocationGranted] = useState(false);
  // 位置坐标
  const [position, setPosition] = useState(null);
  // 提示消息状态
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // 签到调度器
  const { nextCourse, countdown, isChecking, refresh } = useCheckinScheduler();

  // 反地理编码
  const { locationInfo, loading: locationLoading, fetchLocationInfo } = useReverseGeocode();

  // 初始化：加载课程数据
  useEffect(() => {
    const savedCourses = getCourses();
    setCourses(savedCourses);
  }, []);

  /**
   * 显示提示消息
   */
  const showMessage = useCallback((message) => {
    setSnackbar({ open: true, message });
    setTimeout(() => {
      setSnackbar({ open: false, message: '' });
    }, 3000);
  }, []);

  /**
   * 关闭提示消息
   */
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar({ open: false, message: '' });
  }, []);

  /**
   * 请求浏览器地理位置权限
   */
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showMessage('您的浏览器不支持地理位置功能');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocationGranted(true);
        setPosition({ lat, lng });
        showMessage(`位置权限已获取（纬度: ${lat.toFixed(4)}, 经度: ${lng.toFixed(4)}）`);
        // 触发反地理编码
        fetchLocationInfo(lat, lng);
      },
      (error) => {
        let message = '获取位置失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = '用户拒绝了位置权限请求';
            break;
          case error.POSITION_UNAVAILABLE:
            message = '位置信息不可用';
            break;
          case error.TIMEOUT:
            message = '获取位置超时';
            break;
          default:
            message = '未知错误';
            break;
        }
        setLocationGranted(false);
        showMessage(message);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [showMessage, fetchLocationInfo]);

  /**
   * 打开添加课程对话框
   */
  const handleOpenAdd = useCallback(() => {
    setEditingCourse(null);
    setFormOpen(true);
  }, []);

  /**
   * 打开编辑课程对话框
   */
  const handleOpenEdit = useCallback((course) => {
    setEditingCourse(course);
    setFormOpen(true);
  }, []);

  /**
   * 关闭表单对话框
   */
  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingCourse(null);
  }, []);

  /**
   * 保存课程（添加或编辑）
   */
  const handleSaveCourse = useCallback(
    (courseData) => {
      let updatedCourses;

      if (editingCourse) {
        // 编辑模式
        updatedCourses = updateCourse(editingCourse.id, courseData);
        showMessage(`课程「${courseData.name}」已更新`);
      } else {
        // 添加模式
        updatedCourses = addCourse(courseData);
        showMessage(`课程「${courseData.name}」已添加`);
      }

      setCourses(updatedCourses);
      setFormOpen(false);
      setEditingCourse(null);

      // 刷新调度器
      setTimeout(refresh, 0);
    },
    [editingCourse, showMessage, refresh]
  );

  /**
   * 删除课程
   */
  const handleDeleteCourse = useCallback(
    (id) => {
      const course = courses.find((c) => c.id === id);
      const courseName = course ? course.name : '未知课程';
      const updatedCourses = deleteCourse(id);
      setCourses(updatedCourses);
      showMessage(`课程「${courseName}」已删除`);

      // 刷新调度器
      setTimeout(refresh, 0);
    },
    [courses, showMessage, refresh]
  );

  /**
   * 清空所有课程
   */
  const handleClearAll = useCallback(() => {
    clearAllCourses();
    setCourses([]);
    showMessage('所有课程已清空');
    setTimeout(refresh, 0);
  }, [showMessage, refresh]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f2f5f9' }}>

      {/* Header — 深色 Hero 区 */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: '#111318',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1
            className="text-white hero-title-weight"
            style={{ fontSize: 22, letterSpacing: '-0.02em' }}
          >
            AUTO_CHECKIN
            <span className="animate-pulse ml-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>_</span>
          </h1>
          <button
            onClick={handleClearAll}
            disabled={courses.length === 0}
            className="pill px-3 py-1.5 text-xs transition-all duration-200 disabled:opacity-30"
            style={{
              color: 'rgba(255,255,255,0.45)',
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
            onMouseEnter={(e) => {
              if (!courses.length) return;
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.target.style.color = 'rgba(255,255,255,0.8)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.06)';
              e.target.style.color = 'rgba(255,255,255,0.45)';
            }}
          >
            清除
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4 pb-24">
        {/* CheckinStatus */}
        <CheckinStatus
          nextCourse={nextCourse}
          countdown={countdown}
          isChecking={isChecking}
          onRequestLocation={handleRequestLocation}
          locationGranted={locationGranted}
          position={position}
        />

        {/* CourseList */}
        <CourseList
          courses={courses}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteCourse}
        />
      </div>

      {/* 底部定位信息 — 经度 + 纬度（城市·区） */}
      {locationGranted && position && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3"
          style={{ backgroundColor: '#f7f9fc', borderTop: '1px solid rgba(15,23,42,0.08)' }}
        >
          <div className="max-w-lg mx-auto flex items-center justify-center gap-2 text-xs" style={{ color: 'rgba(0,0,0,0.48)', fontFamily: "'SF Mono', 'JetBrains Mono', ui-monospace, monospace" }}>
            <span>纬度: {position.lat.toFixed(6)}</span>
            <span style={{ color: 'rgba(0,0,0,0.2)' }}>|</span>
            <span>经度: {position.lng.toFixed(6)}</span>
            {locationInfo ? (
              <>
                <span style={{ color: 'rgba(0,0,0,0.2)' }}>|</span>
                <span style={{ color: 'rgba(0,0,0,0.62)' }}>
                  {locationInfo.city}{locationInfo.district ? ` · ${locationInfo.district}` : ''}
                </span>
              </>
            ) : locationLoading ? (
              <>
                <span style={{ color: 'rgba(0,0,0,0.2)' }}>|</span>
                <span className="animate-pulse" style={{ color: 'rgba(0,0,0,0.48)' }}>解析位置中...</span>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* FAB 添加按钮 */}
      <button
        onClick={handleOpenAdd}
        className="fixed bottom-20 right-6 z-50 w-12 h-12 rounded-full
          flex items-center justify-center
          text-white text-xl
          transition-all duration-200
          shadow-sm hover:shadow-md"
        style={{ backgroundColor: '#111318' }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#4b6bff';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#111318';
        }}
      >
        +
      </button>

      {/* CourseForm Dialog */}
      <CourseForm
        open={formOpen}
        course={editingCourse}
        onSave={handleSaveCourse}
        onClose={handleCloseForm}
      />

      {/* Snackbar 轻提示 */}
      {snackbar.open && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50
            px-5 py-2.5 snackbar-toast
            text-sm animate-fadeIn cursor-pointer"
          style={{ color: 'rgba(0,0,0,0.7)', fontWeight: 500 }}
          onClick={handleCloseSnackbar}
        >
          {snackbar.message}
        </div>
      )}
    </div>
  );
}
