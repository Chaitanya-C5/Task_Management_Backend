import { body, query, param } from 'express-validator';

export const sanitizeInput = (field) => {
  return body(field).customSanitizer(value => {
    if (typeof value === 'string') {
      return value
        .replace(/[$]/g, '') 
        .replace(/[{}]/g, '') 
        .trim();
    }
    return value;
  });
};

export const sanitizeQuery = (field) => {
  return query(field).customSanitizer(value => {
    if (typeof value === 'string') {
      return value
        .replace(/[$]/g, '')
        .replace(/[{}]/g, '')
        .trim();
    }
    return value;
  });
};

export const sanitizeParam = (field) => {
  return param(field).customSanitizer(value => {
    if (typeof value === 'string') {
      return value
        .replace(/[$]/g, '')
        .replace(/[{}]/g, '')
        .trim();
    }
    return value;
  });
};

export const sanitizeXSS = (field) => {
  return body(field).customSanitizer(value => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') 
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') 
        .replace(/javascript:/gi, '') 
        .replace(/on\w+\s*=/gi, '') 
        .trim();
    }
    return value;
  });
};

export const sanitizeUserInput = [
  sanitizeInput('username'),
  sanitizeInput('email'),
  sanitizeXSS('username'),
  sanitizeXSS('description'),
  sanitizeXSS('title'),
  sanitizeXSS('name')
];

export const sanitizeSearchQuery = [
  sanitizeQuery('search'),
  sanitizeQuery('status'),
  sanitizeQuery('priority'),
  sanitizeQuery('category'),
  sanitizeQuery('dueDate[gte]'),
  sanitizeQuery('dueDate[lte]'),
  sanitizeQuery('sortBy'),
  sanitizeQuery('sortOrder')
];

export const sanitizeRouteParams = [
  sanitizeParam('id')
];
