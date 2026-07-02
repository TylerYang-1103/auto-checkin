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
  // 页面动画状态
  const [pageVisible, setPageVisible] = useState(false);

  // 签到调度器
  const { nextCourse, countdown, isChecking, refresh } = useCheckinScheduler();

  // 反地理编码
  const { locationInfo, loading: locationLoading, fetchLocationInfo } = useReverseGeocode();

  // 初始化：加载课程数据 & 入场动画
  useEffect(() => {
    const savedCourses = getCourses();
    setCourses(savedCourses);
    requestAnimationFrame(() => setPageVisible(true));
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
    <div
      className={`min-h-screen transition-opacity duration-500 ${pageVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Header — 毛玻璃导航栏 */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, #4b6bff 0%, #7c3aed 100%)',
                boxShadow: '0 2px 8px rgba(75, 107, 255, 0.25)',
              }}
            >
              A
            </div>
            <h1
              className="font-display font-semibold tracking-tight"
              style={{ fontSize: 18, color: '#1a1e2e', letterSpacing: '-0.03em' }}
            >
              Auto Checkin
            </h1>
          </div>

          {/* 操作区 */}
          <div className="flex items-center gap-2">
            {courses.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={courses.length === 0}
                className="glass-button px-3.5 py-1.5 text-xs font-medium disabled:opacity-30"
                style={{ color: 'var(--text-tertiary)' }}
              >
                清空
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="page-enter">
        {/* CheckinStatus: 保持原 max-w-2xl 容器 */}
        <section className="max-w-2xl mx-auto px-5 py-5">
          <CheckinStatus
            nextCourse={nextCourse}
            countdown={countdown}
            isChecking={isChecking}
            onRequestLocation={handleRequestLocation}
            locationGranted={locationGranted}
            position={position}
          />
        </section>

        {/* CourseList: 更宽敞的容器，避免 7 列拥挤 */}
        <section className="max-w-7xl mx-auto px-5 pb-28">
          <CourseList
            courses={courses}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteCourse}
          />
        </section>
      </main>

      {/* 底部定位信息 — 毛玻璃栏 */}
      {locationGranted && position && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
          style={{
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.25)',
          }}
        >
          <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-center gap-3">
            <span className="font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </span>
            {locationInfo ? (
              <>
                <span style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}>·</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {locationInfo.city}{locationInfo.district ? ` · ${locationInfo.district}` : ''}
                </span>
              </>
            ) : locationLoading ? (
              <>
                <span style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}>·</span>
                <span className="text-xs animate-pulse-soft" style={{ color: 'var(--text-tertiary)' }}>
                  解析位置中...
                </span>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* FAB 添加按钮 */}
      <button
        onClick={handleOpenAdd}
        className="fab fixed bottom-24 right-6 z-50"
        aria-label="添加课程"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
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
          className="snackbar"
          onClick={handleCloseSnackbar}
        >
          {snackbar.message}
        </div>
      )}
    </div>
  );
}
