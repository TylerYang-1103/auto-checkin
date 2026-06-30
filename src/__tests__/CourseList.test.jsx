import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CourseList from '../components/CourseList';

// Mock MUI icons used by CourseList
vi.mock('@mui/icons-material/Schedule', () => ({
  default: () => <span data-testid="icon-schedule">📅</span>,
}));
vi.mock('@mui/icons-material/Edit', () => ({
  default: () => <span data-testid="icon-edit">✏️</span>,
}));
vi.mock('@mui/icons-material/Delete', () => ({
  default: () => <span data-testid="icon-delete">🗑️</span>,
}));
vi.mock('@mui/icons-material/OpenInNew', () => ({
  default: () => <span data-testid="icon-open">🔗</span>,
}));
vi.mock('@mui/icons-material/Link', () => ({
  default: () => <span data-testid="icon-link">🔗</span>,
}));

describe('CourseList 组件', () => {
  it('courses 为空数组时显示空状态', () => {
    render(<CourseList courses={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('暂无课程')).toBeInTheDocument();
    expect(
      screen.getByText(/点击右下角的 "\+" 按钮添加课程/)
    ).toBeInTheDocument();
  });

  it('courses 为 null 时显示空状态', () => {
    render(<CourseList courses={null} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('暂无课程')).toBeInTheDocument();
  });

  it('courses 为 undefined 时显示空状态', () => {
    render(<CourseList onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('暂无课程')).toBeInTheDocument();
  });

  it('有课程时显示课程卡片', () => {
    const courses = [
      {
        id: '1',
        name: '高等数学',
        url: 'https://example.com/math',
        dayOfWeek: 1,
        time: '08:00',
      },
      {
        id: '2',
        name: '线性代数',
        url: 'https://example.com/linear',
        dayOfWeek: 3,
        time: '10:00',
      },
    ];

    render(<CourseList courses={courses} onEdit={vi.fn()} onDelete={vi.fn()} />);

    // 验证两门课程都显示
    expect(screen.getByText('高等数学')).toBeInTheDocument();
    expect(screen.getByText('线性代数')).toBeInTheDocument();

    // 显示时间信息
    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('点击编辑按钮触发 onEdit 回调', () => {
    const handleEdit = vi.fn();
    const courses = [
      {
        id: '1',
        name: '高等数学',
        url: 'https://example.com/math',
        dayOfWeek: 1,
        time: '08:00',
      },
    ];

    render(<CourseList courses={courses} onEdit={handleEdit} onDelete={vi.fn()} />);

    // 找到编辑按钮并点击
    const editButtons = screen.getAllByLabelText('编辑课程');
    fireEvent.click(editButtons[0]);

    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleEdit).toHaveBeenCalledWith(courses[0]);
  });

  it('点击删除按钮触发 onDelete 回调', () => {
    const handleDelete = vi.fn();
    const courses = [
      {
        id: '1',
        name: '高等数学',
        url: 'https://example.com/math',
        dayOfWeek: 1,
        time: '08:00',
      },
    ];

    render(
      <CourseList courses={courses} onEdit={vi.fn()} onDelete={handleDelete} />
    );

    // 找到删除按钮并点击
    const deleteButtons = screen.getAllByLabelText('删除课程');
    fireEvent.click(deleteButtons[0]);

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith('1');
  });
});
