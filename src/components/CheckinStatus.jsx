import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { DAY_NAMES } from '../hooks/useCheckinScheduler';

/**
 * 签到状态指示器组件
 * 显示签到调度器的运行状态、下一个课程倒计时等
 *
 * @param {Object} props
 * @param {Object|null} props.nextCourse - 下一个课程信息
 * @param {string} props.countdown - 倒计时文本
 * @param {boolean} props.isChecking - 是否正在检查
 * @param {Function} props.onRequestLocation - 请求位置权限回调
 * @param {boolean} props.locationGranted - 位置权限是否已授予
 */
export default function CheckinStatus({
  nextCourse,
  countdown,
  isChecking,
  onRequestLocation,
  locationGranted,
}) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      className="w-full"
      sx={{
        borderRadius: 2,
        p: 2,
        mb: 2,
      }}
    >
      {/* 状态行：运行状态 + 位置权限 */}
      <Box className="flex flex-wrap items-center justify-between gap-2 mb-2">
        {/* 运行状态 */}
        <Box className="flex items-center gap-2">
          <Chip
            icon={
              <CheckCircleOutlineIcon
                sx={{ fontSize: 18, color: isChecking ? '#2e7d32' : '#9e9e9e' }}
              />
            }
            label={isChecking ? '运行中' : '已停止'}
            color={isChecking ? 'success' : 'default'}
            size="small"
            variant="filled"
          />
          <Typography variant="caption" color="text.secondary">
            每秒检查课程时间
          </Typography>
        </Box>

        {/* 位置权限按钮 */}
        <Button
          variant={locationGranted ? 'text' : 'outlined'}
          size="small"
          color={locationGranted ? 'success' : 'primary'}
          startIcon={<LocationOnIcon />}
          onClick={onRequestLocation}
          sx={{ textTransform: 'none', minWidth: 0 }}
        >
          {locationGranted ? '位置已授权' : '请求位置权限'}
        </Button>
      </Box>

      {/* 下一个课程倒计时 */}
      <Box
        className="flex items-center gap-3 mt-1"
        sx={{
          backgroundColor: nextCourse ? 'rgba(25,118,210,0.06)' : 'transparent',
          borderRadius: 1.5,
          p: nextCourse ? 1.5 : 0,
        }}
      >
        <AccessTimeIcon
          sx={{
            fontSize: 28,
            color: nextCourse ? 'primary.main' : 'text.disabled',
          }}
        />

        {nextCourse ? (
          <Box className="flex-1 min-w-0">
            <Typography
              variant="body2"
              color="text.secondary"
              className="truncate"
              sx={{ lineHeight: 1.2 }}
            >
              下一个签到：
              <Typography
                component="span"
                variant="body2"
                fontWeight={600}
                color="text.primary"
              >
                {nextCourse.course.name}
              </Typography>
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
              >
                {' · '}
                {DAY_NAMES[nextCourse.course.dayOfWeek]} {nextCourse.course.time}
              </Typography>
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              color="primary"
              sx={{ mt: 0.5, fontVariantNumeric: 'tabular-nums' }}
            >
              <NotificationsActiveIcon
                sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }}
              />
              剩余 {countdown}
            </Typography>
          </Box>
        ) : (
          <Box className="flex-1 min-w-0">
            <Typography variant="body2" color="text.secondary">
              当前暂无待签到课程
            </Typography>
            <Typography variant="caption" color="text.disabled">
              添加课程后将自动显示下一个签到倒计时
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
