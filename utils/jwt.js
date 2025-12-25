import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET;
const JWT_EXPIRE = process.env.JWT_ACCESS_EXPIRES_IN || '3600s';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRES_IN || '604800s';

export const signAccessToken = (userId, role) => {
  return jwt.sign(
    { 
      id: userId, 
      role: role,
      type: 'access'
    },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRE
    }
  );
};

export const signRefreshToken = (userId, role) => {
  return jwt.sign(
    { 
      id: userId, 
      role: role,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { 
      expiresIn: JWT_REFRESH_EXPIRE
    }
  );
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
    });
  } catch {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
    });
  } catch {
    throw new Error('Invalid refresh token');
  }
};

export const generateTokenPair = (userId, role) => {
  const accessToken = signAccessToken(userId, role);
  const refreshToken = signRefreshToken(userId, role);
  
  return {
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRE
    }
  };
};
