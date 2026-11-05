import https from 'https';

async function fetchUrl(url) {
  const res = await fetch(url);
  return await res.text();
}

async function run() {
  const layout = await fetchUrl('https://wallet.tresoria.app/_next/static/chunks/app/(app)/layout-2eb61629fdc7cef4.js');
  console.log('Layout length:', layout.length);
  
  const hrefMatches = layout.match(/\/([a-zA-Z0-9_\-]+)/g) || [];
  console.log('Unique routes in layout:', [...new Set(hrefMatches)].filter(h => !h.includes('_next')));
  
  // Find icons or navigation items
  const navMatches = layout.match(/nav\.[a-zA-Z0-9_]+/g) || [];
  console.log('Nav keys:', [...new Set(navMatches)]);
  
  // Look for tab items
  const tabMatches = layout.match(/tabs\.[a-zA-Z0-9_]+/g) || [];
  console.log('Tab keys:', [...new Set(tabMatches)]);
}

run();
