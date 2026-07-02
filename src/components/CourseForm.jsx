import React, { useState, useEffect } from 'react';
import TimePicker from './TimePicker';

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

  const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-glass"
      onClick={handleClose}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="glass-panel-strong w-full max-w-sm mx-auto animate-scale-in"
        style={{ padding: '28px 24px 24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="flex items-center gap-2.5 mb-6">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #4b6bff 0%, #7c3aed 100%)',
            }}
          >
            {isEdit ? 'E' : 'A'}
          </div>
          <span
            className="font-display font-semibold"
            style={{ fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            {isEdit ? '编辑课程' : '添加课程'}
          </span>
        </div>

        {/* 课程名输入 */}
        <div className="mb-4">
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)', letterSpacing: '0.02em' }}
          >
            课程名称
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: 高等数学"
            className="input-glass"
          />
          {errors.name && (
            <div className="text-xs mt-1.5 font-medium" style={{ color: '#ef4444' }}>
              {errors.name}
            </div>
          )}
        </div>

        {/* 签到链接输入 */}
        <div className="mb-4">
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)', letterSpacing: '0.02em' }}
          >
            签到链接
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/checkin"
            className="input-glass font-mono text-xs"
          />
          {errors.url && (
            <div className="text-xs mt-1.5 font-medium" style={{ color: '#ef4444' }}>
              {errors.url}
            </div>
          )}
        </div>

        {/* 星期选择 + 时间选择 并排 */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)', letterSpacing: '0.02em' }}
            >
              上课日期
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="input-glass"
            >
              {dayLabels.map((label, index) => (
                <option key={index} value={index}>
                  {label}
                </option>
              ))}
            </select>
            {errors.dayOfWeek && (
              <div className="text-xs mt-1.5 font-medium" style={{ color: '#ef4444' }}>
                {errors.dayOfWeek}
              </div>
            )}
          </div>
          <div className="flex-1">
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)', letterSpacing: '0.02em' }}
            >
              上课时间
            </label>
            <TimePicker
              value={time}
              onChange={(val) => setTime(val)}
            />
            {errors.time && (
              <div className="text-xs mt-1.5 font-medium" style={{ color: '#ef4444' }}>
                {errors.time}
              </div>
            )}
          </div>
        </div>

        {/* 分隔线 */}
        <div className="divider-gradient mt-5" />

        {/* 按钮行 */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleClose}
            className="btn-ghost"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="btn-gradient"
          >
            {isEdit ? '更新' : '添加'}
          </button>
        </div>
      </div>
    </div>
  );
}
