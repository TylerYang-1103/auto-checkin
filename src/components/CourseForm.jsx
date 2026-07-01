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
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-[rgba(0,0,0,0.7)] backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="glass-card p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-sm font-mono text-[#00ff41] mb-4">
          {isEdit ? `$ EDIT_COURSE // ${course.name}` : '$ ADD_COURSE'}
        </div>

        {/* 课程名输入 */}
        <div className="mb-3">
          <label className="text-[10px] font-mono text-[#666] tracking-wider mb-1 block">
            COURSE_NAME
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. MATH_101"
            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,65,0.2)]
              rounded px-3 py-2 text-sm font-mono text-[#c0c0c0]
              focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_8px_rgba(0,255,65,0.15)]
              placeholder:text-[#444] transition-all"
          />
          {errors.name && (
            <div className="text-[10px] font-mono text-[#ff4444] mt-1">
              ERROR: {errors.name}
            </div>
          )}
        </div>

        {/* 签到链接输入 */}
        <div className="mb-3">
          <label className="text-[10px] font-mono text-[#666] tracking-wider mb-1 block">
            CHECKIN_URL
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/checkin"
            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,65,0.2)]
              rounded px-3 py-2 text-sm font-mono text-[#c0c0c0]
              focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_8px_rgba(0,255,65,0.15)]
              placeholder:text-[#444] transition-all"
          />
          {errors.url && (
            <div className="text-[10px] font-mono text-[#ff4444] mt-1">
              ERROR: {errors.url}
            </div>
          )}
        </div>

        {/* 星期选择 */}
        <div className="mb-3">
          <label className="text-[10px] font-mono text-[#666] tracking-wider mb-1 block">
            DAY_OF_WEEK
          </label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,65,0.2)]
              rounded px-3 py-2 text-sm font-mono text-[#c0c0c0]
              focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_8px_rgba(0,255,65,0.15)]
              transition-all appearance-none"
          >
            {dayLabels.map((label, index) => (
              <option key={index} value={index} className="bg-[#0a0a0a] text-[#c0c0c0]">
                {label}
              </option>
            ))}
          </select>
          {errors.dayOfWeek && (
            <div className="text-[10px] font-mono text-[#ff4444] mt-1">
              ERROR: {errors.dayOfWeek}
            </div>
          )}
        </div>

        {/* 时间选择 */}
        <div className="mb-3">
          <label className="text-[10px] font-mono text-[#666] tracking-wider mb-1 block">
            TIME
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,65,0.2)]
              rounded px-3 py-2 text-sm font-mono text-[#c0c0c0]
              focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_8px_rgba(0,255,65,0.15)]
              transition-all appearance-none"
          >
            {generateTimeOptions().map((t) => (
              <option key={t} value={t} className="bg-[#0a0a0a] text-[#c0c0c0]">
                {t}
              </option>
            ))}
          </select>
          {errors.time && (
            <div className="text-[10px] font-mono text-[#ff4444] mt-1">
              ERROR: {errors.time}
            </div>
          )}
        </div>

        {/* 按钮行 */}
        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-[rgba(0,255,65,0.08)]">
          <button
            onClick={handleClose}
            className="text-xs font-mono px-4 py-2 rounded text-[#888] hover:text-[#c0c0c0] transition-colors"
          >
            $ cancel
          </button>
          <button
            onClick={handleSave}
            className="text-xs font-mono px-4 py-2 rounded
              bg-[rgba(0,255,65,0.1)] border border-[rgba(0,255,65,0.3)]
              text-[#00ff41] hover:bg-[rgba(0,255,65,0.2)]
              hover:shadow-[0_0_12px_rgba(0,255,65,0.2)]
              transition-all"
          >
            $ {isEdit ? 'update' : 'add'}
          </button>
        </div>
      </div>
    </div>
  );
}
