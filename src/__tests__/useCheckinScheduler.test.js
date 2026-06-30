import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCheckinScheduler } from '../hooks/useCheckinScheduler';
import * as storage from '../utils/storage';

// Mock localStorage
vi.mock('../utils/storage', () => ({
  getCourses: vi.fn(),
}));

const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/**
 * 创建一个课程对象辅助函数
 */
function makeCourse(overrides = {}) {
  return {
    id: overrides.id ?? 'course-1',
    name: overrides.name ?? '高等数学',
    url: overrides.url ?? 'https://example.com/checkin',
    dayOfWeek: overrides.dayOfWeek ?? 1, // 周一
    time: overrides.time ?? '08:00',
  };
}

/**
 * 设置当前时间为指定时间
 * @param {number} year 年
 * @param {number} month 月 (0-based)
 * @param {number} day 日
 * @param {number} hour 时
 * @param {number} min 分
 * @param {number} sec 秒
 */
function setFakeTime(year, month, day, hour, min, sec = 0) {
  const now = new Date(year, month, day, hour, min, sec);
  vi.setSystemTime(now);
  return now;
}

describe('useCheckinScheduler - 签到调度器', () => {
  let originalLocation;

  beforeEach(() => {
    vi.useFakeTimers();
    originalLocation = window.location;
    // 模拟 window.location（只保留 href 可写）
    delete window.location;
    window.location = { href: '' };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.location = originalLocation;
  });

  describe('getNextCourse 逻辑（通过 hook 输出验证）', () => {
    it('当没有课程时，nextCourse 为 null', () => {
      storage.getCourses.mockReturnValue([]);
      const { result } = renderHook(() => useCheckinScheduler());
      // 初始 tick 使用 Date.now()
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(result.current.nextCourse).toBeNull();
      expect(result.current.countdown).toBe('');
    });
  });

  describe('getNextCourse - 同一天同一时间', () => {
    it('在同一天同一时间返回正确的下一个课程', () => {
      // 当前时间: 2026-07-06 周一 07:50
      // setFakeTime(2026, 6, 6, 7, 50);
      const now = new Date(2026, 6, 6, 7, 50);
      vi.setSystemTime(now);

      const course = makeCourse({ dayOfWeek: 1, time: '08:00' }); // 周一 08:00
      storage.getCourses.mockReturnValue([course]);

      const { result } = renderHook(() => useCheckinScheduler());
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(result.current.nextCourse).not.toBeNull();
      // 相差 10 分钟 = 10*60 = 600 秒？不对，diffMinutes 是 10 分钟
      // diffMinutes 应该是 10（从 07:50 到 08:00）
      // 但我们需要合理验证
      expect(result.current.nextCourse.course.name).toBe('高等数学');
      expect(result.current.countdown).toBe('0 小时 10 分 0 秒');
    });

    it('当当前时间已过课程时间，应显示下周同一天的课程', () => {
      // 当前时间: 2026-07-06 周一 08:30，课程是周一 08:00（已过）
      const now = new Date(2026, 6, 6, 8, 30);
      vi.setSystemTime(now);

      const course = makeCourse({ dayOfWeek: 1, time: '08:00' });
      storage.getCourses.mockReturnValue([course]);

      const { result } = renderHook(() => useCheckinScheduler());
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(result.current.nextCourse).not.toBeNull();
      // 距离下周一同一时间还有 7天 - 30分钟 = 10080 - 30 = 10050 分钟
      // 显示应该包含 "6 天" 或类似内容
      expect(result.current.nextCourse.course.name).toBe('高等数学');
    });
  });

  describe('getNextCourse - 跨天找到下周的课程', () => {
    it('当今天是周六，下一个课程在下周一，应显示跨天的倒计时', () => {
      // 当前时间: 2026-07-11 周六 10:00
      const now = new Date(2026, 6, 11, 10, 0);
      vi.setSystemTime(now);

      const course = makeCourse({ dayOfWeek: 1, time: '08:00' }); // 周一
      storage.getCourses.mockReturnValue([course]);

      const { result } = renderHook(() => useCheckinScheduler());
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(result.current.nextCourse).not.toBeNull();
      // 周六到周一 = 2天，但到 08:00 - 10:00 = -2小时
      // daysUntil = 1 (周一 - 周六 = 1-6 = -5 -> 7-5=2)
      // diff = 2 * 24 * 60 - 10*60 + 8*60 = 2880 - 600 + 480 = 2760 分钟
      // 应该显示 "1 天 22 小时 0 分"
      // 2760 / (24*60) = 1 天, 2760 % 1440 = 1320 / 60 = 22 小时
      expect(result.current.countdown).toContain('1 天');
      expect(result.current.countdown).toContain('22 小时');
    });
  });

  describe('checkAndTriggerCheckin - 触发跳转', () => {
    it('在当前时间匹配课程时触发 window.location.href 跳转', () => {
      // 当前时间: 2026-07-06 周一 08:00:00（精确匹配）
      const now = new Date(2026, 6, 6, 8, 0, 0);
      vi.setSystemTime(now);

      const course = makeCourse({
        dayOfWeek: 1,
        time: '08:00',
        url: 'https://example.com/checkin',
      });
      storage.getCourses.mockReturnValue([course]);

      renderHook(() => useCheckinScheduler());
      act(() => {
        vi.advanceTimersByTime(0);
      });

      // 初始 tick 应该触发 checkAndTriggerCheckin，跳转到课程 URL
      expect(window.location.href).toBe('https://example.com/checkin');
    });

    it('在当前时间不匹配课程时不触发跳转', () => {
      // 当前时间: 2026-07-06 周一 07:50（不匹配 08:00）
      const now = new Date(2026, 6, 6, 7, 50, 0);
      vi.setSystemTime(now);

      const course = makeCourse({
        dayOfWeek: 1,
        time: '08:00',
        url: 'https://example.com/checkin',
      });
      storage.getCourses.mockReturnValue([course]);

      renderHook(() => useCheckinScheduler());
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(window.location.href).toBe('');
    });

    it('课程列表为空时不触发跳转', () => {
      const now = new Date(2026, 6, 6, 8, 0, 0);
      vi.setSystemTime(now);

      storage.getCourses.mockReturnValue([]);

      renderHook(() => useCheckinScheduler());
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(window.location.href).toBe('');
    });
  });

  describe('refresh 功能', () => {
    it('refresh 方法能重新计算下一个课程', () => {
      const now = new Date(2026, 6, 6, 7, 50, 0);
      vi.setSystemTime(now);

      const course = makeCourse({ dayOfWeek: 1, time: '08:00' });
      storage.getCourses.mockReturnValue([course]);

      const { result } = renderHook(() => useCheckinScheduler());
      act(() => {
        vi.advanceTimersByTime(0);
      });

      const initialNextCourse = result.current.nextCourse;
      expect(initialNextCourse).not.toBeNull();

      // 改变时间并 refresh
      const newNow = new Date(2026, 6, 6, 7, 55, 0);
      vi.setSystemTime(newNow);

      act(() => {
        result.current.refresh();
      });

      // 现在距离 08:00 只有 5 分钟
      expect(result.current.countdown).toBe('0 小时 5 分 0 秒');
    });
  });
});
