import React from 'react';
import { DAY_NAMES } from '../hooks/useCheckinScheduler';

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
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-4xl mb-4" style={{ color: 'rgba(0,0,0,0.15)', fontFamily: "'SF Mono', 'JetBrains Mono', ui-monospace, monospace", fontWeight: 300 }}>{'> _'}</div>
        <div className="text-sm" style={{ color: 'rgba(0,0,0,0.62)' }}>$ no courses found</div>
        <div className="text-xs mt-2" style={{ color: 'rgba(0,0,0,0.38)' }}>
          /* click the + button to add one */
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onEdit={() => onEdit(course)}
          onDelete={() => onDelete(course.id)}
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
 */
function CourseCard({ course, onEdit, onDelete }) {
  return (
    <div className="course-card p-4 relative group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* 课程名 */}
          <div className="truncate card-title-weight" style={{ fontSize: 16, color: '#1a1a2e' }}>
            <span style={{ color: 'rgba(0,0,0,0.3)' }}>{'>'}</span> {course.name}
          </div>

          {/* 标签行 */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="pill-accent pill px-2.5 py-0.5" style={{ fontSize: 11 }}>
              {DAY_NAMES[course.dayOfWeek]}
            </span>
            <span className="pill-accent pill px-2.5 py-0.5" style={{ fontSize: 11 }}>
              {course.time}
            </span>
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs truncate max-w-[180px] transition-colors"
              style={{ color: 'rgba(0,0,0,0.38)' }}
              onMouseEnter={(e) => { e.target.style.color = '#4b6bff'; }}
              onMouseLeave={(e) => { e.target.style.color = 'rgba(0,0,0,0.38)'; }}
            >
              {course.url}
            </a>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-1 ml-2 shrink-0">
          <button
            onClick={onEdit}
            aria-label="编辑课程"
            className="pill px-2.5 py-1 text-xs transition-all duration-200"
            style={{ color: 'rgba(0,0,0,0.38)', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(75,107,255,0.06)';
              e.target.style.color = '#4b6bff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'rgba(0,0,0,0.38)';
            }}
          >
            编辑
          </button>
          <button
            onClick={onDelete}
            aria-label="删除课程"
            className="pill px-2.5 py-1 text-xs transition-all duration-200"
            style={{ color: 'rgba(0,0,0,0.38)', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(220,38,38,0.06)';
              e.target.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'rgba(0,0,0,0.38)';
            }}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
