import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CheckinStatus from '../components/CheckinStatus';

// Mock MUI icons
vi.mock('@mui/icons-material/NotificationsActive', () => ({
  default: () => <span data-testid="icon-notifications">🔔</span>,
}));
vi.mock('@mui/icons-material/LocationOn', () => ({
  default: () => <span data-testid="icon-location">📍</span>,
}));
vi.mock('@mui/icons-material/AccessTime', () => ({
  default: () => <span data-testid="icon-time">⏰</span>,
}));
vi.mock('@mui/icons-material/CheckCircleOutline', () => ({
  default: () => <span data-testid="icon-check">✅</span>,
}));

describe('CheckinStatus 组件', () => {
  it('无课程时显示"当前暂无待签到课程"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    expect(screen.getByText('当前暂无待签到课程')).toBeInTheDocument();
    expect(
      screen.getByText('添加课程后将自动显示下一个签到倒计时')
    ).toBeInTheDocument();
  });

  it('有课程时显示倒计时和课程名称', () => {
    const nextCourse = {
      course: {
        name: '高等数学',
        dayOfWeek: 1,
        time: '08:00',
      },
      diffMinutes: 10,
    };

    render(
      <CheckinStatus
        nextCourse={nextCourse}
        countdown="10 分钟 0 秒"
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    // 显示课程名称
    expect(screen.getByText('高等数学')).toBeInTheDocument();
    // 显示倒计时（用 contains 匹配，因为可能有嵌套元素）
    expect(screen.getByText(/10 分钟 0 秒/)).toBeInTheDocument();
    // 显示星期和时间
    expect(screen.getByText(/周一/)).toBeInTheDocument();
    expect(screen.getByText(/08:00/)).toBeInTheDocument();
  });

  it('isChecking 为 true 时显示"运行中"标签', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    expect(screen.getByText('运行中')).toBeInTheDocument();
  });

  it('isChecking 为 false 时显示"已停止"标签', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={false}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    expect(screen.getByText('已停止')).toBeInTheDocument();
  });

  it('位置权限已授权时显示"位置已授权"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={true}
      />
    );

    expect(screen.getByText('位置已授权')).toBeInTheDocument();
  });

  it('位置权限未授权时显示"请求位置权限"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    expect(screen.getByText('请求位置权限')).toBeInTheDocument();
  });
});
