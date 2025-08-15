// Simple script to create placeholder icons for the Android app
const fs = require('fs');
const path = require('path');

// This is a basic placeholder - in a real app you'd use proper icon generation tools
const svgIcon = `
<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
  <rect width="144" height="144" fill="#FF6B35"/>
  <text x="72" y="80" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" fill="white">🌈</text>
</svg>
`;

// Create basic icons (these would normally be properly sized PNG files)
const iconSizes = {
  'ldpi.png': 36,
  'mdpi.png': 48,
  'hdpi.png': 72,
  'xhdpi.png': 96,
  'xxhdpi.png': 144,
  'xxxhdpi.png': 192
};

console.log('Creating placeholder icons...');
console.log('Note: These are placeholder files. For a production app, use proper icon generation tools.');

// For now, just create empty files to prevent build errors
Object.keys(iconSizes).forEach(filename => {
  const filePath = path.join('www', 'img', 'icon', 'android', filename);
  fs.writeFileSync(filePath, ''); // Empty file as placeholder
  console.log(`Created: ${filePath}`);
});

// Create splash screen placeholders
const splashSizes = [
  'land-ldpi.png', 'land-mdpi.png', 'land-hdpi.png', 'land-xhdpi.png', 'land-xxhdpi.png', 'land-xxxhdpi.png',
  'port-ldpi.png', 'port-mdpi.png', 'port-hdpi.png', 'port-xhdpi.png', 'port-xxhdpi.png', 'port-xxxhdpi.png'
];

splashSizes.forEach(filename => {
  const filePath = path.join('www', 'img', 'splash', 'android', filename);
  fs.writeFileSync(filePath, ''); // Empty file as placeholder
  console.log(`Created: ${filePath}`);
});

console.log('Placeholder icons and splash screens created successfully!');