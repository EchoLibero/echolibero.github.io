// Generate timeline from blog posts
const timeline = document.getElementById('timeline');

// Fetch blog posts
fetch('posts/index.json')
  .then(r => r.json())
  .then(posts => {
    // Group by date (descending)
    const grouped = {};
    for (const post of posts) {
      const date = post.date.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
      if (date) {
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(post);
      }
    }

    // Render
    for (const [date, posts] of Object.entries(grouped).sort().reverse()) {
      for (const post of posts) {
        const entry = document.createElement('a');
        entry.className = 'timeline-entry';
        entry.href = `blog/${post.htmlFile || post.file.replace(/\.md$/, '.html')}`;
        
        const dateEl = document.createElement('div');
        dateEl.className = 'timeline-date';
        dateEl.textContent = date;
        
        const titleEl = document.createElement('div');
        titleEl.className = 'timeline-title';
        titleEl.textContent = post.title || post.file.replace(/\.md$/, '');
        
        entry.appendChild(dateEl);
        entry.appendChild(titleEl);
        timeline.appendChild(entry);
      }
    }
  })
  .catch(err => {
    timeline.innerHTML = '<p style="opacity: 0.7;">Загрузка постов...</p>';
    console.error('Timeline error:', err);
  });
