import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Link,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LinkIcon from '@mui/icons-material/Link';
import { DAY_NAMES } from '../hooks/useCheckinScheduler';

/**
 * 课程列表组件
 * 以卡片形式展示所有课程，支持编辑和删除操作
 *
 * @param {Object} props
 * @param {Array} props.courses - 课程数组
 * @param {Function} props.onEdit - 编辑课程回调
 * @param {Function} props.onDelete - 删除课程回调
 */
export default function CourseList({ courses, onEdit, onDelete }) {
  if (!courses || courses.length === 0) {
    return (
      <Box
        className="flex flex-col items-center justify-center py-16 text-gray-400"
        sx={{ minHeight: 200 }}
      >
        <ScheduleIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
        <Typography variant="h6" color="text.secondary">
          暂无课程
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          点击右下角的 "+" 按钮添加课程
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-3 px-2">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onEdit={() => onEdit(course)}
          onDelete={() => onDelete(course.id)}
        />
      ))}
    </Box>
  );
}

/**
 * 单个课程卡片组件
 *
 * @param {Object} props
 * @param {Object} props.course - 课程对象
 * @param {Function} props.onEdit - 编辑回调
 * @param {Function} props.onDelete - 删除回调
 */
function CourseCard({ course, onEdit, onDelete }) {
  return (
    <Card
      variant="outlined"
      className="w-full"
      sx={{
        borderRadius: 2,
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* 课程名称和操作按钮行 */}
        <Box className="flex items-start justify-between">
          <Typography
            variant="h6"
            component="div"
            className="font-semibold"
            sx={{ fontSize: '1.1rem', lineHeight: 1.3 }}
          >
            {course.name}
          </Typography>
          <CardActions sx={{ p: 0, ml: 1, flexShrink: 0 }}>
            <IconButton
              size="small"
              color="primary"
              onClick={onEdit}
              aria-label="编辑课程"
              sx={{ '&:hover': { backgroundColor: 'rgba(25,118,210,0.08)' } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={onDelete}
              aria-label="删除课程"
              sx={{ '&:hover': { backgroundColor: 'rgba(211,47,47,0.08)' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </CardActions>
        </Box>

        {/* 课程信息标签区域 */}
        <Box className="flex flex-wrap items-center gap-2 mt-2">
          {/* 星期标签 */}
          <Chip
            icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
            label={DAY_NAMES[course.dayOfWeek]}
            size="small"
            color="primary"
            variant="outlined"
          />

          {/* 时间标签 */}
          <Chip
            label={course.time}
            size="small"
            color="primary"
            variant="filled"
            sx={{
              fontWeight: 500,
              minWidth: 60,
            }}
          />

          {/* 链接标签 */}
          <Chip
            icon={<LinkIcon sx={{ fontSize: 14 }} />}
            label={
              <Link
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                color="inherit"
                sx={{
                  fontSize: '0.75rem',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {course.url}
              </Link>
            }
            size="small"
            variant="outlined"
            color="default"
            deleteIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            onDelete={() => window.open(course.url, '_blank')}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
