import React, { useState, useEffect } from 'react';

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
   * 生成每天的时间选项
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={handleClose}
    >
      <div
        className="panel-white p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5" style={{ fontSize: 14, fontWeight: 540, color: 'rgba(0,0,0,0.7)' }}>
          {isEdit ? `$ EDIT_COURSE // ${course.name}` : '$ ADD_COURSE'}
        </div>

        {/* 课程名输入 */}
        <div className="mb-4">
          <label className="label-weight mb-1.5 block" style={{ fontSize: 11, color: 'rgba(0,0,0,0.48)', letterSpacing: '0.03em' }}>
            课程名称
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. MATH_101"
            className="w-full rounded-lg px-3 py-2 text-sm transition-all outline-none"
            style={{
              backgroundColor: '#f2f5f9',
              border: '1px solid rgba(15,23,42,0.08)',
              color: '#1a1a2e',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4b6bff';
              e.target.style.boxShadow = '0 0 0 2px rgba(75,107,255,0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(15,23,42,0.08)';
              e.target.style.boxShadow = 'none';
            }}
          />
          {errors.name && (
            <div className="text-xs mt-1" style={{ color: '#dc2626', fontWeight: 500 }}>
              ERROR: {errors.name}
            </div>
          )}
        </div>

        {/* 签到链接输入 */}
        <div className="mb-4">
          <label className="label-weight mb-1.5 block" style={{ fontSize: 11, color: 'rgba(0,0,0,0.48)', letterSpacing: '0.03em' }}>
            签到链接
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/checkin"
            className="w-full rounded-lg px-3 py-2 text-sm transition-all outline-none"
            style={{
              backgroundColor: '#f2f5f9',
              border: '1px solid rgba(15,23,42,0.08)',
              color: '#1a1a2e',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4b6bff';
              e.target.style.boxShadow = '0 0 0 2px rgba(75,107,255,0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(15,23,42,0.08)';
              e.target.style.boxShadow = 'none';
            }}
          />
          {errors.url && (
            <div className="text-xs mt-1" style={{ color: '#dc2626', fontWeight: 500 }}>
              ERROR: {errors.url}
            </div>
          )}
        </div>

        {/* 星期选择 */}
        <div className="mb-4">
          <label className="label-weight mb-1.5 block" style={{ fontSize: 11, color: 'rgba(0,0,0,0.48)', letterSpacing: '0.03em' }}>
            上课日期
          </label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="w-full rounded-lg px-3 py-2 text-sm transition-all outline-none appearance-none"
            style={{
              backgroundColor: '#f2f5f9',
              border: '1px solid rgba(15,23,42,0.08)',
              color: '#1a1a2e',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4b6bff';
              e.target.style.boxShadow = '0 0 0 2px rgba(75,107,255,0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(15,23,42,0.08)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {dayLabels.map((label, index) => (
              <option key={index} value={index} style={{ backgroundColor: '#fff', color: '#1a1a2e' }}>
                {label}
              </option>
            ))}
          </select>
          {errors.dayOfWeek && (
            <div className="text-xs mt-1" style={{ color: '#dc2626', fontWeight: 500 }}>
              ERROR: {errors.dayOfWeek}
            </div>
          )}
        </div>

        {/* 时间选择 */}
        <div className="mb-4">
          <label className="label-weight mb-1.5 block" style={{ fontSize: 11, color: 'rgba(0,0,0,0.48)', letterSpacing: '0.03em' }}>
            上课时间
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm transition-all outline-none appearance-none"
            style={{
              backgroundColor: '#f2f5f9',
              border: '1px solid rgba(15,23,42,0.08)',
              color: '#1a1a2e',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4b6bff';
              e.target.style.boxShadow = '0 0 0 2px rgba(75,107,255,0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(15,23,42,0.08)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {generateTimeOptions().map((t) => (
              <option key={t} value={t} style={{ backgroundColor: '#fff', color: '#1a1a2e' }}>
                {t}
              </option>
            ))}
          </select>
          {errors.time && (
            <div className="text-xs mt-1" style={{ color: '#dc2626', fontWeight: 500 }}>
              ERROR: {errors.time}
            </div>
          )}
        </div>

        {/* 按钮行 */}
        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid rgba(15,23,42,0.06)' }}>
          <button
            onClick={handleClose}
            className="pill px-4 py-2 text-xs font-medium transition-all duration-200"
            style={{ color: 'rgba(0,0,0,0.48)', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(15,23,42,0.04)';
              e.target.style.color = 'rgba(0,0,0,0.7)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'rgba(0,0,0,0.48)';
            }}
          >
            $ cancel
          </button>
          <button
            onClick={handleSave}
            className="pill px-5 py-2 text-xs font-medium text-white transition-all duration-200"
            style={{ backgroundColor: '#4b6bff' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#3b5bff';
              e.target.style.boxShadow = '0 2px 8px rgba(75,107,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4b6bff';
              e.target.style.boxShadow = 'none';
            }}
          >
            $ {isEdit ? 'update' : 'add'}
          </button>
        </div>
      </div>
    </div>
  );
}
