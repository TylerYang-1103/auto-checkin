import React, { useState, useCallback, useEffect } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Fab,
  Snackbar,
  Alert,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AddIcon from '@mui/icons-material/Add';

import CourseList from './components/CourseList';
import CourseForm from './components/CourseForm';
import CheckinStatus from './components/CheckinStatus';
import { useCheckinScheduler } from './hooks/useCheckinScheduler';
import {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  clearAllCourses,
} from './utils/storage';

// 创建 MUI 主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 8,
  },
});

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
  // 提示消息状态
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // 确认清空对话框状态
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // 签到调度器
  const { nextCourse, countdown, isChecking, refresh } = useCheckinScheduler();

  // 初始化：加载课程数据
  useEffect(() => {
    const savedCourses = getCourses();
    setCourses(savedCourses);
  }, []);

  /**
   * 显示提示消息
   */
  const showMessage = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  /**
   * 关闭提示消息
   */
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  /**
   * 请求浏览器地理位置权限
   */
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showMessage('您的浏览器不支持地理位置功能', 'warning');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationGranted(true);
        showMessage(
          `位置权限已获取（纬度: ${position.coords.latitude.toFixed(4)}, 经度: ${position.coords.longitude.toFixed(4)}）`,
          'success'
        );
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
        showMessage(message, 'warning');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [showMessage]);

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
        showMessage(`课程「${courseData.name}」已更新`, 'success');
      } else {
        // 添加模式
        updatedCourses = addCourse(courseData);
        showMessage(`课程「${courseData.name}」已添加`, 'success');
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
      showMessage(`课程「${courseName}」已删除`, 'info');

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
    showMessage('所有课程已清空', 'info');
    setTimeout(refresh, 0);
  }, [showMessage, refresh]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* 顶部导航栏 */}
      <AppBar
        position="sticky"
        elevation={1}
        sx={{ backgroundColor: 'white', color: 'text.primary' }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="h1"
            className="flex-1 font-bold"
            sx={{ fontWeight: 700 }}
          >
            自动签到系统
          </Typography>

          {/* 清空所有课程按钮 */}
          <Tooltip title="清空所有课程">
            <IconButton
              color="error"
              onClick={handleClearAll}
              disabled={courses.length === 0}
              size="small"
            >
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* 主内容区域 */}
      <Container maxWidth="sm" sx={{ py: 2, pb: 10 }}>
        {/* 签到状态 */}
        <CheckinStatus
          nextCourse={nextCourse}
          countdown={countdown}
          isChecking={isChecking}
          onRequestLocation={handleRequestLocation}
          locationGranted={locationGranted}
        />

        {/* 课程列表 */}
        <CourseList
          courses={courses}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteCourse}
        />
      </Container>

      {/* 添加课程浮动按钮 */}
      {!formOpen && (
        <Box
          className="fixed"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Fab
            color="primary"
            aria-label="添加课程"
            onClick={handleOpenAdd}
            sx={{
              width: 56,
              height: 56,
              boxShadow: '0 4px 16px rgba(25,118,210,0.3)',
            }}
          >
            <AddIcon />
          </Fab>
        </Box>
      )}

      {/* 课程表单对话框 */}
      <CourseForm
        open={formOpen}
        course={editingCourse}
        onSave={handleSaveCourse}
        onClose={handleCloseForm}
      />

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
