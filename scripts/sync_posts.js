#!/usr/bin/env node

/**
 * Sync posts from Telegram channel @echo_mtl to website
 * Uses telegram-user history to fetch messages
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '../posts');
const BLOG_FILE = path.join(__dirname, '../blog.html');

// Read all posts
const posts = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md'))
  .map(f => {
    const content = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8');
    const match = content.match(/title: "([^"]+)"/);
    const dateMatch = content.match(/date: "([^"]+)"/);
    const tagsMatch = content.match(/tags: "([^"]+)"/);
    
    return {
      file: f,
      title: match ? match[1] : 'Без названия',
      date: dateMatch ? dateMatch[1] : undefined,
      tags: tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()) : [],
      preview: content.split('---')[2]?.substring(0, 200) || ''
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

console.log(`Total posts: ${posts.length}`);

// Extract all unique tags
const allTags = new Set();
posts.forEach(p => p.tags.forEach(t => allTags.add(t)));

console.log(`Unique tags: ${allTags.size}`);
console.log('Tags:', Array.from(allTags).sort());

// Stats by tag
const tagStats = {};
posts.forEach(p => {
  p.tags.forEach(tag => {
    tagStats[tag] = (tagStats[tag] || 0) + 1;
  });
});

console.log('\nPosts per tag:');
Object.entries(tagStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([tag, count]) => {
    console.log(`  ${tag}: ${count}`);
  });
