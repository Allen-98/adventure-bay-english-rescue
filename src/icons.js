const paths = {
  sound:'<path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute:'<path d="M3 9h4l5-4v14l-5-4H3z"/><path d="m16 9 6 6m0-6-6 6"/>',
  book:'<path d="M3 4h6c2 0 3 1.5 3 3 0-1.5 1-3 3-3h6v15h-6c-1.7 0-3 1-3 2-1-1.5-2-2-4-2H3z"/><path d="M12 7v13"/>',
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  flag:'<path d="M5 21V4m0 1c5-4 9 4 15 0v9c-6 4-10-4-15 0"/>',
  home:'<path d="m3 11 9-8 9 8m-2-1v10H5V10m5 10v-6h4v6"/>',
  anchor:'<circle cx="12" cy="5" r="2"/><path d="M12 8v12m-5-9h10M3 14c1 5 4 7 9 7s8-2 9-7m-18 0 3 1m15-1-3 1"/>',
  radio:'<path d="M8 9V3m-3 7h13l-1 11H6zM9 13h5m-5 4h2"/><path d="M12 6c2 0 3 1 3 3m-2-6c3 .3 5 2 5 4"/>',
  medal:'<path d="m6 14-2 7 5-2 3 3 2-7m3-2 3 8-4-2"/><circle cx="12" cy="9" r="7"/><path d="m12 6 1 2 2 .3-1.5 1.5.4 2-1.9-1-1.9 1 .4-2L9 8.3l2-.3z"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  replay:'<path d="M4 4v6h6M4 10a8 8 0 1 1 0 5"/>',
  listen:'<path d="M4 14v-3a8 8 0 0 1 16 0v3m-16-2h4v8H5c-1 0-1-.8-1-2zm16 0h-4v8h3c1 0 1-.8 1-2z"/>',
  bell:'<path d="M5 16c2-2 2-4 2-7 0-6 10-6 10 0 0 3 .3 5 2 7H5zm5 3q2 3 4 0"/>',
  wave:'<path d="M2 9q3 3 6 0t6 0 7 0M2 15q3 3 6 0t6 0 7 0"/>'
};
export function icon(name){return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';}
export const crest = '<svg viewBox="0 0 60 66" fill="none" aria-hidden="true"><path d="M30 2C19 8 12 9 3 9v21c0 16 11 26 27 34 16-8 27-18 27-34V9C48 9 40 7 30 2Z" fill="#173f4d"/><path d="M30 7c-9 5-16 6-22 7v15c0 14 8 23 22 30 14-7 22-16 22-30V14c-8-1-14-3-22-7Z" fill="#f2bd4d"/><path d="M30 11c-8 4-13 6-18 6v11c0 12 6 20 18 27 12-7 18-15 18-27V17c-5 0-11-2-18-6Z" fill="#26778a"/><g fill="#fff4d6"><ellipse cx="20" cy="28" rx="3.1" ry="4.1" transform="rotate(-23 20 28)"/><ellipse cx="26.5" cy="23.9" rx="3.3" ry="4.5"/><ellipse cx="34" cy="23.9" rx="3.3" ry="4.5"/><ellipse cx="40" cy="28" rx="3.1" ry="4.1" transform="rotate(23 40 28)"/><path d="M21 36q1-4 5-7 4-4 8 0 5 4 6 8 1 5-4 5l-6-1.5-5 1.5q-7 1-4-6"/></g></svg>';
