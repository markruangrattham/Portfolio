// ─── JSONBin.io Cloud Storage ────────────────────────────────────────────────
// Sign up free at https://jsonbin.io → get a Master Key → create a Bin → paste
// both into the admin panel (admin.html).  All data lives in one JSON object.

const CLOUD = {
  BASE: 'https://api.jsonbin.io/v3/b',

  cfg() {
    return {
      key: localStorage.getItem('pf_api_key') || '',
      bin: localStorage.getItem('pf_bin_id') || ''
    };
  },

  setCfg(key, bin) {
    localStorage.setItem('pf_api_key', key.trim());
    localStorage.setItem('pf_bin_id', bin.trim());
  },

  isReady() {
    const { key, bin } = this.cfg();
    return !!(key && bin);
  },

  async load() {
    const { key, bin } = this.cfg();
    if (!bin || !key) return null;
    try {
      const r = await fetch(`${this.BASE}/${bin}?meta=false`, {
        headers: { 'X-Master-Key': key }
      });
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  },

  async save(data) {
    const { key, bin } = this.cfg();
    if (!bin || !key) throw new Error('Cloud not configured — open admin panel to set up JSONBin.');
    const r = await fetch(`${this.BASE}/${bin}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': key },
      body: JSON.stringify(data)
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.message || `HTTP ${r.status}`);
    }
    return r.json();
  }
};

// ─── Default Portfolio Data ───────────────────────────────────────────────────
// Mirrors the hardcoded HTML so the page looks correct even before cloud sync.

const DEFAULT_DATA = {
  blogPosts: [
    {
      id: '1',
      title: 'From Zero AI Interest to Building a Chatbot: My Summer at Transact + CBORD',
      description: 'How a 10-week internship completely changed my perspective on artificial intelligence and set me on the path to becoming a software engineer. From learning AI agents to presenting to the entire team, this experience transformed my career goals.',
      date: 'August 30, 2025',
      readTime: '12 min read',
      category: 'Featured',
      tags: ['AI/ML', 'Internship', 'Chatbot', 'AWS Bedrock', 'Career Growth'],
      featured: true,
      url: 'blog-transact-internship.html',
      image: 'img/blog post/cbord/cbord.png',
      emoji: '🤖'
    },
    {
      id: '2',
      title: "Life Update: Summer Reflections, Growth, and What's Next",
      description: 'Quick check-in post-internship. Summer highlights, growth, job hunt plans, and kicking off a new "Road to FAANG" series.',
      date: 'August 5, 2025',
      readTime: '4 min read',
      category: 'Life Update',
      tags: ['Reflection', 'Career', 'SWE'],
      featured: false,
      url: 'blog-life-update.html',
      image: 'img/blog post/summer/faang.jpeg',
      emoji: '☀️'
    }
  ],

  experiences: [
    {
      id: '1',
      title: 'Software Engineer Intern',
      company: 'Transact Campus + cbord',
      duration: 'June 2025 - August 2025',
      isCurrent: false,
      logo: 'img/experience/transact-logo.png',
      description: 'Built a serverless multi-agent RAG system using AWS Lambda, Step Functions, and AWS Bedrock for NetMenu across 5+ applications. Designed an AI-powered chatbot with real-time data retrieval and user management that reduced support ticket volume by 30%. Presented the project to the entire development team.',
      highlights: [
        { icon: '🤖', text: 'Multi-Agent RAG System' },
        { icon: '☁️', text: 'AWS Lambda & Step Functions' },
        { icon: '📉', text: '30% Fewer Support Tickets' }
      ],
      skills: ['AWS Lambda', 'AWS Bedrock', 'Step Functions', 'Serverless']
    },
    {
      id: '2',
      title: 'Full Stack Software Engineer Intern',
      company: 'UC San Diego Health',
      duration: 'March 2025 - Present',
      isCurrent: true,
      logo: 'img/experience/UCSD health.png',
      description: "Built a full-stack application management system for UCSD Health's Explore Career Path Program using ASP.NET Core, C#, SQL Server, and Entity Framework. The system supports 1,000+ applicants with role-based workflows, automated email notifications, and dynamic filtering that reduced manual review time by 60%.",
      highlights: [
        { icon: '🏗️', text: 'Full-Stack ASP.NET Core & C#' },
        { icon: '🗄️', text: 'SQL Server & Entity Framework' },
        { icon: '⚡', text: '60% Reduction in Review Time' }
      ],
      skills: ['ASP.NET Core', 'C#', 'SQL Server', 'Entity Framework']
    },
    {
      id: '3',
      title: 'Freelance Software Engineer',
      company: 'Valhalla FC',
      duration: 'September 2024 - Present',
      isCurrent: true,
      logo: 'img/experience/valhalla_FC.png',
      description: 'Developed tools and applications to enhance server growth, streamline moderation, and improve user experience for the fastest-growing FC Mobile server with 2,000+ active members.',
      highlights: [
        { icon: '🤖', text: 'Discord Bot Development' },
        { icon: '📈', text: 'Server Growth Tools' },
        { icon: '⚡', text: 'Automation Systems' }
      ],
      skills: ['DevOps', 'Discord API', 'Testing', 'Python']
    },
    {
      id: '4',
      title: 'Computer Science Tutor',
      company: 'Juni Learning',
      duration: 'October 2022 - July 2025',
      isCurrent: false,
      logo: 'img/experience/juni_learning.png',
      description: 'Instructed and mentored diverse students in Computer Science, covering Java, Python, JavaScript, and C. Selected to teach advanced courses including USACO preparation.',
      highlights: [
        { icon: '👨‍🏫', text: 'Student Mentoring' },
        { icon: '📚', text: 'Advanced Courses' },
        { icon: '🏆', text: 'USACO Preparation' }
      ],
      skills: ['Communication', 'Debugging', 'Teaching', 'Problem Solving']
    }
  ],

  projects: [
    {
      id: '1',
      title: 'StudyGenius',
      description: 'Full-stack flashcard app with Firebase authentication and OpenAI-powered features for intelligent study assistance and progress tracking.',
      tags: ['AI Powered', 'Full-Stack', 'Application', 'Database', 'React', 'Firebase', 'OpenAI API'],
      featured: true,
      mediaType: 'youtube',
      mediaSrc: 'https://www.youtube.com/embed/xdCblU1HOhE',
      features: ['🌐 Full-Stack App', '🗄️ Database', '⚡ Fast & Responsive', '🔒 Secure Auth', '🤖 OpenAI Integration']
    },
    {
      id: '2',
      title: 'Valhalla Bot',
      description: 'A comprehensive Discord bot designed to streamline tournament organization with custom roles, exclusive channels, and efficient data management. Features include automated team assignments, real-time leaderboards, and seamless Discord integration.',
      tags: ['Python', 'Discord API', 'Bot Development', 'Tournament Management'],
      featured: false,
      mediaType: 'video',
      mediaSrc: 'https://i.gyazo.com/280b4faee9871bb01a7395b3ae29c89b.mp4',
      stats: [{ number: '900+', label: 'Active Users' }, { number: '20+', label: 'Tournaments' }, { number: '99.9%', label: 'Uptime' }]
    },
    {
      id: '3',
      title: 'Valhalla World Cup Spinner',
      description: 'Dynamic tournament website with Discord integration for team assignments and player management. Features animated flag spinner and real-time participant tracking.',
      tags: ['React', 'JavaScript', 'Discord API', 'Web App'],
      featured: false,
      mediaType: 'image',
      mediaSrc: 'img/projects/flag_spinner.gif',
      features: ['🎯 Team Assignment', '🌍 Flag Animation', '📊 Live Tracking']
    },
    {
      id: '4',
      title: 'Marky Bot',
      description: 'Advanced moderation bot with interactive features including leaderboards, ranked matches, and automated community management tools.',
      tags: ['Python', 'Discord API', 'Moderation', 'Bot Development'],
      featured: false,
      mediaType: 'image',
      mediaSrc: 'img/projects/invite.png',
      features: ['🛡️ Moderation', '🏆 Leaderboards', '⚡ Automation']
    },
    {
      id: '5',
      title: 'Birthday Countdown',
      description: 'Personal birthday gift featuring music player, countdown timer, and special video reveal with custom animations and interactive elements.',
      tags: ['React', 'Personal', 'Creative', 'Animation'],
      featured: false,
      mediaType: 'image',
      mediaSrc: 'img/projects/bb birthday.gif',
      features: ['🎵 Music Player', '⏰ Countdown', '🎬 Video Reveal']
    },
    {
      id: '6',
      title: 'Leaderboard System',
      description: 'Real-time leaderboard system with dynamic rankings, user statistics, and competitive features for gaming communities.',
      tags: ['React', 'Node.js', 'Database', 'Real-time'],
      featured: false,
      mediaType: 'image',
      mediaSrc: 'img/projects/leadeboard.png',
      features: ['🏆 Rankings', '📈 Statistics', '⚡ Real-time']
    },
    {
      id: '7',
      title: 'FÚTBOL DEX',
      description: 'Currently in beta with 10 active users; public release scheduled for September 2025. Backend powered by Django on Google Cloud App Engine with JWT-based authentication, PostgreSQL persistence, and Discord API integration for community features.',
      tags: ['Google Cloud', 'Django', 'PostgreSQL', 'Discord API'],
      featured: false,
      mediaType: 'image',
      mediaSrc: 'img/projects/logo.png',
      features: ['🔐 JWT Auth', '☁️ App Engine Deploy', '🗄️ PostgreSQL', '🤖 Discord Integration', '🧪 Beta Testing']
    },
    {
      id: '8',
      title: 'LeafyBucks Expense Tracker',
      description: 'Full-stack expense and subscription tracker with seamless CRUD, recurring subscription management, and a monthly insights dashboard. Firebase data model with per-user subcollections and Auth-scoped security rules.',
      tags: ['React', 'Firebase', 'Auth', 'CSV Export'],
      featured: false,
      mediaType: 'image',
      mediaSrc: 'img/projects/leafybucks.png',
      features: ['✅ Easy to use', '🧭 Clean, simple UI', '⚡ Quick add expense', '📈 Clear monthly insights']
    }
  ]
};

// ─── Render: Blog Preview Section ─────────────────────────────────────────────

function renderBlogSection(posts) {
  const container = document.getElementById('blog-container');
  if (!container) return;

  if (!posts || posts.length === 0) {
    container.innerHTML = '<p class="admin-empty">No posts yet.</p>';
    return;
  }

  container.innerHTML = posts.map(post => {
    const tagsHtml = post.tags.map(t => `<span class="blog-tag">${t}</span>`).join('');
    const catClass = post.featured ? 'featured' : '';
    const imageHtml = post.image
      ? `<img src="${post.image}" alt="${post.title}">`
      : `<div class="blog-emoji-placeholder">${post.emoji || '📝'}</div>`;

    return `
      <article class="blog-card ${catClass}">
        <div class="blog-image">
          ${imageHtml}
          <div class="blog-overlay"><span class="blog-category">${post.category}</span></div>
        </div>
        <div class="blog-content">
          <div class="blog-meta">
            <span class="blog-date">${post.date}</span>
            <span class="blog-read-time">${post.readTime}</span>
          </div>
          <h3>${post.title}</h3>
          <p>${post.description}</p>
          <div class="blog-tags">${tagsHtml}</div>
          <a href="${post.url || 'blog.html'}" class="blog-link">
            <span>Read Full Story</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7,7 17,7 17,17"></polyline>
            </svg>
          </a>
        </div>
      </article>`;
  }).join('');
}

// ─── Render: Experience Timeline ──────────────────────────────────────────────

function renderExperienceSection(experiences) {
  const container = document.getElementById('experience-timeline');
  if (!container) return;

  container.innerHTML = experiences.map(exp => {
    const highlightsHtml = exp.highlights.map(h =>
      `<div class="highlight-item"><span class="highlight-icon">${h.icon}</span><span>${h.text}</span></div>`
    ).join('');
    const skillsHtml = exp.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
    const currentClass = exp.isCurrent ? 'current' : '';
    const badgeHtml = exp.isCurrent ? '<div class="experience-badge">Current</div>' : '';
    const logoHtml = exp.logo
      ? `<div class="company-logo"><img src="${exp.logo}" alt="${exp.company}"></div>`
      : '';

    return `
      <div class="timeline-item ${currentClass}">
        <div class="timeline-marker">
          <div class="marker-dot"></div>
          <div class="marker-line"></div>
        </div>
        <div class="timeline-content">
          <div class="experience-card">
            <div class="experience-header">
              ${logoHtml}
              <div class="experience-meta">
                ${badgeHtml}
                <h3>${exp.title}</h3>
                <p class="company">${exp.company}</p>
                <p class="duration">${exp.duration}</p>
              </div>
            </div>
            <div class="experience-body">
              <p>${exp.description}</p>
              <div class="experience-highlights">${highlightsHtml}</div>
              <div class="skills-gained">${skillsHtml}</div>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ─── Render: Projects ─────────────────────────────────────────────────────────

function renderProjectsSection(projects) {
  const showcaseEl = document.getElementById('projects-showcase');
  const gridEl = document.getElementById('projects-grid');
  if (!showcaseEl || !gridEl) return;

  const featured = projects.filter(p => p.featured);
  const grid = projects.filter(p => !p.featured);

  showcaseEl.innerHTML = featured.map(p => {
    const tagsHtml = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
    const featuresHtml = (p.features || []).map(f => `<span class="feature">${f}</span>`).join('');
    const mediaHtml = buildMediaHtml(p, true);
    return `
      <div class="project-card featured">
        <div class="project-media">${mediaHtml}</div>
        <div class="project-content">
          <div class="project-tags">${tagsHtml}</div>
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <div class="project-features">${featuresHtml}</div>
        </div>
      </div>`;
  }).join('');

  gridEl.innerHTML = grid.map(p => {
    const tagsHtml = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
    const mediaHtml = buildMediaHtml(p, false);
    const bottomHtml = p.stats
      ? `<div class="project-stats">${p.stats.map(s =>
          `<div class="stat"><span class="stat-number">${s.number}</span><span class="stat-label">${s.label}</span></div>`
        ).join('')}</div>`
      : `<div class="project-features">${(p.features || []).map(f => `<span class="feature">${f}</span>`).join('')}</div>`;
    return `
      <div class="project-card">
        <div class="project-media">${mediaHtml}</div>
        <div class="project-content">
          <div class="project-tags">${tagsHtml}</div>
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          ${bottomHtml}
        </div>
      </div>`;
  }).join('');

  // Re-attach modal triggers after dynamic render
  if (typeof initializeImageModal === 'function') initializeImageModal();
}

function buildMediaHtml(p, isFeatured) {
  const type = p.mediaType || 'image';
  if (type === 'youtube') {
    return `<iframe src="${p.mediaSrc}" title="${p.title} Demo" frameborder="0" allowfullscreen></iframe>`;
  }
  if (type === 'video') {
    return `<video class="modal-trigger" data-modal-video="${p.mediaSrc}" autoplay muted loop playsinline>
              <source src="${p.mediaSrc}" type="video/mp4">
            </video>`;
  }
  // image / gif
  return `<img src="${p.mediaSrc}" alt="${p.title}" class="modal-trigger" data-modal-image="${p.mediaSrc}">`;
}

// ─── Main Init ────────────────────────────────────────────────────────────────

async function initPortfolioData() {
  let data = CLOUD.isReady() ? await CLOUD.load() : null;
  if (!data) data = DEFAULT_DATA;

  // Always render blog (its container is always empty — blog is dynamic-only)
  renderBlogSection(data.blogPosts);

  // Only replace experience / projects if their containers are empty
  // (keeps static hardcoded HTML untouched unless a future change clears them)
  const expEl = document.getElementById('experience-timeline');
  if (expEl && expEl.children.length === 0) renderExperienceSection(data.experiences);

  const showcaseEl = document.getElementById('projects-showcase');
  if (showcaseEl && showcaseEl.children.length === 0) renderProjectsSection(data.projects);
}
