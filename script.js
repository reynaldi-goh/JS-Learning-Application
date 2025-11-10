(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.lesson-sidebar');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  const yearEl = document.getElementById('year');
  const header = document.querySelector('.site-header');

  // Initialize year
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Header hover reveal
  if (header) {
    let hoverTimeout;
    const hoverZone = 60; // pixels from top

    function showHeader() {
      clearTimeout(hoverTimeout);
      header.classList.add('visible');
    }

    function hideHeader() {
      hoverTimeout = setTimeout(() => {
        // Don't hide if we're at the top of the page
        if (window.scrollY <= 50) {
          return;
        }
        header.classList.remove('visible');
      }, 300);
    }

    // Show header when at top of page
    function checkTopPosition() {
      if (window.scrollY <= 50) {
        showHeader();
      }
    }
    checkTopPosition(); // Check on load

    // Show on hover near top
    document.addEventListener('mousemove', (e) => {
      if (e.clientY <= hoverZone) {
        showHeader();
      } else {
        // Only hide if not at top
        if (window.scrollY > 50) {
          hideHeader();
        }
      }
    });

    // Keep visible when hovering over header
    header.addEventListener('mouseenter', showHeader);
    header.addEventListener('mouseleave', () => {
      const rect = header.getBoundingClientRect();
      if (rect.top < 0 && window.scrollY > 50) {
        hideHeader();
      }
    });

    // Show on scroll to top
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 50) {
        // Always show when at top
        showHeader();
      } else if (currentScrollY < 100 || currentScrollY < lastScrollY) {
        showHeader();
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        hideHeader();
      }
      lastScrollY = currentScrollY;
    });
  }

  // Theme management
  const THEME_KEY = 'site-theme';
  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  }
  function storeTheme(value) {
    try { localStorage.setItem(THEME_KEY, value); } catch { /* ignore */ }
  }
  function getPreferredTheme() {
    const stored = getStoredTheme();
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.querySelector('.theme-icon')?.replaceChildren(document.createTextNode(theme === 'dark' ? '☀️' : '🌙'));
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
  function initTheme() {
    setTheme(getPreferredTheme());
  }
  initTheme();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
      storeTheme(next);
    });
  }

  // Keep theme in sync with system preference if user hasn't chosen
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener?.('change', () => {
    if (!getStoredTheme()) setTheme(mediaQuery.matches ? 'dark' : 'light');
  });

  // Sidebar toggle for mobile
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      sidebarToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close sidebar when clicking a lesson link on mobile
    const sidebarLinks = sidebar.querySelectorAll('.lesson-nav a');
    sidebarLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 680) {
          sidebar.classList.remove('open');
          sidebarToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // Sidebar resize functionality
  const resizeHandle = document.querySelector('.sidebar-resize-handle');
  if (resizeHandle && sidebar) {
    const SIDEBAR_WIDTH_KEY = 'sidebar-width';
    const MIN_WIDTH = 140;
    const MAX_WIDTH = 300;

    // Load saved width
    const savedWidth = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
        document.documentElement.style.setProperty('--sidebar-width', width + 'px');
      }
    }

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')) || 160;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;

      const diff = e.clientX - startX;
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + diff));
      document.documentElement.style.setProperty('--sidebar-width', newWidth + 'px');
      sidebar.style.width = newWidth + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        const currentWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')) || 160;
        localStorage.setItem(SIDEBAR_WIDTH_KEY, String(currentWidth));
      }
    });
  }

  // Mobile navigation
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      const next = !expanded;
      nav.setAttribute('aria-expanded', String(next));
      navToggle.setAttribute('aria-expanded', String(next));
    });

    // Close menu on link click (mobile)
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Lesson navigation with active state
  const lessonNavLinks = document.querySelectorAll('.lesson-nav a');
  const lessonSections = document.querySelectorAll('.lesson');

  function setActiveLink(targetId) {
    lessonNavLinks.forEach((link) => link.classList.remove('active'));
    const activeLink = document.querySelector(`.lesson-nav a[href="#${targetId}"]`);
    if (activeLink) activeLink.classList.add('active');
  }

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120; // Offset for sticky header
    let currentSection = null;

    lessonSections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < bottom) {
        currentSection = id;
      }
    });

    // Also check if we're past the last section
    if (!currentSection && lessonSections.length > 0) {
      const lastSection = lessonSections[lessonSections.length - 1];
      const lastTop = lastSection.offsetTop;
      if (scrollPos >= lastTop) {
        currentSection = lastSection.getAttribute('id');
      }
    }

    if (currentSection) {
      setActiveLink(currentSection);
    }
  }

  // Smooth scroll with offset for lesson nav links
  lessonNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const target = document.querySelector(href);
        
        // Immediately set active state
        setActiveLink(targetId);
        
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });

          // Update again after scroll completes
          setTimeout(() => {
            updateActiveNav();
          }, 500);
        }
      }
    });
  });

  // Update active nav on scroll
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateActiveNav, 50);
  });
  updateActiveNav(); // Initial check

  // Lesson playgrounds
  const defaultSnippets = {
    printing: `console.log("Hello from console.log!");
console.log("You can log multiple things:", 42, true);

let message = "Variables work too!";
console.log(message);
console.log("console.log() is your debugging friend!");`,

    'including-js': `// This is external JavaScript (best practice)
// The code is in a separate .js file

console.log("External JS loaded!");
console.log("This website uses external JavaScript");
console.log("✓ Organized");
console.log("✓ Reusable");
console.log("✓ Professional");`,

    variables: `let favouriteAnimal = "Cat";
const pi = 3.14;

// let can be changed
favouriteAnimal = "Dog";

// const cannot be changed
// pi = 3.14159; // This would cause an error!

console.log('let can change:', favouriteAnimal);
console.log('const cannot change:', pi);
console.log('let can change, const cannot!');`,

    'data-types': `let statement = "hello";
let age = 42;
let isCool = true;
let numbers = [1, 2, 3, 8];
let person = { name: "Bob🥀", age: 25 };

console.log('typeof "' + statement + '" =', typeof statement);
console.log('typeof ' + age + ' =', typeof age);
console.log('typeof ' + isCool + ' =', typeof isCool);
console.log('typeof [' + numbers + '] =', typeof numbers);
console.log('typeof {name: "' + person.name + '"} =', typeof person);
console.log('Check types with typeof!');`,

    conditionals: `let examScore = 90;

let result;

if (examScore > 75) {
  result = "You pass!";
} else {
  result = "See you next year lol 💀";
}

console.log('Exam Score:', examScore);
console.log('Result:', result);

// Logical operators example
let isSunny = true;
let isWeekend = false;

if (isSunny && !isWeekend) {
  console.log("Work with sunlight!");
}

console.log('Score check:', result);`,

    loops: `const scores = [12, 24, 36, 44, 52, 64];

// For loop
for (let i = 0; i < scores.length; i++) {
  console.log('Score ' + i + ':', scores[i]);
}

// While loop
let count = 0;
while (count < 3) {
  console.log('Count:', count);
  count++;
}

// Nested loops
for (let i = 0; i < 2; i++) {
  for (let j = 0; j < 3; j++) {
    console.log('i=' + i + ', j=' + j);
  }
}

console.log('Total scores:', scores.length);`,

    functions: `function greet() {
  return "Hello, World!";
}

function greetPerson(name) {
  return "Hello, " + name + "!";
}

function average(numbers) {
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total / numbers.length;
}

console.log(greet());
console.log(greetPerson("Asha"));

let scores = [10, 20, 30];
let avg = average(scores);
console.log('Average of [10, 20, 30] =', avg);
console.log('Functions eliminate repetition!');`,

    arrays: `let fruits = ["apple", "banana", "cherry"];

console.log("Fruits:", fruits);
console.log("First fruit:", fruits[0]);
console.log("Total fruits:", fruits.length);

// Try editing the array above or call fruits.push("strawberry");
// Then press Run to see the updated output.`, 

    objects: `let student = {
  name: "Asha",
  age: 19,
  major: "Computer Science"
};

// Access properties
console.log('student.name =', student.name);
console.log('student.age =', student.age);

// Modify
student.age = 20;
console.log('After change:', student.age);

// Add new property
student.city = "Singapore";
console.log('Added city:', student.city);

console.log('Object keys:', Object.keys(student).join(', '));
console.log('Student:', student);`,

    'dom-getelementbyid': `// getElementById() - Get element by unique ID
// Manipulate the mini website on the right!

// Get the site title
const title = document.getElementById('site-title');
if (title) {
  console.log('Found title:', title.textContent);
  // Change the title text
  title.textContent = 'Welcome to JavaScript!';
  console.log('Title changed to:', title.textContent);
}

// Get the status text
const statusText = document.getElementById('status-text');
if (statusText) {
  console.log('Current status:', statusText.textContent);
  statusText.textContent = 'Status: JavaScript is working!';
  statusText.style.color = '#10b981';
  console.log('Status updated!');
}

// Get the action button
const actionBtn = document.getElementById('action-btn');
if (actionBtn) {
  console.log('Found button:', actionBtn.textContent);
}`,

    'dom-getelementsbyclassname': `// getElementsByClassName() grabs every element with the same class
const highlights = document.getElementsByClassName('highlight');

console.log('Highlight paragraphs found:', highlights.length);

if (highlights.length > 0) {
  // Update only the first one so the change is easy to see
  const firstHighlight = highlights[0];
  firstHighlight.textContent = 'Updated with getElementsByClassName!';
  firstHighlight.style.backgroundColor = '#fef3c7';
}`,

    'dom-queryselector': `// querySelector() returns the first match for a CSS selector
const sectionTitle = document.querySelector('#mini-website h2');

if (sectionTitle) {
  sectionTitle.textContent = 'Updated by querySelector()';
  sectionTitle.style.color = '#2563eb';
}

const firstButton = document.querySelector('#mini-website .nav-btn');
if (firstButton) {
  firstButton.textContent = 'Selected!';
}`,

    'dom-queryselectorall': `// querySelectorAll() returns every match as a NodeList
const listItems = document.querySelectorAll('#feature-list li');

console.log('Features found:', listItems.length);

listItems.forEach((item, index) => {
  item.textContent = \`Feature \${index + 1} (updated)\`;
});`,

    'dom-events': `// Listen for a single button click
const actionBtn = document.getElementById('action-btn');
const statusText = document.getElementById('status-text');

if (actionBtn && statusText) {
  actionBtn.addEventListener('click', () => {
    statusText.textContent = 'Status: Button clicked!';
    actionBtn.disabled = true;
  });
}`,

    'dom-event-delegation': `// Event delegation with the playground console
document.addEventListener('click', (event) => {
  const clicked = event.target;

  // Only handle clicks inside the mini website
  if (!clicked.closest('#mini-website')) return;

  // Note:
  // In these lessons, console.log() works normally for code that runs
  // when you press “Run”. But event listeners (like clicks) happen later,
  // after the console has finished overriding console.log.
  // So this lesson uses playgroundLog(), which prints to the console on the page.
  // You may keep using console.log() for your own code.
  playgroundLog('You clicked:', clicked.tagName);

  if (clicked.matches('.nav-btn')) {
    clicked.classList.toggle('is-active');
  }
});`,

    events: `// Click event example
document.addEventListener('click', (event) => {
  console.log('Click at:', event.clientX, event.clientY);
});

// Keyboard event example
document.addEventListener('keydown', (event) => {
  console.log('Key pressed:', event.key);
});

console.log('Event listeners added! Try clicking or pressing keys.');
console.log('(Events will also appear in the browser console)');`,
  };

  // Draggable Mini Website
  function initializeMiniWebsite(wrapper) {
    if (!wrapper || wrapper.dataset.initialized === 'true') {
      return;
    }

    const header = wrapper.querySelector('.demo-header');
    const closeBtn = wrapper.querySelector('.demo-close');
    const miniWebsite = wrapper.querySelector('#mini-website');
    const miniWebsiteContent = wrapper.querySelector('.mini-website-content');

    if (!header || !miniWebsite) {
      return;
    }

    wrapper.dataset.initialized = 'true';

    let isDragging = false;
    let initialX = 0;
    let initialY = 0;
    let currentX = 0;
    let currentY = 0;
    let isMinimized = miniWebsite.classList.contains('is-minimized');

    function applyPosition(x, y) {
      wrapper.style.left = `${x}px`;
      wrapper.style.top = `${y}px`;
      wrapper.style.right = 'auto';
    }

    const savedPosition = localStorage.getItem('mini-website-position');
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        if (Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
          const rect = wrapper.getBoundingClientRect();
          const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
          const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
          const maxX = Math.max(viewportWidth - rect.width - 20, 0);
          const maxY = Math.max(viewportHeight - rect.height - 20, 0);

          const clampedX = Math.min(Math.max(pos.x, 0), maxX);
          const clampedY = Math.min(Math.max(pos.y, 0), maxY);

          currentX = clampedX;
          currentY = clampedY;
          applyPosition(clampedX, clampedY);

          if (clampedX !== pos.x || clampedY !== pos.y) {
            localStorage.setItem('mini-website-position', JSON.stringify({ x: clampedX, y: clampedY }));
          }
        }
      } catch (error) {
        console.warn('Unable to load mini website position from storage', error);
      }
    }

    function dragStart(e) {
      if (e.target.closest('.demo-close')) {
        return;
      }
      isDragging = true;
      const pointer = e.type === 'touchstart' ? e.touches[0] : e;
      const rect = wrapper.getBoundingClientRect();
      initialX = pointer.clientX - rect.left;
      initialY = pointer.clientY - rect.top;
      e.preventDefault();
    }

    function drag(e) {
      if (!isDragging) {
        return;
      }

      const pointer = e.type === 'touchmove' ? e.touches[0] : e;
      currentX = pointer.clientX - initialX;
      currentY = pointer.clientY - initialY;

      applyPosition(currentX, currentY);
      e.preventDefault();
    }

    function dragEnd() {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      localStorage.setItem('mini-website-position', JSON.stringify({
        x: currentX,
        y: currentY,
      }));
    }

    header.addEventListener('mousedown', dragStart);
    header.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isMinimized = !isMinimized;
        if (isMinimized) {
          miniWebsite.classList.add('is-minimized');
          if (miniWebsiteContent) {
            miniWebsiteContent.setAttribute('hidden', 'hidden');
          }
          closeBtn.textContent = '+';
          closeBtn.setAttribute('title', 'Expand');
          closeBtn.setAttribute('aria-label', 'Expand mini website');
          closeBtn.setAttribute('aria-expanded', 'false');
          miniWebsite.setAttribute('aria-expanded', 'false');
        } else {
          miniWebsite.classList.remove('is-minimized');
          if (miniWebsiteContent) {
            miniWebsiteContent.removeAttribute('hidden');
          }
          closeBtn.textContent = '−';
          closeBtn.setAttribute('title', 'Minimize');
          closeBtn.setAttribute('aria-label', 'Minimize mini website');
          closeBtn.setAttribute('aria-expanded', 'true');
          miniWebsite.setAttribute('aria-expanded', 'true');
        }
      });
    }
  }

  function spawnMiniWebsite() {
    if (!miniWebsiteTemplate) {
      return null;
    }

    const existing = document.getElementById('mini-website-wrapper');
    if (existing) {
      return existing;
    }

    const fragment = miniWebsiteTemplate.content.cloneNode(true);
    const wrapper = fragment.querySelector('#mini-website-wrapper');

    document.body.appendChild(fragment);

    if (wrapper) {
      initializeMiniWebsite(wrapper);
    }

    return wrapper;
  }

  function disableMiniWebsiteGenerator(button) {
    button.disabled = true;
    button.classList.add('is-disabled');
    button.setAttribute('aria-disabled', 'true');
    button.textContent = 'Mini Website Ready';
  }

  const miniWebsiteTemplate = document.getElementById('mini-website-template');
  const generateMiniWebsiteBtn = document.getElementById('mini-website-generate-btn');
  const miniWebsiteActions = document.querySelector('.mini-website-actions');

  if (miniWebsiteActions && miniWebsiteTemplate) {
    miniWebsiteActions.addEventListener('click', (event) => {
      const trigger = event.target.closest('#mini-website-generate-btn');
      if (!trigger || trigger.disabled) {
        return;
      }

      const wrapper = spawnMiniWebsite();
      if (wrapper) {
        disableMiniWebsiteGenerator(trigger);
      }
    });
  }

  const existingMiniWebsiteWrapper = document.getElementById('mini-website-wrapper');
  if (existingMiniWebsiteWrapper) {
    initializeMiniWebsite(existingMiniWebsiteWrapper);
    if (generateMiniWebsiteBtn) {
      disableMiniWebsiteGenerator(generateMiniWebsiteBtn);
    }
  }

  const playgrounds = document.querySelectorAll('[data-playground]');

  // Collapsible sections
  const collapsibleSections = document.querySelectorAll('.collapsible-section');
  collapsibleSections.forEach((section) => {
    const toggle = section.querySelector('.section-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        section.setAttribute('aria-expanded', !isExpanded);
      });
      section.setAttribute('aria-expanded', 'true');
    }
  });

  playgrounds.forEach((container) => {
    const key = container.getAttribute('data-playground') || '';
    const editor = container.querySelector('textarea');
    const runButton = container.querySelector('.playground-run');
    const resetButton = container.querySelector('.playground-reset');
    const consoleOutput = container.querySelector('.console-output');
    const consoleContent = container.querySelector('.console-content');
    const consoleClear = container.querySelector('.console-clear');

    if (!editor || !consoleOutput || !consoleContent) return;

    const state = { logs: [] };

    function addLog(args, type = 'log') {
      const logEntry = document.createElement('div');
      logEntry.className = `console-line console-${type}`;
      
      // Format multiple arguments
      const formattedArgs = Array.from(args).map(arg => {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (typeof arg === 'string') return `"${arg}"`;
        if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
        return String(arg);
      });
      
      logEntry.textContent = formattedArgs.join(' ');
      consoleContent.appendChild(logEntry);
      state.logs.push({ args, type });
      
      // Auto-scroll to bottom
      consoleContent.scrollTop = consoleContent.scrollHeight;
    }

    function clearConsole() {
      consoleContent.innerHTML = '';
      state.logs = [];
    }

    function reset() {
      clearConsole();
      editor.value = defaultSnippets[key] || '// Write your code here';
    }

    function run() {
      clearConsole();

      window.playgroundLog = (...args) => addLog(args, 'log');

      if (!window.__consoleHooked) {
        window.__consoleHooked = true;

        const realLog = console.log;

        console.log = (...args) => {
          realLog.apply(console, args);        // still prints to browser console
          addLog(args, 'log');                 // prints to website console
        };
      }

      // Special handling for event delegation lesson (#6)
      if (key === 'dom-event-delegation') {

        // If the mini website is NOT yet spawned, spawn it first
        if (!document.getElementById('mini-website-wrapper')) {
          const wrapper = typeof spawnMiniWebsite === 'function'
            ? spawnMiniWebsite()
            : null;

          // Disable generator button
          if (generateMiniWebsiteBtn) {
            disableMiniWebsiteGenerator(generateMiniWebsiteBtn);
          }

          // Wait ONE microtask so DOM settles before running user code
          setTimeout(run, 0);
          return;
        }
      }

      // Normal execution path
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      const originalInfo = console.info;

      console.log = (...args) => {
        originalLog.apply(console, args);
        addLog(args, 'log');
      };
      console.error = (...args) => {
        originalError.apply(console, args);
        addLog(args, 'error');
      };
      console.warn = (...args) => {
        originalWarn.apply(console, args);
        addLog(args, 'warn');
      };
      console.info = (...args) => {
        originalInfo.apply(console, args);
        addLog(args, 'info');
      };

      try {
        const executable = new Function(editor.value);
        executable();
      } catch (error) {
        addLog([error.message || String(error)], 'error');
      } finally {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
        console.info = originalInfo;
      }
    }


    reset();

    runButton?.addEventListener('click', run);
    resetButton?.addEventListener('click', reset);
    consoleClear?.addEventListener('click', clearConsole);
    editor.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        run();
      }
    });
  });

  // Canvas 1: Particle attraction system
  function initParticleCanvas(canvasId) {
    const cursorCanvas = document.getElementById(canvasId);
    if (!cursorCanvas) return;

    const ctx = cursorCanvas.getContext('2d');
    const particles = [];
    const particleCount = 30;
    let mouseX = cursorCanvas.width / 2;
    let mouseY = cursorCanvas.height / 2;
    let animationId;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * cursorCanvas.width,
        y: Math.random() * cursorCanvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 3 + Math.random() * 4,
        hue: Math.random() * 360,
        life: 1,
      });
    }

    // Mouse tracking
    cursorCanvas.addEventListener('mousemove', (e) => {
      const rect = cursorCanvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    cursorCanvas.addEventListener('mouseleave', () => {
      mouseX = cursorCanvas.width / 2;
      mouseY = cursorCanvas.height / 2;
    });

    function draw() {
      // Clear with fade effect
      ctx.fillStyle = 'rgba(11, 11, 15, 0.1)';
      ctx.fillRect(0, 0, cursorCanvas.width, cursorCanvas.height);

      // Update and draw particles
      particles.forEach((p) => {
        // Attract to mouse (faster response)
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = Math.min(150 / (distance + 1), 4);
        
        p.vx += (dx / distance) * force * 0.03;
        p.vy += (dy / distance) * force * 0.03;
        
        // Add some randomness
        p.vx += (Math.random() - 0.5) * 0.1;
        p.vy += (Math.random() - 0.5) * 0.1;
        
        // Apply velocity
        p.x += p.vx;
        p.y += p.vy;
        
        // Damping
        p.vx *= 0.95;
        p.vy *= 0.95;
        
        // Bounce off walls
        if (p.x < 0 || p.x > cursorCanvas.width) p.vx *= -0.8;
        if (p.y < 0 || p.y > cursorCanvas.height) p.vy *= -0.8;
        
        // Keep in bounds
        p.x = Math.max(0, Math.min(cursorCanvas.width, p.x));
        p.y = Math.max(0, Math.min(cursorCanvas.height, p.y));
        
        // Draw particle with gradient
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
        gradient.addColorStop(0, `hsla(${p.hue}, 70%, 60%, 0.8)`);
        gradient.addColorStop(1, `hsla(${p.hue}, 70%, 60%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connections
        particles.forEach((other) => {
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 80) {
            ctx.strokeStyle = `hsla(${p.hue}, 70%, 60%, ${0.3 * (1 - dist / 80)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      // Draw cute cursor icon at mouse position
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '20px sans-serif';
      ctx.fillText('👆', mouseX - 10, mouseY - 10);

      animationId = requestAnimationFrame(draw);
    }

    // Handle canvas resize
    function resizeCanvas() {
      const rect = cursorCanvas.getBoundingClientRect();
      cursorCanvas.width = rect.width;
      cursorCanvas.height = 300;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();

    // Cleanup on section visibility change
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          cancelAnimationFrame(animationId);
        } else {
          draw();
        }
      });
    });

    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      observer.observe(aboutSection);
    }
  }

  // Canvas 2: Mouse drag paint with particles
  function initDragCanvas(canvasId) {
    const cursorCanvas = document.getElementById(canvasId);
    if (!cursorCanvas) return;

    const ctx = cursorCanvas.getContext('2d');
    const brushParticles = [];
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let animationId;
    let hue = 0;

    // Mouse events
    cursorCanvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const rect = cursorCanvas.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
    });

    cursorCanvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      
      const rect = cursorCanvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      // Create brush particles along the drag path
      const dx = currentX - lastX;
      const dy = currentY - lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(distance / 3));

      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const x = lastX + dx * t;
        const y = lastY + dy * t;
        
        // Create multiple particles per step for thicker brush
        for (let j = 0; j < 2; j++) {
          brushParticles.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            radius: 4 + Math.random() * 6,
            hue: (hue + Math.random() * 60) % 360,
            life: 1,
            decay: 0.005 + Math.random() * 0.005,
          });
        }
      }

      lastX = currentX;
      lastY = currentY;
      hue = (hue + 2) % 360;
    });

    cursorCanvas.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    cursorCanvas.addEventListener('mouseleave', () => {
      isDrawing = false;
    });

    function draw() {
      // Clear with fade effect
      ctx.fillStyle = 'rgba(11, 11, 15, 0.15)';
      ctx.fillRect(0, 0, cursorCanvas.width, cursorCanvas.height);

      // Update and draw brush particles
      for (let i = brushParticles.length - 1; i >= 0; i--) {
        const p = brushParticles[i];
        
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Apply gravity and damping (slower)
        p.vy += 0.05;
        p.vx *= 0.96;
        p.vy *= 0.96;
        
        // Update life
        p.life -= p.decay;
        
        // Remove dead particles
        if (p.life <= 0 || p.y > cursorCanvas.height + 20) {
          brushParticles.splice(i, 1);
          continue;
        }
        
        // Draw particle with glow effect
        const alpha = p.life * 0.8;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 65%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 80%, 65%, ${alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 80%, 65%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw core
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw instruction when not drawing
      if (!isDrawing && brushParticles.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✨ Drag to paint! ✨', cursorCanvas.width / 2, cursorCanvas.height / 2);
        ctx.textAlign = 'left';
      }

      animationId = requestAnimationFrame(draw);
    }

    // Handle canvas resize
    function resizeCanvas() {
      const rect = cursorCanvas.getBoundingClientRect();
      cursorCanvas.width = rect.width;
      cursorCanvas.height = 300;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();

    // Cleanup on section visibility change
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          cancelAnimationFrame(animationId);
        } else {
          draw();
        }
      });
    });

    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      observer.observe(aboutSection);
    }
  }

  // Initialize both canvases with unique behaviors
  initParticleCanvas('cursor-canvas-1');
  initDragCanvas('cursor-canvas-2');
})();
