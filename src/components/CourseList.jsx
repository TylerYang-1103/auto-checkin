import React from 'react';
import { DAY_NAMES } from '../hooks/useCheckinScheduler';

// 星期对应的 badge 颜色
const DAY_BADGE_COLORS = {
  0: 'badge-pink',
  1: 'badge-blue',
  2: 'badge-cyan',
  3: 'badge-purple',
  4: 'badge-blue',
  5: 'badge-cyan',
  6: 'badge-pink',
};

/**
 * 课程列表组件
 * 以卡片形式展示所有课程，支持编辑和删除操作
 *
 * @param {Object} props
 * @param {Array} props.courses - 课程数组
 * @param {Function} props.onEdit - 编辑课程回调
 * @param {Function} props.onDelete - 删除课程回调
 */
export default function CourseList({ courses, onEdit, onDelete }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="glass-panel empty-state animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ opacity: 0.3 }}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="empty-state-text">
          暂无课程安排
        </div>
        <div className="empty-state-hint">
          点击右下角 + 按钮添加课程
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {courses.map((course, index) => (
        <CourseCard
          key={course.id}
          course={course}
          onEdit={() => onEdit(course)}
          onDelete={() => onDelete(course.id)}
          style={{ animationDelay: `${0.2 + index * 0.08}s` }}
        />
      ))}
    </div>
  );
}

/**
 * 单个课程卡片组件
 *
 * @param {Object} props
 * @param {Object} props.course - 课程对象
 * @param {Function} props.onEdit - 编辑回调
 * @param {Function} props.onDelete - 删除回调
 * @param {Object} props.style - 额外样式
 */
function CourseCard({ course, onEdit, onDelete, style }) {
  const badgeClass = DAY_BADGE_COLORS[course.dayOfWeek] || 'badge-blue';

  return (
    <div
      className="glass-panel p-4 course-card-hover animate-slide-up"
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* 课程名 */}
          <div className="flex items-center gap-2 truncate">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: `linear-gradient(135deg, ${
                  [0, 6].includes(course.dayOfWeek) ? '#ec4899' :
                  [1, 4].includes(course.dayOfWeek) ? '#4b6bff' :
                  '#06b6d4'
                }, ${
                  course.dayOfWeek === 0 ? '#f59e0b' :
                  course.dayOfWeek === 3 ? '#7c3aed' :
                  'rgba(75,107,255,0.6)'
                })`,
              }}
            />
            <span
              className="font-display font-semibold truncate"
              style={{ fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
            >
              {course.name}
            </span>
          </div>

          {/* 标签行 */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`badge ${badgeClass}`}>
              {DAY_NAMES[course.dayOfWeek]}
            </span>
            <span className="badge badge-cyan">
              {course.time}
            </span>
            {course.url && (
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-glass text-xs truncate max-w-[160px] sm:max-w-[240px]"
              >
                {course.url}
              </a>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-1.5 shrink-0 pt-1">
          <button
            onClick={onEdit}
            aria-label="编辑课程"
            className="glass-button px-2.5 py-1.5 text-xs font-medium"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.target.style.color = '#4b6bff';
              e.target.style.borderColor = 'rgba(75,107,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'var(--text-tertiary)';
              e.target.style.borderColor = '';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            aria-label="删除课程"
            className="glass-button px-2.5 py-1.5 text-xs font-medium"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.target.style.color = '#ef4444';
              e.target.style.borderColor = 'rgba(239,68,68,0.3)';
              e.target.style.background = 'rgba(239,68,68,0.06)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'var(--text-tertiary)';
              e.target.style.borderColor = '';
              e.target.style.background = '';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
