// export const isAdsAssociateRole = (roles = []) => {
//   if (!Array.isArray(roles)) return false;
//   return roles.includes('adManager') || roles.includes('adsAssociate');
// };

// export const resolveAdBasePath = ({ pathname = '', roles = [] } = {}) => {
//   if (typeof pathname === 'string' && (pathname.startsWith('/adsassociate') || pathname.startsWith('/adManager'))) {
//     return '/adsassociate';
//   }
//   return isAdsAssociateRole(roles) ? '/adsassociate' : '/seller';
// };


export const isAdsAssociateRole = (roles = []) => {
  if (!Array.isArray(roles)) return false;
  return roles.includes('adManager') || roles.includes('adsAssociate');
};

export const isSuperSellerRole = (roles = []) => {
  if (!Array.isArray(roles)) return false;
  return roles.includes('superSeller');
};

export const resolveAdBasePath = ({ pathname = '', roles = [] } = {}) => {
  // Check pathname first
  if (typeof pathname === 'string') {
    if (pathname.startsWith('/adsassociate') || pathname.startsWith('/adManager')) {
      return '/adsassociate';
    }
    if (pathname.startsWith('/superSeller')) {
      return '/superSeller';
    }
  }
  
  // Then check roles
  if (isSuperSellerRole(roles)) return '/superSeller';
  if (isAdsAssociateRole(roles)) return '/adsassociate';
  
  return '/seller';
};