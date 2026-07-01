import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CheckinStatus from '../components/CheckinStatus';

describe('CheckinStatus 组件', () => {
  it('无课程时显示"$ no upcoming courses scheduled"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    expect(screen.getByText('$ no upcoming courses scheduled')).toBeInTheDocument();
    expect(
      screen.getByText('/* add a course to begin */')
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

  it('isChecking 为 true 时显示"STATUS: ACTIVE"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    expect(screen.getByText('STATUS: ACTIVE')).toBeInTheDocument();
  });

  it('isChecking 为 false 时显示"STATUS: STOPPED"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={false}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    expect(screen.getByText('STATUS: STOPPED')).toBeInTheDocument();
  });

  it('位置权限已授权时显示"GPS: LOCKED"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={true}
      />
    );

    expect(screen.getByText('GPS: LOCKED')).toBeInTheDocument();
  });

  it('位置权限未授权时显示"REQUEST GPS_"', () => {
    render(
      <CheckinStatus
        nextCourse={null}
        countdown=""
        isChecking={true}
        onRequestLocation={vi.fn()}
        locationGranted={false}
      />
    );

    expect(screen.getByText('REQUEST GPS_')).toBeInTheDocument();
  });
});
