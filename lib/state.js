// ShiftIn — Global State Manager
const AppState = {
  _state: {
    user: null,        // Firebase auth user
    profile: null,     // Supabase profile
    role: null,        // 'student' | 'employer'
    isLoading: false,
  },
  _listeners: [],

  get(key) { return key ? this._state[key] : { ...this._state }; },

  set(updates) {
    Object.assign(this._state, updates);
    this._listeners.forEach(fn => fn(this._state));
    // Persist critical state
    if (updates.profile || updates.role) {
      try { localStorage.setItem('shiftin_state', JSON.stringify({ role: this._state.role, profileId: this._state.profile?.id })); } catch {}
    }
  },

  subscribe(fn) { this._listeners.push(fn); return () => { this._listeners = this._listeners.filter(l => l !== fn); }; },

  restore() {
    try {
      const saved = JSON.parse(localStorage.getItem('shiftin_state') || '{}');
      if (saved.role) this._state.role = saved.role;
    } catch {}
  },

  clear() {
    this._state = { user: null, profile: null, role: null, isLoading: false };
    localStorage.removeItem('shiftin_state');
  }
};

AppState.restore();
export default AppState;
