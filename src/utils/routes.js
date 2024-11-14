export const getRouteMetadata = (pathname) => {
  const routes = {
    '/': { title: 'Home' },
    '/dice': { title: 'Dice Game' },
    '/profile': { title: 'Profile' },
    '/admin': { title: 'Admin Dashboard' }
  };

  return routes[pathname] || { title: 'Page Not Found' };
}; 