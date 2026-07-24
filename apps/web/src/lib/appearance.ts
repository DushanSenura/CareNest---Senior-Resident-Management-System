export type AppearancePreferences = {
  theme?: string; accent?: string; fontSize?: string; density?: string; sidebar?: string;
  landing?: string; rememberPage?: boolean; showSummary?: boolean; showResidents?: boolean;
  showTasks?: boolean; showShiftPulse?: boolean; showAlerts?: boolean;
  highContrast?: boolean; largeText?: boolean; dyslexiaFont?: boolean; reducedMotion?: boolean;
};
export function storedPreferences(): AppearancePreferences {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('carenest_preferences') ?? '{}'); } catch { return {}; }
}
export function applyAppearance(p: AppearancePreferences) {
  if (typeof document === 'undefined') return;
  const root=document.documentElement;
  const systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme=p.theme==='system'?(systemDark?'dark':'light'):(p.theme??'light');
  root.dataset.accent=p.accent??'green'; root.dataset.density=p.density??'comfortable';
  root.classList.toggle('sidebar-collapsed',p.sidebar==='collapsed');
  root.classList.toggle('high-contrast',!!p.highContrast);root.classList.toggle('large-text',!!p.largeText);
  root.classList.toggle('dyslexia-font',!!p.dyslexiaFont);root.classList.toggle('reduced-motion',!!p.reducedMotion);
  root.classList.toggle('hide-summary',p.showSummary===false);root.classList.toggle('hide-residents',p.showResidents===false);
  root.classList.toggle('hide-tasks',p.showTasks===false);root.classList.toggle('hide-shift-pulse',p.showShiftPulse===false);
  root.classList.toggle('hide-alerts',p.showAlerts===false);
  root.style.fontSize=p.fontSize==='small'?'14px':p.fontSize==='large'?'18px':p.fontSize==='extra large'?'20px':'16px';
}
