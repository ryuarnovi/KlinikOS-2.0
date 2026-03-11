const fs = require('fs');
const path = require('path');

const ICON_MAP = {
  'Users': 'fi fi-rr-users',
  'Calendar': 'fi fi-rr-calendar',
  'FileText': 'fi fi-rr-document',
  'Pill': 'fi fi-rr-medicine',
  'CreditCard': 'fi fi-rr-credit-card',
  'Settings': 'fi fi-rr-settings',
  'LogOut': 'fi fi-rr-exit',
  'Stethoscope': 'fi fi-rr-doctor',
  'LayoutDashboard': 'fi fi-rr-apps',
  'Search': 'fi fi-rr-search',
  'Plus': 'fi fi-rr-add',
  'Activity': 'fi fi-rr-pulse',
  'TrendingUp': 'fi fi-rr-arrow-trend-up',
  'Edit': 'fi fi-rr-edit',
  'Trash2': 'fi fi-rr-trash',
  'Clock': 'fi fi-rr-clock',
  'AlertCircle': 'fi fi-rr-exclamation',
  'CheckCircle': 'fi fi-rr-check-circle',
  'X': 'fi fi-rr-cross',
  'Menu': 'fi fi-rr-menu-burger',
  'ChevronLeft': 'fi fi-rr-angle-left',
  'ChevronRight': 'fi fi-rr-angle-right',
  'Save': 'fi fi-rr-disk',
  'Eye': 'fi fi-rr-eye',
  'Download': 'fi fi-rr-download',
  'Upload': 'fi fi-rr-upload',
  'Printer': 'fi fi-rr-print',
  'Lock': 'fi fi-rr-lock',
  'User': 'fi fi-rr-user',
  'RefreshCw': 'fi fi-rr-refresh',
  'Loader2': 'fi fi-rr-spinner',
  'DollarSign': 'fi fi-rr-usd-circle',
  'Receipt': 'fi fi-rr-receipt',
  'Phone': 'fi fi-rr-phone-call',
  'MapPin': 'fi fi-rr-marker',
  'ClipboardList': 'fi fi-rr-clipboard-list',
  'Building': 'fi fi-rr-building',
  'Zap': 'fi fi-rr-bolt',
  'Shield': 'fi fi-rr-shield',
  'Box': 'fi fi-rr-box',
  'AlertTriangle': 'fi fi-rr-triangle-warning',
  'UserPlus': 'fi fi-rr-user-add',
  'Server': 'fi fi-rr-server',
  'Database': 'fi fi-rr-database',
  'ArrowRight': 'fi fi-rr-arrow-right',
  'Check': 'fi fi-rr-check',
  'HeartPulse': 'fi fi-rr-heart',
  'Network': 'fi fi-rr-network',
  'ShieldCheck': 'fi fi-rr-shield-check',
  'Terminal': 'fi fi-rr-terminal',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Find all import { ... } from 'lucide-react'
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];?/g;
  let imports = [];
  
  content = content.replace(importRegex, (match, p1) => {
    p1.split(',').forEach(i => imports.push(i.trim()));
    return ''; // Remove the import
  });

  if (imports.length === 0) return; // No lucide imports in this file
  
  console.log(`Processing file: ${filePath}`);
  
  let changed = false;
  // Replace each icon component with <i className="fi fi-rr-..." />
  imports.forEach(icon => {
    if (!icon) return;
    const flatClass = ICON_MAP[icon] || 'fi fi-rr-star'; // fallback
    
    // Self-closing tags: <Icon size={16} className="..." /> -> <i className={`... ${flatClass}`} />
    const componentRegex = new RegExp(`<${icon}\\s*([^>]*)/>`, 'g');
    content = content.replace(componentRegex, (match, props) => {
      changed = true;
      let existingClass = '';
      
      // Parse className from props
      const classMatch = props.match(/className=["']([^"']*)["']/);
      if (classMatch) {
        existingClass = classMatch[1];
        // Remove existing className from props text
        props = props.replace(/className=["']([^"']*)["']/, '');
      }
      
      // Parse size - if > 16 or any size, might add inline style, but usually tailwind is better.
      // We will just drop size props if they are there, relies on text-size
      let addClass = flatClass;
      if (props.includes('animate-spin')) {
        addClass += ' animate-spin';
      }
      if (icon === 'Loader2') {
         addClass += ' animate-spin';
      }
      
      const newClassNames = [existingClass, addClass].filter(Boolean).join(' ');
      
      return `<i className="${newClassNames.trim()}" />`;
    });
    
    // Tags like <Icon>...</Icon> are rare for Lucide, usually it's <Icon />
  });
  
  if (changed || content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'frontend/app/src'));
console.log('Done mapping icons!');
