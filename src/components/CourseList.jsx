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

// 星期排序：周一(1) → 周日(0)
const DAY_SORT_ORDER = [1, 2, 3, 4, 5, 6, 0];

/**
 * 将课程按星期分组
 * @param {Array} courses - 课程数组
 * @returns {Map<number, Array>} 星期 → 课程列表 映射
 */
function groupCoursesByDay(courses) {
  const map = new Map();
  for (const day of DAY_SORT_ORDER) {
    map.set(day, []);
  }
  for (const course of courses) {
    const group = map.get(course.dayOfWeek);
    if (group) {
      group.push(course);
    }
  }
  return map;
}

/**
 * 课程列表组件（星期表格视图）
 * 将课程按周一到周日分组，以 7 列网格展示
 *
 * @param {Object} props
 * @param {Array} props.courses - 课程数组
 * @param {Function} props.onEdit - 编辑课程回调
 * @param {Function} props.onDelete - 删除课程回调
 */
export default function CourseList({ courses, onEdit, onDelete }) {
  // 整体空状态：无任何课程
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

  const grouped = groupCoursesByDay(courses);

  return (
    <>
      {/* ===== 桌面端：7 列网格，每列最小 160px ===== */}
      <div
        className="hidden md:grid md:gap-4 md:animate-slide-up overflow-x-auto pb-2"
        style={{
          gridTemplateColumns: 'repeat(7, minmax(160px, 1fr))',
        }}
      >
        {DAY_SORT_ORDER.map((day, colIndex) => {
          const dayCourses = grouped.get(day) || [];
          return (
            <DayColumn
              key={day}
              day={day}
              courses={dayCourses}
              onEdit={onEdit}
              onDelete={onDelete}
              animationDelay={0.1 + colIndex * 0.05}
            />
          );
        })}
      </div>

      {/* ===== 移动端：水平滚动 ===== */}
      <div className="md:hidden">
        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {DAY_SORT_ORDER.map((day, colIndex) => {
            const dayCourses = grouped.get(day) || [];
            return (
              <div
                key={day}
                className="snap-center shrink-0 w-[calc(100vw-40px)] max-w-xs first:ml-0 last:mr-0"
                style={{ animationDelay: `${0.1 + colIndex * 0.05}s` }}
              >
                <DayColumn
                  day={day}
                  courses={dayCourses}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  animationDelay={0.1 + colIndex * 0.05}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/**
 * 单天列组件
 *
 * @param {Object} props
 * @param {number} props.day - 星期几 (0-6)
 * @param {Array} props.courses - 该天的课程列表
 * @param {Function} props.onEdit - 编辑回调
 * @param {Function} props.onDelete - 删除回调
 * @param {number} props.animationDelay - 入场动画延迟
 */
function DayColumn({ day, courses, onEdit, onDelete, animationDelay }) {
  const isToday = new Date().getDay() === day;

  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* 列标题 */}
      <div
        className="flex items-center justify-between mb-2 px-1 py-1.5 rounded-lg"
        style={{
          background: isToday
            ? 'linear-gradient(135deg, rgba(75, 107, 255, 0.08), rgba(124, 58, 237, 0.05))'
            : 'transparent',
        }}
      >
        <span
          className="text-xs font-semibold tracking-wide"
          style={{
            color: isToday ? '#4b6bff' : 'var(--text-secondary)',
          }}
        >
          {DAY_NAMES[day]}
        </span>
        {courses.length > 0 && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{
              background: 'rgba(133, 144, 173, 0.12)',
              color: 'var(--text-tertiary)',
            }}
          >
            {courses.length}
          </span>
        )}
      </div>

      {/* 课程列表 */}
      <div className="space-y-3">
        {courses.length > 0 ? (
          courses.map((course, idx) => (
            <DayCourseCard
              key={course.id}
              course={course}
              onEdit={() => onEdit(course)}
              onDelete={() => onDelete(course.id)}
              style={{ animationDelay: `${animationDelay + idx * 0.06}s` }}
            />
          ))
        ) : (
          // 空日期
          <div
            className="flex items-center justify-center py-8 rounded-xl"
            style={{
              background: 'rgba(133, 144, 173, 0.04)',
              border: '1px dashed rgba(133, 144, 173, 0.12)',
            }}
          >
            <span className="text-sm" style={{ color: 'var(--text-tertiary)', opacity: 0.6 }}>
              休息
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 星期视图中的单课程卡片（紧凑版本）
 *
 * @param {Object} props
 * @param {Object} props.course - 课程对象
 * @param {Function} props.onEdit - 编辑回调
 * @param {Function} props.onDelete - 删除回调
 * @param {Object} props.style - 额外样式
 */
function DayCourseCard({ course, onEdit, onDelete, style }) {
  const badgeClass = DAY_BADGE_COLORS[course.dayOfWeek] || 'badge-blue';

  return (
    <div
      className="glass-panel p-3.5 course-card-hover animate-slide-up"
      style={style}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* 课程名 + 小圆点 */}
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
              className="font-display font-semibold truncate text-sm"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
            >
              {course.name}
            </span>
          </div>

          {/* 时间标签 */}
          <div className="flex items-center gap-2 mt-2">
            <span className="badge text-xs px-2 py-0.5" style={{ background: 'rgba(6, 182, 212, 0.08)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.12)' }}>
              {course.time}
            </span>
            {course.url && (
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-glass text-xs truncate max-w-[100px]"
              >
                {course.url}
              </a>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onEdit}
            aria-label="编辑课程"
            className="glass-button px-2 py-1.5 text-xs"
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            aria-label="删除课程"
            className="glass-button px-2 py-1.5 text-xs"
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
