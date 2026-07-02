import React, { useState, useRef, useCallback, useEffect } from 'react';

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;
const HALF_VISIBLE = Math.floor(VISIBLE_ITEMS / 2); // 2

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

/**
 * 滚动时间选择器组件
 * 两个并列滚轮：小时(00-23) + 分钟(00-59)，毛玻璃风格
 *
 * @param {Object} props
 * @param {string} props.value - 当前选中时间 (HH:MM)
 * @param {Function} props.onChange - 时间变化回调 (val: HH:MM)
 */
export default function TimePicker({ value = '08:00', onChange }) {
  const [hourIdx, setHourIdx] = useState(parseInt(value.split(':')[0], 10) || 8);
  const [minuteIdx, setMinuteIdx] = useState(parseInt(value.split(':')[1], 10) || 0);

  // 当外部 value 变化时同步内部状态
  useEffect(() => {
    const h = parseInt(value.split(':')[0], 10);
    const m = parseInt(value.split(':')[1], 10);
    if (!isNaN(h) && !isNaN(m)) {
      setHourIdx(Math.max(0, Math.min(23, h)));
      setMinuteIdx(Math.max(0, Math.min(59, m)));
    }
  }, [value]);

  /** 统一触发变更回调 */
  const notifyChange = useCallback(
    (h, m) => {
      const clampedH = Math.max(0, Math.min(23, h));
      const clampedM = Math.max(0, Math.min(59, m));
      const val = `${String(clampedH).padStart(2, '0')}:${String(clampedM).padStart(2, '0')}`;
      onChange(val);
    },
    [onChange]
  );

  return (
    <div
      className="flex items-center justify-center gap-2 rounded-xl select-none"
      style={{
        background: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        border: '1.5px solid rgba(31, 38, 135, 0.10)',
        padding: '6px 8px',
      }}
    >
      {/* 小时滚轮 */}
      <Wheel
        items={HOURS}
        selectedIndex={hourIdx}
        onSelect={(idx) => {
          setHourIdx(idx);
          notifyChange(idx, minuteIdx);
        }}
      />

      {/* 分隔冒号 */}
      <span
        className="font-mono text-sm font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        :
      </span>

      {/* 分钟滚轮 */}
      <Wheel
        items={MINUTES}
        selectedIndex={minuteIdx}
        onSelect={(idx) => {
          setMinuteIdx(idx);
          notifyChange(hourIdx, idx);
        }}
      />
    </div>
  );
}

/**
 * 单个滚轮子组件
 *
 * @param {Object} props
 * @param {Array<string>} props.items - 选项数组
 * @param {number} props.selectedIndex - 当前选中索引
 * @param {Function} props.onSelect - 选中回调 (index)
 */
