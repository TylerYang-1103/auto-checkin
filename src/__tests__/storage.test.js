import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  clearAllCourses,
  getCourseById,
} from '../utils/storage';

const STORAGE_KEY = 'checkin_courses';

describe('storage.js - 课程数据管理', () => {
  // 每个测试前清空 localStorage
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getCourses()', () => {
    it('默认返回空数组', () => {
      const courses = getCourses();
      expect(courses).toEqual([]);
    });

    it('返回 localStorage 中存储的课程数据', () => {
      const mockData = [
        { id: '1', name: '高等数学', time: '08:00', dayOfWeek: 1 },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
      const courses = getCourses();
      expect(courses).toEqual(mockData);
    });

    it('localStorage 中存储了无效 JSON 时返回空数组', () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json');
      const courses = getCourses();
      expect(courses).toEqual([]);
    });
  });

  describe('addCourse()', () => {
    it('正确添加课程并返回包含 id 的课程数组', () => {
      const courseData = {
        name: '高等数学',
        url: 'https://example.com/checkin',
        dayOfWeek: 1,
        time: '08:00',
      };

      const result = addCourse(courseData);

      // 返回的数组包含新课程
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('高等数学');
      expect(result[0].url).toBe('https://example.com/checkin');
      expect(result[0].dayOfWeek).toBe(1);
      expect(result[0].time).toBe('08:00');
      // 自动生成了 id
      expect(result[0].id).toBeDefined();
      expect(typeof result[0].id).toBe('string');

      // 数据已持久化到 localStorage
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toEqual(result);
    });

    it('添加多门课程时 ID 各不相同', () => {
      const course1 = addCourse({ name: '数学', url: 'https://a.com', dayOfWeek: 1, time: '08:00' });
      const course2 = addCourse({ name: '英语', url: 'https://b.com', dayOfWeek: 2, time: '10:00' });

      expect(course1).toHaveLength(1);
      expect(course2).toHaveLength(2);
      expect(course1[0].id).not.toBe(course2[1].id);
    });
  });

  describe('updateCourse()', () => {
    it('正确更新课程字段', () => {
      const [added] = addCourse({
        name: '高等数学',
        url: 'https://example.com/math',
        dayOfWeek: 1,
        time: '08:00',
      });

      const result = updateCourse(added.id, { name: '线性代数', time: '10:00' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('线性代数');
      expect(result[0].time).toBe('10:00');
      // 未更新的字段保持不变
      expect(result[0].url).toBe('https://example.com/math');
      expect(result[0].dayOfWeek).toBe(1);

      // 数据已持久化
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored[0].name).toBe('线性代数');
    });

    it('更新不存在的课程 ID 时返回原数组', () => {
      addCourse({ name: '数学', url: 'https://a.com', dayOfWeek: 1, time: '08:00' });
      const result = updateCourse('non-existent-id', { name: '新名称' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('数学');
    });
  });

  describe('deleteCourse()', () => {
    it('正确删除课程', () => {
      const [course1] = addCourse({ name: '数学', url: 'https://a.com', dayOfWeek: 1, time: '08:00' });
      addCourse({ name: '英语', url: 'https://b.com', dayOfWeek: 2, time: '10:00' });

      const result = deleteCourse(course1.id);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('英语');

      // localStorage 也已更新
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toHaveLength(1);
    });

    it('删除不存在的 ID 时返回原数组', () => {
      addCourse({ name: '数学', url: 'https://a.com', dayOfWeek: 1, time: '08:00' });
      const result = deleteCourse('non-existent');
      expect(result).toHaveLength(1);
    });
  });

  describe('clearAllCourses()', () => {
    it('清空所有课程', () => {
      addCourse({ name: '数学', url: 'https://a.com', dayOfWeek: 1, time: '08:00' });
      addCourse({ name: '英语', url: 'https://b.com', dayOfWeek: 2, time: '10:00' });

      clearAllCourses();

      const courses = getCourses();
      expect(courses).toEqual([]);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('getCourseById()', () => {
    it('按 ID 查找课程并返回正确结果', () => {
      addCourse({ name: '数学', url: 'https://a.com', dayOfWeek: 1, time: '08:00' });
      const coursesAfterAdd = addCourse({ name: '英语', url: 'https://b.com', dayOfWeek: 2, time: '10:00' });
      const course2 = coursesAfterAdd[1];

      const found = getCourseById(course2.id);
      expect(found).not.toBeNull();
      expect(found.name).toBe('英语');

      // 不存在的 ID 返回 null
      const notFound = getCourseById('nonexistent');
      expect(notFound).toBeNull();
    });
  });
});
