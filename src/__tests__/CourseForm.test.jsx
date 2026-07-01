import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseForm from '../components/CourseForm';

/**
 * 辅助函数：通过 placeholder 获取输入框
 */
function getNameInput() {
  return screen.getByPlaceholderText('e.g. MATH_101');
}

function getUrlInput() {
  return screen.getByPlaceholderText('https://example.com/checkin');
}

describe('CourseForm 组件', () => {
  const defaultProps = {
    open: true,
    course: null,
    onSave: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('表单验证', () => {
    it('课程名称为空时显示错误 "请输入课程名称"', async () => {
      const user = userEvent.setup();
      render(<CourseForm {...defaultProps} />);

      // 确认课程名称为空
      const nameInput = getNameInput();
      expect(nameInput).toHaveValue('');

      // 点击添加按钮触发验证
      const addButton = screen.getByText('$ add');
      await user.click(addButton);

      expect(screen.getByText('ERROR: 请输入课程名称')).toBeInTheDocument();
    });

    it('签到链接为空时显示错误 "请输入签到链接"', async () => {
      const user = userEvent.setup();
      render(<CourseForm {...defaultProps} />);

      // 先填写课程名称让名称验证通过
      const nameInput = getNameInput();
      await user.type(nameInput, '高等数学');

      // 保持链接为空，点击添加
      const addButton = screen.getByText('$ add');
      await user.click(addButton);

      expect(screen.getByText('ERROR: 请输入签到链接')).toBeInTheDocument();
    });

    it('签到链接为无效 URL 时显示错误', async () => {
      const user = userEvent.setup();
      render(<CourseForm {...defaultProps} />);

      const nameInput = getNameInput();
      await user.type(nameInput, '高等数学');

      const urlInput = getUrlInput();
      await user.type(urlInput, 'not-a-valid-url');

      const addButton = screen.getByText('$ add');
      await user.click(addButton);

      expect(
        screen.getByText(/ERROR: 请输入有效的 URL/)
      ).toBeInTheDocument();
    });

    it('所有字段有效时调用 onSave', async () => {
      const handleSave = vi.fn();
      const user = userEvent.setup();

      render(<CourseForm {...defaultProps} onSave={handleSave} />);

      const nameInput = getNameInput();
      await user.type(nameInput, '高等数学');

      const urlInput = getUrlInput();
      await user.type(urlInput, 'https://example.com/checkin');

      const addButton = screen.getByText('$ add');
      await user.click(addButton);

      expect(handleSave).toHaveBeenCalledTimes(1);
      expect(handleSave).toHaveBeenCalledWith({
        name: '高等数学',
        url: 'https://example.com/checkin',
        dayOfWeek: 1,
        time: '08:00',
      });
    });
  });

  describe('编辑模式', () => {
    it('编辑模式下显示课程编辑标题', () => {
      const course = {
        id: '1',
        name: '高等数学',
        url: 'https://example.com/math',
        dayOfWeek: 1,
        time: '08:00',
      };

      render(<CourseForm {...defaultProps} course={course} />);

      expect(screen.getByText('$ EDIT_COURSE // 高等数学')).toBeInTheDocument();
    });

    it('编辑模式下按钮显示"$ update"', () => {
      const course = {
        id: '1',
        name: '高等数学',
        url: 'https://example.com/math',
        dayOfWeek: 1,
        time: '08:00',
      };

      render(<CourseForm {...defaultProps} course={course} />);

      expect(screen.getByText('$ update')).toBeInTheDocument();
    });

    it('编辑模式下预填课程数据', () => {
      const course = {
        id: '1',
        name: '高等数学',
        url: 'https://example.com/math',
        dayOfWeek: 1,
        time: '10:00',
      };

      render(<CourseForm {...defaultProps} course={course} />);

      const nameInput = getNameInput();
      expect(nameInput).toHaveValue('高等数学');

      const urlInput = getUrlInput();
      expect(urlInput).toHaveValue('https://example.com/math');
    });
  });

  describe('对话框关闭', () => {
    it('点击取消按钮时调用 onClose', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(<CourseForm {...defaultProps} onClose={handleClose} />);

      const cancelButton = screen.getByText('$ cancel');
      await user.click(cancelButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
