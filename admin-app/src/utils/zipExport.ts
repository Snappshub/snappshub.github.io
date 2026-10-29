import JSZip from 'jszip';
import { AppItem, CategoryItem, SiteSettings } from '../types';

export async function generateProjectZip(
  apps: AppItem[],
  categories: CategoryItem[],
  settings: SiteSettings
): Promise<Blob> {
  const zip = new JSZip();

  // 1. JSON files
  zip.file('apps.json', JSON.stringify(apps, null, 2));
  zip.file('categories.json', JSON.stringify(categories, null, 2));
  zip.file('settings.json', JSON.stringify(settings, null, 2));

  // 2. Standalone Public App Store Frontend (index.html)
  const publicHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.siteTitle} | Official Android APK Store</title>
  <meta name="description" content="${settings.metaDescription}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #062817; color: #f8fafc; }
  </style>
</head>
<body class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="border-b border-emerald-900/60 bg-[#041d10]/90 backdrop-blur sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between max-w-6xl mx-auto w-full">
    <div class="flex items-center space-x-3">
      <div class="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shadow-emerald-500/20">S</div>
      <div>
        <h1 class="text-base font-bold text-white tracking-tight">${settings.siteTitle}</h1>
        <p class="text-[11px] text-emerald-400 font-medium">${settings.siteSubtitle}</p>
      </div>
    </div>
    <div class="flex items-center space-x-2">
      <a href="${settings.telegramChannel.startsWith('http') ? settings.telegramChannel : 'https://t.me/' + settings.telegramChannel.replace('@','')}" target="_blank" class="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition flex items-center space-x-1.5">
        <span>Telegram VIP</span>
      </a>
    </div>
  </header>

  <!-- Hero Section -->
  <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-6">
    <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0a3b22] to-[#041d10] border border-emerald-800/40 shadow-xl">
      <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">Fast & Direct Downloads</span>
      <h2 class="text-2xl sm:text-4xl font-extrabold text-white mt-1">Curated Android Applications & Tools</h2>
      <p class="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl">Direct high-speed downloads hosted on Telegram Cloud and secure mirrors. 100% clean & verified APKs.</p>
    </div>

    <!-- Live Apps List (Embedded from apps.json) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="apps-container"></div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-emerald-950 py-6 text-center text-xs text-emerald-500/70">
    <p>&copy; ${new Date().getFullYear()} ${settings.siteTitle} &bull; Curated by Alamin Saheb (${settings.contactPhone})</p>
  </footer>

  <script>
    const apps = ${JSON.stringify(apps, null, 2)};
    const container = document.getElementById('apps-container');
    container.innerHTML = apps.map(app => \`
      <div class="p-4 rounded-2xl bg-[#09351e]/80 border border-emerald-900/60 flex flex-col justify-between hover:border-emerald-600 transition">
        <div class="flex items-start space-x-3">
          <img src="\${app.icon}" class="w-12 h-12 rounded-xl object-cover bg-emerald-950 shrink-0" alt="\${app.name}">
          <div class="min-w-0">
            <h3 class="font-bold text-sm text-white truncate">\${app.name}</h3>
            <p class="text-[11px] text-emerald-400 font-mono">\${app.version} &bull; \${app.size}</p>
            <p class="text-xs text-slate-300 mt-1 line-clamp-2">\${app.description}</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-emerald-900/40 flex items-center justify-between">
          <span class="text-[11px] text-slate-400">\${app.category}</span>
          <a href="\${app.downloadUrl || app.directApkUrl || '#'}" target="_blank" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition">
            Download APK
          </a>
        </div>
      </div>
    \`).join('');
  </script>
</body>
</html>`;

  zip.file('index.html', publicHtml);

  // 3. Documentation README.md
  const readme = `# ${settings.siteTitle}

${settings.metaDescription}

## Architecture
- **apps.json**: Contains ${apps.length} verified Android applications.
- **categories.json**: Contains ${categories.length} organized categories.
- **settings.json**: Global branding, Telegram integration, and contact endpoints.

### Contact & Support
- Master Admin: Alamin Saheb
- Phone: ${settings.contactPhone}
- Email: ${settings.contactEmail}
- Telegram Channel: ${settings.telegramChannel}
`;

  zip.file('README.md', readme);

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
