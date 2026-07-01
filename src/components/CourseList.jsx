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
        <div className="text-[#444] text-4xl font-mono mb-4">{'> _'}</div>
        <div className="text-sm font-mono text-[#666]">$ no courses found</div>
        <div className="text-xs font-mono text-[#555] mt-2">
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
    <div className="glass-card p-4 mb-3 relative overflow-hidden group">
      {/* 左侧绿色装饰线 */}
      <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-[#00ff41] opacity-50 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(0,255,65,0.3)]" />

      <div className="flex items-start justify-between pl-3">
        <div className="flex-1 min-w-0">
          {/* 课程名 */}
          <div className="text-sm font-mono text-[#e0e0e0] truncate">
            <span className="text-[#00ff41]">{'>'}</span> {course.name}
          </div>

          {/* 标签行 */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-[rgba(0,255,65,0.2)] text-[#00ff41]">
              {DAY_NAMES[course.dayOfWeek]}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[rgba(0,255,65,0.1)] text-[#00ff41]">
              {course.time}
            </span>
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-[#555] truncate max-w-[180px] hover:text-[#00d4ff] transition-colors"
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
            className="w-7 h-7 rounded flex items-center justify-center
              text-[#888] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)]
              transition-all text-xs font-mono"
          >
            ✎
          </button>
          <button
            onClick={onDelete}
            aria-label="删除课程"
            className="w-7 h-7 rounded flex items-center justify-center
              text-[#888] hover:text-[#ff4444] hover:bg-[rgba(255,68,68,0.1)]
              transition-all text-xs font-mono"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
