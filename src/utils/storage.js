/**
 * localStorage 工具模块
 * 提供课程数据的增删改查操作
 */

const STORAGE_KEY = 'checkin_courses';

/**
 * 获取所有课程
 * @returns {Array} 课程数组
 */
export function getCourses() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('读取课程数据失败:', error);
    return [];
  }
}

/**
 * 根据 ID 获取单个课程
 * @param {string} id - 课程 ID
 * @returns {Object|null} 课程对象或 null
 */
export function getCourseById(id) {
  const courses = getCourses();
  return courses.find((course) => course.id === id) || null;
}

/**
 * 添加课程
 * @param {Object} course - 课程对象（不含 id）
 * @returns {Array} 更新后的课程数组
 */
export function addCourse(course) {
  const courses = getCourses();
  const newCourse = {
    ...course,
    id: crypto.randomUUID ? crypto.randomUUID() : generateId(),
  };
  courses.push(newCourse);
  saveCourses(courses);
  return courses;
}

/**
 * 更新课程
 * @param {string} id - 课程 ID
 * @param {Object} updates - 要更新的字段
 * @returns {Array} 更新后的课程数组
 */
export function updateCourse(id, updates) {
  const courses = getCourses();
  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) return courses;
  courses[index] = { ...courses[index], ...updates };
  saveCourses(courses);
  return courses;
}

/**
 * 删除课程
 * @param {string} id - 课程 ID
 * @returns {Array} 更新后的课程数组
 */
export function deleteCourse(id) {
  const courses = getCourses();
  const filtered = courses.filter((c) => c.id !== id);
  saveCourses(filtered);
  return filtered;
}

/**
 * 保存课程数组到 localStorage
 * @param {Array} courses - 课程数组
 */
function saveCourses(courses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch (error) {
    console.error('保存课程数据失败:', error);
  }
}

/**
 * 生成简易唯一 ID（crypto.randomUUID 不可用时回退）
 * @returns {string} 唯一 ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * 清空所有课程数据
 */
export function clearAllCourses() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('清空课程数据失败:', error);
  }
}