function Wheel({ items, selectedIndex, onSelect }) {
  const containerRef = useRef(null);
  const [offsetY, setOffsetY] = useState(0);         // 当前拖动偏移 (px)
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const dragStartY = useRef(0);
  const dragStartOffset = useRef(0);
  const velocityRef = useRef(0);
  const lastMoveTime = useRef(0);
  const lastMoveY = useRef(0);
  const animFrameRef = useRef(null);

  /** 计算当前选中索引对应的 translateY */
  const getSnapY = useCallback(
    (idx) => -idx * ITEM_HEIGHT,
    []
  );

  /** 将偏移量对齐到最近的选项 */
  const snapToNearest = useCallback(
    (offset, animate = true) => {
      const snappedIdx = Math.round(-offset / ITEM_HEIGHT);
      const clampedIdx = Math.max(0, Math.min(items.length - 1, snappedIdx));
      const targetY = getSnapY(clampedIdx);

      if (animate) {
        setIsAnimating(true);
      }
      setOffsetY(targetY);
      onSelect(clampedIdx);

      if (animate) {
        setTimeout(() => setIsAnimating(false), 300);
      }
    },
    [items.length, getSnapY, onSelect]
  );

  /** 初始化偏移到当前选中项 */
  useEffect(() => {
    setOffsetY(getSnapY(selectedIndex));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Touch Events ----
  const handleTouchStart = useCallback(
    (e) => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setIsDragging(true);
      setIsAnimating(false);
      dragStartY.current = e.touches[0].clientY;
      dragStartOffset.current = offsetY;
      velocityRef.current = 0;
      lastMoveTime.current = Date.now();
      lastMoveY.current = e.touches[0].clientY;
    },
    [offsetY]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const dy = e.touches[0].clientY - dragStartY.current;
      const newOffset = dragStartOffset.current + dy;

      // 边界回弹：超出范围时阻力增大
      const maxOffset = 0;
      const minOffset = -(items.length - 1) * ITEM_HEIGHT;
      let boundedOffset = newOffset;
      if (newOffset > maxOffset) {
        boundedOffset = maxOffset + (newOffset - maxOffset) * 0.2;
      } else if (newOffset < minOffset) {
        boundedOffset = minOffset + (newOffset - minOffset) * 0.2;
      }

      setOffsetY(boundedOffset);

      // 计算速度（用于惯性）
      const now = Date.now();
      const dt = now - lastMoveTime.current;
      if (dt > 0) {
        velocityRef.current = (e.touches[0].clientY - lastMoveY.current) / dt;
      }
      lastMoveTime.current = now;
      lastMoveY.current = e.touches[0].clientY;
    },
    [isDragging, items.length]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // 惯性滑动
    const vel = velocityRef.current;
    if (Math.abs(vel) > 0.3) {
      const inertiaDistance = vel * 180; // 惯性距离
      const targetOffset = offsetY + inertiaDistance;
      const targetIdx = Math.round(-targetOffset / ITEM_HEIGHT);
      const clampedIdx = Math.max(0, Math.min(items.length - 1, targetIdx));
      const targetSnap = getSnapY(clampedIdx);

      setIsAnimating(true);
      setOffsetY(targetSnap);
      onSelect(clampedIdx);
      setTimeout(() => setIsAnimating(false), 300);
    } else {
      snapToNearest(offsetY);
    }

    velocityRef.current = 0;
  }, [isDragging, offsetY, items.length, getSnapY, onSelect, snapToNearest]);

  // ---- Mouse Wheel Event ----
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      const newIdx = Math.max(0, Math.min(items.length - 1, selectedIndex + delta));
      const targetY = getSnapY(newIdx);
      setIsAnimating(true);
      setOffsetY(targetY);
      onSelect(newIdx);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [items.length, selectedIndex, getSnapY, onSelect]
  );

  // ---- Click to Select ----
  const handleContainerClick = useCallback(
    (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const centerY = (VISIBLE_ITEMS * ITEM_HEIGHT) / 2;
      const deltaFromCenter = relativeY - centerY;
      const offsetIndex = Math.round(deltaFromCenter / ITEM_HEIGHT);
      const clickedIdx = Math.max(0, Math.min(items.length - 1, selectedIndex + offsetIndex));
      const targetY = getSnapY(clickedIdx);
      setIsAnimating(true);
      setOffsetY(targetY);
      onSelect(clickedIdx);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [items.length, selectedIndex, getSnapY, onSelect]
  );

  // 滚轮窗口高度
  const viewportHeight = VISIBLE_ITEMS * ITEM_HEIGHT;
  // 顶部和底部的填充（使选项居中）
  const paddingOffset = HALF_VISIBLE * ITEM_HEIGHT;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg"
      style={{
        width: 52,
        height: viewportHeight,
        cursor: 'grab',
        userSelect: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onClick={handleContainerClick}
    >
      {/* 选中的高亮指示器（中间一行） */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{
          top: paddingOffset,
          height: ITEM_HEIGHT,
          background: 'linear-gradient(135deg, rgba(75, 107, 255, 0.08), rgba(124, 58, 237, 0.05))',
          borderTop: '1px solid rgba(75, 107, 255, 0.15)',
          borderBottom: '1px solid rgba(75, 107, 255, 0.15)',
          borderRadius: 4,
        }}
      />

      {/* 左侧刻度指示装饰 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 pointer-events-none z-10"
        style={{
          left: 2,
          top: paddingOffset + 6,
          height: ITEM_HEIGHT - 12,
          background: '#4b6bff',
          borderRadius: 2,
          opacity: 0.6,
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-0.5 pointer-events-none z-10"
        style={{
          right: 2,
          top: paddingOffset + 6,
          height: ITEM_HEIGHT - 12,
          background: '#4b6bff',
          borderRadius: 2,
          opacity: 0.6,
        }}
      />

      {/* 列表容器 */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: paddingOffset,
          transform: `translateY(${offsetY}px)`,
          transition: isAnimating && !isDragging
            ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            : isDragging
              ? 'none'
              : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        {items.map((item, idx) => {
          const distance = Math.abs(idx - selectedIndex);
          const isSelected = idx === selectedIndex;

          // 非选中行透明度渐变
          let opacity;
          let scale;
          let color;
          if (isSelected) {
            opacity = 1;
            scale = 1;
            color = '#4b6bff';
          } else if (distance === 1) {
            opacity = 0.55;
            scale = 0.9;
            color = 'var(--text-secondary)';
          } else if (distance === 2) {
            opacity = 0.3;
            scale = 0.82;
            color = 'var(--text-tertiary)';
          } else {
            opacity = 0.08;
            scale = 0.72;
            color = 'var(--text-tertiary)';
          }

          return (
            <div
              key={item}
              className="flex items-center justify-center font-mono whitespace-nowrap"
              style={{
                height: ITEM_HEIGHT,
                fontSize: isSelected ? 16 : 14,
                fontWeight: isSelected ? 700 : 500,
                opacity,
                transform: `scale(${scale})`,
                color,
                transition: 'all 0.15s ease-out',
                lineHeight: `${ITEM_HEIGHT}px`,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>

      {/* 顶部渐变遮罩 */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: paddingOffset,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, transparent 100%)',
        }}
      />

      {/* 底部渐变遮罩 */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: paddingOffset,
          background: 'linear-gradient(to top, rgba(255,255,255,0.9) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
