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
    <div className="panel-white p-4 mb-4">
      {/* 状态行 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`status-dot ${isChecking ? 'status-dot-active' : 'status-dot-inactive'}`}
          />
          <span className="text-xs" style={{ color: 'rgba(0,0,0,0.62)', fontWeight: 400 }}>
            {isChecking ? 'STATUS: ACTIVE' : 'STATUS: STOPPED'}
          </span>
        </div>

        <button
          onClick={onRequestLocation}
          className="pill px-3 py-1.5 text-xs font-medium transition-all duration-200"
          style={{
            color: locationGranted ? '#4b6bff' : '#4b6bff',
            backgroundColor: locationGranted ? 'rgba(75,107,255,0.06)' : 'transparent',
            border: `1px solid ${locationGranted ? '#4b6bff' : 'rgba(75,107,255,0.4)'}`,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(75,107,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = locationGranted ? 'rgba(75,107,255,0.06)' : 'transparent';
          }}
        >
          {locationGranted ? 'GPS: LOCKED' : 'REQUEST GPS_'}
        </button>
      </div>

      {/* 下一个课程 */}
      {nextCourse ? (
        <div style={{ borderTop: '1px solid rgba(15,23,42,0.06)' }} className="pt-3">
          <div
            className="text-xs mb-1.5"
            style={{ color: 'rgba(0,0,0,0.48)', fontWeight: 540, letterSpacing: '0.03em' }}
          >
            Next Check-in_
          </div>
          <div className="text-sm truncate" style={{ color: 'rgba(0,0,0,0.7)', fontWeight: 500 }}>
            {nextCourse.course.name}
            <span style={{ color: 'rgba(0,0,0,0.48)' }}>
              {' '}
              {DAY_NAMES[nextCourse.course.dayOfWeek]}{' '}
              {nextCourse.course.time}
            </span>
          </div>
          <div
            className="mt-2 tracking-tight section-title-weight"
            style={{ fontSize: 22, fontWeight: 620, color: '#111318', letterSpacing: '-0.02em' }}
          >
            {'>'} {countdown}
          </div>
        </div>
      ) : (
        <div style={{ borderTop: '1px solid rgba(15,23,42,0.06)' }} className="pt-3">
          <div className="text-xs" style={{ color: 'rgba(0,0,0,0.62)' }}>
            $ no upcoming courses scheduled
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.38)' }}>
            /* add a course to begin */
          </div>
        </div>
      )}
    </div>
  );
}
