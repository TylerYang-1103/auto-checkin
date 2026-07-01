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
    <div className="glass-panel p-5 mb-5 animate-slide-up">
      {/* 状态行 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`status-indicator ${isChecking ? 'status-active' : 'status-inactive'}`} />
          <span className="text-xs font-medium tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            {isChecking ? '监控运行中' : '监控已暂停'}
          </span>
        </div>

        <button
          onClick={onRequestLocation}
          className={`glass-button px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
            locationGranted ? 'text-blue-600' : ''
          }`}
          style={{
            color: locationGranted ? '#4b6bff' : 'var(--text-secondary)',
            background: locationGranted
              ? 'linear-gradient(135deg, rgba(75, 107, 255, 0.08), rgba(124, 58, 237, 0.05))'
              : '',
            borderColor: locationGranted ? 'rgba(75, 107, 255, 0.2)' : '',
          }}
        >
          {locationGranted ? '已定位' : '获取位置'}
        </button>
      </div>

      {/* 分隔线 */}
      <div className="divider-gradient" />

      {/* 下一个课程 */}
      {nextCourse ? (
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-xs font-medium tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
            下次签到
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {nextCourse.course.name}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {DAY_NAMES[nextCourse.course.dayOfWeek]} {nextCourse.course.time}
            </span>
          </div>
          <div
            className="font-mono font-semibold tracking-tight mt-2"
            style={{
              fontSize: 28,
              background: 'linear-gradient(135deg, #4b6bff 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {countdown}
          </div>
        </div>
      ) : (
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-xs font-medium tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
            下次签到
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            暂无待签课程
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            点击右下角 + 按钮添加课程
          </div>
        </div>
      )}
    </div>
  );
}
