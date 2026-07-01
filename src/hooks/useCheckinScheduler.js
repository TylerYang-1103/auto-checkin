import { useState, useEffect, useRef, useCallback } from 'react';
import { getCourses } from '../utils/storage';

/**
 * 星期名称映射
 */
const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/**
 * 获取下一个即将到来的课程签到信息
 * @param {Array} courses - 课程列表
 * @param {Date} now - 当前时间
 * @returns {Object|null} 下一个课程信息或 null
 */
function getNextCourse(courses, now) {
  if (!courses || courses.length === 0) return null;

  const currentDay = now.getDay(); // 0=周日, 1=周一...
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 按 (星期偏移, 时间) 排序找到最近的下一个课程
  let bestCourse = null;
  let bestDiff = Infinity;

  for (const course of courses) {
    const [hours, minutes] = course.time.split(':').map(Number);
    const courseMinutes = hours * 60 + minutes;
    const courseDay = course.dayOfWeek;

    // 计算从当前时间到课程的时间差（分钟）
    let diff;
    if (courseDay === currentDay) {
      // 同一天：如果课程时间 >= 当前时间，差值为正
      if (courseMinutes >= currentMinutes) {
        diff = courseMinutes - currentMinutes;
      } else {
        // 今天的课程已经过了，算到下周同一天
        diff = (7 * 24 * 60) - (currentMinutes - courseMinutes);
      }
    } else {
      // 不同天：计算到下一个该课程日的分钟数
      let daysUntil;
      if (courseDay > currentDay) {
        daysUntil = courseDay - currentDay;
      } else {
        daysUntil = 7 - (currentDay - courseDay);
      }
      diff = daysUntil * 24 * 60 - currentMinutes + courseMinutes;
    }

    if (diff < bestDiff) {
      bestDiff = diff;
      bestCourse = { course, diffMinutes: diff };
    }
  }

  return bestCourse;
}

/**
 * 格式化倒计时
 * @param {number} totalMinutes - 总分钟数
 * @returns {string} 格式化后的倒计时字符串
 */
function formatCountdown(totalMinutes) {
  if (totalMinutes <= 0) return '即将签到';

  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.floor((totalMinutes * 60) % 60);

  // 实际精确到秒的计算
  return `${days > 0 ? `${days} 天 ` : ''}${hours} 小时 ${minutes} 分 ${seconds} 秒`;
}

/**
 * 检查当前时间是否匹配任何课程，并执行签到跳转
 * @param {Array} courses - 课程列表
 * @param {Date} now - 当前时间
 * @returns {boolean} 是否触发了签到跳转
 */
function checkAndTriggerCheckin(courses, now) {
  if (!courses || courses.length === 0) return false;

  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const course of courses) {
    const [hours, minutes] = course.time.split(':').map(Number);
    const courseMinutes = hours * 60 + minutes;

    if (course.dayOfWeek === currentDay && courseMinutes === currentMinutes) {
      // 匹配成功，通过创建并点击 <a> 元素在新标签页打开链接
      const link = document.createElement('a');
      link.href = course.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }
  }

  return false;
}

/**
 * 签到调度器 Hook
 * 每秒检查当前时间是否匹配任何课程，匹配则自动跳转签到
 * 同时提供下一个课程倒计时信息
 *
 * @returns {Object} 签到调度器状态
 */
export function useCheckinScheduler() {
  const [nextCourse, setNextCourse] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const lastCheckedMinuteRef = useRef(null);
  const tickRef = useRef(null);

  const tick = useCallback(() => {
    const now = new Date();
    const courses = getCourses();

    // 更新下一个课程信息（每秒刷新倒计时）
    const next = getNextCourse(courses, now);
    setNextCourse(next);

    if (next) {
      setCountdown(formatCountdown(next.diffMinutes));
    } else {
      setCountdown('');
    }

    // 检查是否到达签到时间（每分钟检查一次）
    const currentMinuteKey = `${now.getDay()}-${now.getHours()}-${now.getMinutes()}`;
    if (lastCheckedMinuteRef.current !== currentMinuteKey) {
      lastCheckedMinuteRef.current = currentMinuteKey;
      checkAndTriggerCheckin(courses, now);
    }
  }, []);

  useEffect(() => {
    // 初始立即执行一次
    tick();

    // 每秒更新
    tickRef.current = setInterval(tick, 1000);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
      }
    };
  }, [tick]);

  /**
   * 手动刷新调度器状态（在课程增删改后调用）
   */
  const refresh = useCallback(() => {
    lastCheckedMinuteRef.current = null;
    tick();
  }, [tick]);

  return {
    nextCourse,
    countdown,
    isChecking,
    refresh,
  };
}

export { DAY_NAMES };
