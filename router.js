// ShiftIn — SPA Hash Router
const Router = {
  routes: {},
  currentRoute: null,

  register(hash, renderFn) {
    this.routes[hash] = renderFn;
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  resolve() {
    const hash = window.location.hash || '#/';
    const app = document.getElementById('app');
    
    // Find matching route
    let matchedRoute = null;
    let params = {};

    for (const pattern in this.routes) {
      const regex = this.patternToRegex(pattern);
      const match = hash.match(regex);
      if (match) {
        matchedRoute = pattern;
        const paramNames = (pattern.match(/:(\w+)/g) || []).map(p => p.slice(1));
        paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
        break;
      }
    }

    if (!matchedRoute) matchedRoute = '#/';
    if (!this.routes[matchedRoute]) return;

    // Transition
    app.classList.add('transitioning');
    setTimeout(() => {
      this.routes[matchedRoute](app, params);
      this.currentRoute = matchedRoute;
      app.classList.remove('transitioning');
      window.scrollTo(0, 0);
    }, 150);
  },

  patternToRegex(pattern) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const withParams = escaped.replace(/:(\w+)/g, '([^/]+)');
    return new RegExp('^' + withParams + '$');
  },

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  }
};

export default Router;
