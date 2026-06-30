/**
 * Phân tích chuỗi JWT token và trả về payload
 * @param {string} token 
 * @returns {object|null}
 */
export const parseJwt = (token) => {
  try {
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

/**
 * Lấy ID người dùng từ JWT token
 * @param {string} token 
 * @returns {string|null}
 */
export const getCurrentUserId = (token) => {
  const payload = parseJwt(token);
  if (!payload) return null;
  
  // Hỗ trợ cả hai định dạng payload thường gặp
  return payload?.user?.id || payload?.id || null;
};
