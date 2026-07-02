import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CheckinStatus from '../components/CheckinStatus';

describe('CheckinStatus 组件', () => {
  it('无课程时显示"暂无待签课程"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    expect(screen.getByText('暂无待签课程')).toBeInTheDocument();
    expect(
      screen.getByText('点击右下角 + 按钮添加课程')
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

  it('isChecking 为 true 时显示"监控运行中"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    expect(screen.getByText('监控运行中')).toBeInTheDocument();
  });

  it('isChecking 为 false 时显示"监控已暂停"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={false}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    expect(screen.getByText('监控已暂停')).toBeInTheDocument();
  });

  it('位置权限已授权时显示"已定位"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={true}
      />
    );

    expect(screen.getByText('已定位')).toBeInTheDocument();
  });

  it('位置权限未授权时显示"获取位置"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    expect(screen.getByText('获取位置')).toBeInTheDocument();
  });
});
