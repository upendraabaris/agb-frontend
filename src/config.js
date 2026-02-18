import { LAYOUT, MENU_BEHAVIOUR, NAV_COLOR, MENU_PLACEMENT, RADIUS, THEME_COLOR, USER_ROLE } from 'constants.js';

export const IS_DEMO = false;
export const IS_AUTH_GUARD_ACTIVE = true;
export const SERVICE_URL = '/app';
export const USE_MULTI_LANGUAGE = false;

// For detailed information: https://github.com/nfl/react-helmet#reference-guide

export const REACT_HELMET_PROPS = {
  defaultTitle: '',
  titleTemplate: '%s  ',
};

export const DEFAULT_PATHS = {
  APP: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  USER_WELCOME: '/dashboards/default',
  NOTFOUND: '/page-not-found',
  UNAUTHORIZED: '/unauthorized',
  INVALID_ACCESS: '/invalid-access',
};

export const DEFAULT_SETTINGS = {
  MENU_PLACEMENT: MENU_PLACEMENT.Horizontal,
  MENU_BEHAVIOUR: MENU_BEHAVIOUR.Pinned,
  LAYOUT: LAYOUT.Fluid,
  RADIUS: RADIUS.Standard,
  COLOR: THEME_COLOR.LightBlue,
  NAV_COLOR: NAV_COLOR.Default,
  USE_SIDEBAR: true,
};

export const DEFAULT_USER = {
  id: 1,
  name: 'Admin',
  thumb: '/img/profile/profile-9.webp',
  role: [USER_ROLE.Admin],
  email: 'admin@gmail.com',
};

export const REDUX_PERSIST_KEY = 'mysol-ecommerce';
