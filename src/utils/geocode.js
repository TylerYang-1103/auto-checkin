/**
 * 反地理编码：根据经纬度获取城市和区信息
 * 使用 OpenStreetMap Nominatim API（免费，无需 API Key）
 */

const GEOCODE_CACHE_KEY = 'geocode_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时缓存

/**
 * 从 localStorage 读取缓存
 */
function getCache() {
  try {
    return JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * 写入缓存
 */
function setCache(key, data) {
  const cache = getCache();
  cache[key] = {
    data,
    timestamp: Date.now(),
  };
  // 限制缓存大小，防止 localStorage 溢出
  const entries = Object.entries(cache);
  if (entries.length > 50) {
    const sorted = entries.sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
    const trimmed = Object.fromEntries(sorted.slice(0, 50));
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(trimmed));
  } else {
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  }
}

/**
 * 获取缓存的数据
 */
function getCachedData(key) {
  const cache = getCache();
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
}

/**
 * 根据经纬度获取地址信息
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @returns {Promise<{city: string, district: string, displayName: string}>}
 */
export async function reverseGeocode(lat, lng) {
  // 精度保留到小数点后2位作为缓存 key（约 1km 精度）
  const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;

  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14&accept-language=zh`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AutoCheckinApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const address = data.address || {};
    const result = {
      city: address.city || address.town || address.county || address.state || '',
      district: address.district || address.suburb || address.subdistrict || '',
      displayName: data.display_name || '',
    };

    // 写入缓存
    setCache(cacheKey, result);

    return result;
  } catch (error) {
    console.warn('反地理编码请求失败:', error.message);
    // 降级：返回经纬度文本
    return {
      city: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      district: '位置解析失败',
      displayName: '',
    };
  }
}
