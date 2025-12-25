import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET;


export const signAccessToken = (userId, role) => {
  return jwt.sign(
    { 
      id: userId, 
      role: role,
      type: 'access'
    },
    JWT_SECRET,
    { 
      expiresIn: "3600s"
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
      expiresIn: "604800s"
    }
  );
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
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
      expiresIn: "3600s" 
    }
  };
};
