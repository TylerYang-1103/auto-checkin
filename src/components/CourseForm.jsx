import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
/**
 * 课程表单对话框组件
 * 用于添加新课程或编辑已有课程
 *
 * @param {Object} props
 * @param {boolean} props.open - 对话框是否打开
 * @param {Object|null} props.course - 要编辑的课程（null 表示添加模式）
 * @param {Function} props.onSave - 保存回调
 * @param {Function} props.onClose - 关闭回调
 */
export default function CourseForm({ open, course, onSave, onClose }) {
  const isEdit = course !== null;

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [time, setTime] = useState('08:00');
  const [errors, setErrors] = useState({});

  // 当对话框打开或 course 变化时，初始化表单数据
  useEffect(() => {
    if (open) {
      if (course) {
        setName(course.name || '');
        setUrl(course.url || '');
        setDayOfWeek(course.dayOfWeek ?? 1);
        setTime(course.time || '08:00');
      } else {
        setName('');
        setUrl('');
        setDayOfWeek(1);
        setTime('08:00');
      }
      setErrors({});
    }
  }, [open, course]);

  /**
   * 表单验证
   * @returns {boolean} 是否通过验证
   */
  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = '请输入课程名称';
    }

    if (!url.trim()) {
      newErrors.url = '请输入签到链接';
    } else {
      try {
        new URL(url.trim());
      } catch {
        newErrors.url = '请输入有效的 URL（以 http:// 或 https:// 开头）';
      }
    }

    if (dayOfWeek === undefined || dayOfWeek === null) {
      newErrors.dayOfWeek = '请选择星期';
    }

    if (!time) {
      newErrors.time = '请选择上课时间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 处理保存
   */
  const handleSave = () => {
    if (!validate()) return;

    const courseData = {
      name: name.trim(),
      url: url.trim(),
      dayOfWeek,
      time,
    };

    onSave(courseData);
  };

  /**
   * 处理对话框关闭
   */
  const handleClose = () => {
    setErrors({});
    onClose();
  };

  /**
   * 生成每天的小时选项
   */
  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        options.push(val);
      }
    }
    return options;
  };

  const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{
        onExited: () => setErrors({}),
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEdit ? '编辑课程' : '添加课程'}
      </DialogTitle>

      <DialogContent dividers>
        <Box className="space-y-4 pt-2">
          {/* 课程名称 */}
          <TextField
            label="课程名称"
            placeholder="例如：高等数学"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            autoFocus
            variant="outlined"
            size="medium"
          />

          {/* 签到链接 */}
          <TextField
            label="签到链接"
            placeholder="https://example.com/checkin"
            fullWidth
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            error={!!errors.url}
            helperText={errors.url}
            variant="outlined"
            size="medium"
            type="url"
          />

          {/* 星期选择 */}
          <FormControl fullWidth required error={!!errors.dayOfWeek} size="medium">
            <InputLabel id="day-of-week-label">星期</InputLabel>
            <Select
              labelId="day-of-week-label"
              value={dayOfWeek}
              label="星期"
              onChange={(e) => setDayOfWeek(e.target.value)}
            >
              {dayLabels.map((label, index) => (
                <MenuItem key={index} value={index}>
                  {label}
                </MenuItem>
              ))}
            </Select>
            {errors.dayOfWeek && (
              <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                {errors.dayOfWeek}
              </Alert>
            )}
          </FormControl>

          {/* 时间选择 */}
          <FormControl fullWidth required error={!!errors.time} size="medium">
            <InputLabel id="time-label">上课时间</InputLabel>
            <Select
              labelId="time-label"
              value={time}
              label="上课时间"
              onChange={(e) => setTime(e.target.value)}
            >
              {generateTimeOptions().map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
            {errors.time && (
              <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                {errors.time}
              </Alert>
            )}
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          取消
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          sx={{ minWidth: 80 }}
        >
          {isEdit ? '保存' : '添加'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
