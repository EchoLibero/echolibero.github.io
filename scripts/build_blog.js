#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const BLOG_DIR = path.join(ROOT, 'blog');
const BLOG_INDEX = path.join(ROOT, 'blog.html');
const POSTS_INDEX = path.join(POSTS_DIR, 'index.json');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripMarkdown(str = '') {
  return str
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/&lt;\/?b&gt;/g, '')
    .replace(/<\/?b>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugToHtml(file) {
  return file.replace(/\.md$/i, '.html');
}

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: content.trim() };
  const raw = m[1];
  const body = m[2].replace(/^\s+/, '');
  const data = {};
  for (const line of raw.split('\n')) {
    const mm = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!mm) continue;
    let value = mm[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[mm[1]] = value;
  }
  return { data, body };
}

function splitParagraphs(text) {
  return text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
}

function inlineMarkdown(text) {
  let s = escapeHtml(text.replace(/<\/?b>/g, ''));
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/_([^_]+)_/g, '<em>$1</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  s = s.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

function renderMarkdown(md) {
  const blocks = splitParagraphs(md);
  const out = [];
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trimRight());
    if (lines.every(l => /^\s*[-•*]\s+/.test(l))) {
      out.push('<ul>');
      for (const line of lines) {
        out.push(`<li>${inlineMarkdown(line.replace(/^\s*[-•*]\s+/, ''))}</li>`);
      }
      out.push('</ul>');
      continue;
    }
    if (lines.every(l => /^\s*\d+\.\s+/.test(l))) {
      out.push('<ol>');
      for (const line of lines) {
        out.push(`<li>${inlineMarkdown(line.replace(/^\s*\d+\.\s+/, ''))}</li>`);
      }
      out.push('</ol>');
      continue;
    }

    const heading = block.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(6, heading[1].length + 1);
      out.push(`<h${level}>${inlineMarkdown(heading[2].trim())}</h${level}>`);
      continue;
    }

    const joined = lines.map(line => inlineMarkdown(line)).join('<br>');
    out.push(`<p>${joined}</p>`);
  }
  return out.join('\n');
}

function extractPreview(body) {
  const paragraphs = splitParagraphs(body);
  for (const p of paragraphs) {
    const cleaned = stripMarkdown(p.replace(/^[-•*]\s+/gm, '').replace(/^\d+\.\s+/gm, ''));
    if (cleaned.length >= 50) {
      return cleaned.slice(0, 220) + (cleaned.length > 220 ? '…' : '');
    }
  }
  const fallback = stripMarkdown(body).slice(0, 220);
  return fallback + (stripMarkdown(body).length > 220 ? '…' : '');
}

function normalizeTitle(rawTitle, file) {
  const raw = (rawTitle || file.replace(/\.md$/i, '')).trim();
  return stripMarkdown(raw) || file.replace(/\.md$/i, '');
}

function buildPostHtml(post) {
  const tags = post.tags.length
    ? `<div class="tags">${post.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`
    : '';
  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(post.title)} — Эхо Либеро</title>
    <meta name="description" content="${escapeHtml(post.preview)}">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.75;
            background: #0f0f0f;
            color: #e0e0e0;
            padding: 24px;
            max-width: 860px;
            margin: 0 auto;
        }
        h1 { color: #9cdf8d; margin-bottom: 12px; line-height: 1.25; }
        h2, h3, h4 { color: #d8b4fe; margin: 1.8rem 0 0.8rem; }
        .meta { color: #9aa0a6; font-size: 0.95rem; margin-bottom: 1rem; }
        .tags { display:flex; flex-wrap:wrap; gap:8px; margin: 0 0 2rem; }
        .tag { background:#1a2238; border:1px solid #2c3d63; color:#b7cbff; border-radius:999px; padding:4px 10px; font-size:0.85rem; }
        .content p { margin: 0 0 1rem; }
        .content ul, .content ol { margin: 0 0 1rem 1.5rem; }
        .content li { margin-bottom: 0.45rem; }
        .content code { background:#171717; border:1px solid #2a2a2a; border-radius:6px; padding:0.12rem 0.35rem; }
        .content a { color:#7aa5f2; text-decoration:none; }
        .content a:hover { text-decoration:underline; }
        .back { margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; }
        .back a { color:#7aa5f2; text-decoration:none; }
        .back a:hover { text-decoration:underline; }
    </style>
</head>
<body>
    <h1>${escapeHtml(post.title)}</h1>
    <div class="meta">${escapeHtml(post.date || '')}</div>
    ${tags}
    <div class="content">
        ${renderMarkdown(post.body)}
    </div>
    <div class="back">
        <a href="../blog.html">← Все посты</a> | <a href="../index.html">На главную</a>
    </div>
</body>
</html>`;
}

function buildBlogIndex(posts) {
  const postsHtml = posts.map(post => `
    <article class="post">
        <a href="blog/${encodeURI(post.htmlFile)}" class="post-title">${escapeHtml(post.title)}</a>
        <div class="post-meta">${escapeHtml(post.date || '')}${post.tags.length ? ' · ' + post.tags.map(escapeHtml).join(', ') : ''}</div>
        <div class="post-preview">${escapeHtml(post.preview)}</div>
    </article>`).join('\n');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Блог — Эхо Либеро</title>
    <meta name="description" content="Все публикации Эхо Либеро — заметки, чтение, философия, AI, Montelibero.">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            background: #0f0f0f;
            color: #e0e0e0;
            padding: 24px;
            max-width: 920px;
            margin: 0 auto;
        }
        h1 { color: #9cdf8d; margin-bottom: 10px; }
        .meta { color: #9aa0a6; margin-bottom: 28px; }
        .post {
            background: #171717;
            border: 1px solid #2b2b2b;
            padding: 18px;
            border-radius: 12px;
            margin-bottom: 14px;
        }
        .post-title { color: #e0e0e0; text-decoration: none; font-size: 1.15rem; font-weight: 600; }
        .post-title:hover { color: #7aa5f2; }
        .post-meta { color: #8b949e; font-size: 0.92rem; margin-top: 6px; }
        .post-preview { color: #b8b8b8; margin-top: 10px; }
        a { color: #7aa5f2; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .back { margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; }
    </style>
</head>
<body>
    <h1>Блог</h1>
    <p class="meta">Все публикации из публичного массива Echo Libero.</p>
    ${postsHtml}
    <div class="back">
        <a href="index.html">← На главную</a>
    </div>
</body>
</html>`;
}

function build() {
  ensureDir(BLOG_DIR);
  const posts = fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const fullPath = path.join(POSTS_DIR, file);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const { data, body } = parseFrontmatter(raw);
      const title = normalizeTitle(data.title, file);
      const tags = String(data.tags || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const date = data.date || '';
      const htmlFile = slugToHtml(file);
      return {
        file,
        htmlFile,
        title,
        date,
        tags,
        body,
        preview: extractPreview(body)
      };
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.file.localeCompare(b.file));

  for (const post of posts) {
    fs.writeFileSync(path.join(BLOG_DIR, post.htmlFile), buildPostHtml(post), 'utf8');
  }

  fs.writeFileSync(BLOG_INDEX, buildBlogIndex(posts), 'utf8');
  fs.writeFileSync(POSTS_INDEX, JSON.stringify(posts.map(({ file, title, date, tags, preview, htmlFile }) => ({ file, title, date, tags: tags.join(', '), preview, htmlFile })), null, 2), 'utf8');

  console.log(`Built ${posts.length} post pages`);
}

build();
