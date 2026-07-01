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
    <>
      {/* Matrix 背景 */}
      <div className="matrix-bg" />

      {/* Main Container */}
      <div className="min-h-screen relative z-10">

        {/* Header — Linear 风格 */}
        <header className="border-b border-[rgba(0,255,65,0.1)] bg-[rgba(10,10,10,0.8)] backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
            <h1 className="text-[#00ff41] text-lg font-semibold tracking-wider neon-text">
              {`> AUTO_CHECKIN`}
              <span className="animate-pulse ml-1">_</span>
            </h1>
            <button
              onClick={handleClearAll}
              disabled={courses.length === 0}
              className="text-[#666] hover:text-[#ff4444] transition-colors text-sm font-mono disabled:opacity-30"
            >
              ~ $ clear
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
          <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-[rgba(10,10,10,0.9)] border-t border-[rgba(0,255,65,0.1)] backdrop-blur-md">
            <div className="max-w-lg mx-auto flex items-center justify-center gap-2 font-mono text-xs text-[#888]">
              <span className="text-[#00ff41]">◆</span>
              <span>纬度: {position.lat.toFixed(6)}</span>
              <span className="text-[#666]">|</span>
              <span>经度: {position.lng.toFixed(6)}</span>
              {locationInfo ? (
                <>
                  <span className="text-[#666]">|</span>
                  <span className="text-[#00d4ff]">
                    ({locationInfo.city}{locationInfo.district ? ` · ${locationInfo.district}` : ''})
                  </span>
                </>
              ) : locationLoading ? (
                <>
                  <span className="text-[#666]">|</span>
                  <span className="text-[#666] animate-pulse">解析位置中...</span>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* FAB 添加按钮 */}
        <button
          onClick={handleOpenAdd}
          className="fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full
            bg-[rgba(0,255,65,0.1)] border border-[rgba(0,255,65,0.3)]
            text-[#00ff41] text-2xl font-mono
            hover:bg-[rgba(0,255,65,0.2)] hover:border-[#00ff41]
            hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]
            transition-all duration-300
            flex items-center justify-center
            backdrop-blur-md"
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

        {/* Snackbar 换成自定义轻提示 */}
        {snackbar.open && (
          <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50
              px-4 py-2 rounded-lg font-mono text-sm
              bg-[rgba(0,255,65,0.1)] border border-[rgba(0,255,65,0.3)]
              text-[#00ff41] backdrop-blur-md
              animate-fadeIn cursor-pointer"
            onClick={handleCloseSnackbar}
          >
            $ {snackbar.message}
          </div>
        )}
      </div>
    </>
  );
}
