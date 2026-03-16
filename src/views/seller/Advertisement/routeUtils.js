export const isAdsAssociateRole = (roles = []) => {
  if (!Array.isArray(roles)) return false;
  return roles.includes('adManager') || roles.includes('adsAssociate');
};

export const resolveAdBasePath = ({ pathname = '', roles = [] } = {}) => {
  if (typeof pathname === 'string' && (pathname.startsWith('/adsassociate') || pathname.startsWith('/adManager'))) {
    return '/adsassociate';
  }
  return isAdsAssociateRole(roles) ? '/adsassociate' : '/seller';
};
