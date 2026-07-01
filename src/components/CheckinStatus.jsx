import React from 'react';
import { DAY_NAMES } from '../hooks/useCheckinScheduler';

/**
 * 签到状态指示器组件
 * 显示签到调度器的运行状态、下一个课程倒计时等
 *
 * @param {Object} props
 * @param {Object|null} props.nextCourse - 下一个课程信息
 * @param {string} props.countdown - 倒计时文本
 * @param {boolean} props.isChecking - 是否正在检查
 * @param {Function} props.onRequestLocation - 请求位置权限回调
 * @param {boolean} props.locationGranted - 位置权限是否已授予
 * @param {Object|null} props.position - 位置坐标 { lat, lng }
 */
export default function CheckinStatus({
  nextCourse,
  countdown,
  isChecking,
  onRequestLocation,
  locationGranted,
  position,
}) {
  return (
    <div className="glass-card p-4 mb-4">
      {/* 状态行 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isChecking
                ? 'bg-[#00ff41] shadow-[0_0_6px_rgba(0,255,65,0.8)]'
                : 'bg-[#666]'
            }`}
          />
          <span className="text-xs font-mono text-[#888]">
            {isChecking ? 'STATUS: ACTIVE' : 'STATUS: STOPPED'}
          </span>
          <span className="text-[10px] font-mono text-[#555]">
            /* {isChecking ? 'checking every 1s' : 'idle'} */
          </span>
        </div>

        <button
          onClick={onRequestLocation}
          className={`text-xs font-mono px-3 py-1 rounded border transition-all
            ${
              locationGranted
                ? 'border-[rgba(0,255,65,0.3)] text-[#00ff41] bg-[rgba(0,255,65,0.05)]'
                : 'border-[rgba(0,212,255,0.3)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.05)]'
            }`}
        >
          {locationGranted ? 'GPS: LOCKED' : 'REQUEST GPS_'}
        </button>
      </div>

      {/* 下一个课程 */}
      {nextCourse ? (
        <div className="border-t border-[rgba(0,255,65,0.08)] pt-3">
          <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-1">
            Next Check-in_
          </div>
          <div className="text-sm font-mono text-[#c0c0c0] truncate">
            {nextCourse.course.name}
            <span className="text-[#666]">
              {' '}
              // {DAY_NAMES[nextCourse.course.dayOfWeek]}{' '}
              {nextCourse.course.time}
            </span>
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-[#00ff41] neon-text tracking-wider">
            {'>'} {countdown}
          </div>
        </div>
      ) : (
        <div className="border-t border-[rgba(0,255,65,0.08)] pt-3">
          <div className="text-xs font-mono text-[#555]">
            $ no upcoming courses scheduled
          </div>
          <div className="text-[10px] font-mono text-[#444] mt-1">
            /* add a course to begin */
          </div>
        </div>
      )}
    </div>
  );
}
