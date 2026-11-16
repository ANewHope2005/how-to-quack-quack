document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentLessonId = 1;
    let userProgress = JSON.parse(localStorage.getItem('quack_progress')) || {};
    let userBookmarks = JSON.parse(localStorage.getItem('quack_bookmarks')) || [];
    let userNotes = JSON.parse(localStorage.getItem('quack_notes')) || {};
    let userHighlights = JSON.parse(localStorage.getItem('quack_highlights')) || {};
    let userObjectives = JSON.parse(localStorage.getItem('quack_objectives')) || {};
    let userQuizScores = JSON.parse(localStorage.getItem('quack_quiz_scores')) || {};

    // DOM Elements
    const mainArea = document.getElementById('main-content-area');
    const lessonListContainer = document.getElementById('lesson-list-container');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Modals
    const searchModal = document.getElementById('search-modal');
    const searchBtn = document.getElementById('global-search-btn');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    const glossaryModal = document.getElementById('glossary-modal');
    const glossaryBtn = document.getElementById('glossary-modal-btn');
    const glossaryClose = document.getElementById('glossary-close');
    const glossaryList = document.getElementById('glossary-list');
    const glossarySearch = document.getElementById('glossary-search');

    const backupModal = document.getElementById('backup-modal');
    const backupBtn = document.getElementById('backup-modal-btn');
    const backupClose = document.getElementById('backup-close');
    const exportBtn = document.getElementById('export-btn');
    const importFile = document.getElementById('import-file');

    // Theme initialization
    if (localStorage.getItem('quack_theme') === 'dark' || (!localStorage.getItem('quack_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    themeToggle.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('quack_theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('quack_theme', 'dark');
        }
    });

    // Sidebar toggling
    function toggleSidebar() {
        sidebar.classList.toggle('translate-x-full');
        sidebarBackdrop.classList.toggle('hidden');
    }
    sidebarToggle.addEventListener('click', toggleSidebar);
    sidebarClose.addEventListener('click', toggleSidebar);
    sidebarBackdrop.addEventListener('click', toggleSidebar);

    // Save state helper
    function saveState() {
        localStorage.setItem('quack_progress', JSON.stringify(userProgress));
        localStorage.setItem('quack_bookmarks', JSON.stringify(userBookmarks));
        localStorage.setItem('quack_notes', JSON.stringify(userNotes));
        localStorage.setItem('quack_highlights', JSON.stringify(userHighlights));
        localStorage.setItem('quack_objectives', JSON.stringify(userObjectives));
        localStorage.setItem('quack_quiz_scores', JSON.stringify(userQuizScores));
    }

    // Render Sidebar Navigation List
    function renderSidebarList() {
        lessonListContainer.innerHTML = '';
        const homeLink = document.createElement('a');
        homeLink.href = '#home';
        homeLink.className = `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${window.location.hash === '#home' || !window.location.hash ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`;
        homeLink.innerHTML = `<span class="flex items-center gap-2">🏠 نمای کلی دوره</span>`;
        homeLink.onclick = (e) => { e.preventDefault(); window.location.hash = 'home'; };
        lessonListContainer.appendChild(homeLink);

        LESSONS_DATA.forEach(lesson => {
            const isCompleted = userProgress[lesson.id];
            const isBookmarked = userBookmarks.includes(lesson.id);
            const a = document.createElement('a');
            a.href = `#lesson-${lesson.id}`;
            a.className = `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${currentLessonId === lesson.id && window.location.hash.includes('lesson') ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`;
            
            a.innerHTML = `
                <div class="truncate flex items-center gap-2">
                    <span class="w-5 h-5 flex items-center justify-center text-xs rounded-full ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}">${isCompleted ? '✓' : lesson.id}</span>
                    <span class="truncate">${lesson.title}</span>
                </div>
                ${isBookmarked ? '<span class="text-amber-400">★</span>' : ''}
            `;
            a.onclick = (e) => {
                e.preventDefault();
                window.location.hash = `lesson-${lesson.id}`;
                if (window.innerWidth < 1024) toggleSidebar();
            };
            lessonListContainer.appendChild(a);
        });
    }

    // Simple robust Markdown renderer simulation
    function renderMarkdownToHTML(markdownText) {
        let html = markdownText
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^\* (.*$)/gm, '<li>$1</li>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');

        // Wrap lists
        html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside my-4 space-y-2">$1</ul>');
        
        // Paragraphs
        const paragraphs = html.split('\n\n');
        html = paragraphs.map(p => {
            if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<pre') || p.startsWith('<table')) return p;
            if (p.trim() === '') return '';
            return `<p>${p}</p>`;
        }).join('');

        return html;
    }

    // Render Home View
    function renderHomeView() {
        const completedCount = Object.values(userProgress).filter(Boolean).length;
        const percent = Math.round((completedCount / LESSONS_DATA.length) * 100);

        mainArea.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                <div class="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
                    <span class="bg-emerald-500/30 text-emerald-100 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">پروژه آموزشی ساختاریافته</span>
                    <h1 class="text-3xl sm:text-5xl font-extrabold mt-4 mb-3">How to Quack Quack</h1>
                    <p class="text-emerald-100 text-lg sm:text-xl font-light">محیط یادگیری تعاملی و جامع ماژول مبانی داکینگ مولکولی (Molecular Docking Fundamentals)</p>
                    
                    <div class="mt-8 flex flex-wrap gap-4 items-center">
                        <a href="#lesson-1" class="bg-white text-emerald-800 font-bold px-6 py-3 rounded-xl shadow-md hover:bg-emerald-50 transition">شروع یادگیری (درس اول)</a>
                        <button id="home-glossary-btn" class="bg-emerald-500/40 hover:bg-emerald-500/60 text-white font-medium px-6 py-3 rounded-xl border border-emerald-400/30 transition">مشاهده واژه‌نامه تخصصی</button>
                    </div>
                </div>

                <!-- Progress Card -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100">پیشرفت مطالعه کل دوره</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${completedCount} درس از ۱۲ درس تکمیل شده است.</p>
                    </div>
                    <div class="w-full sm:w-64 bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                        <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                    </div>
                    <span class="font-bold text-emerald-600 dark:text-emerald-400 text-lg">${percent}%</span>
                </div>

                <!-- Lessons Grid -->
                <div class="space-y-4">
                    <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100 pt-4">فهرست ماژول‌ها و درس‌ها</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${LESSONS_DATA.map(lesson => {
                            const isDone = userProgress[lesson.id];
                            const isBm = userBookmarks.includes(lesson.id);
                            return `
                                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition flex flex-col justify-between group">
                                    <div>
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${lesson.module}</span>
                                            <div class="flex items-center gap-2">
                                                <button data-bookmark="${lesson.id}" class="text-slate-400 hover:text-amber-400 transition bookmark-btn" title="نشانک‌گذاری">
                                                    ${isBm ? '★' : '☆'}
                                                </button>
                                                ${isDone ? '<span class="text-emerald-500 text-sm font-bold">✓ تکمیل‌شده</span>' : ''}
                                            </div>
                                        </div>
                                        <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">${lesson.title}</h3>
                                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${lesson.subtitle}</p>
                                    </div>
                                    <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm">
                                        <span class="text-slate-400">⏱ ${lesson.readTime}</span>
                                        <a href="#lesson-${lesson.id}" class="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">مطالعه درس →</a>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('home-glossary-btn').addEventListener('click', () => glossaryModal.classList.remove('hidden'));
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-bookmark'));
                if (userBookmarks.includes(id)) {
                    userBookmarks = userBookmarks.filter(b => b !== id);
                } else {
                    userBookmarks.push(id);
                }
                saveState();
                renderSidebarList();
                renderHomeView();
            });
        });
    }

    // Render Lesson View
    function renderLessonView(lessonId) {
        currentLessonId = lessonId;
        const lesson = LESSONS_DATA.find(l => l.id === lessonId);
        if (!lesson) return renderHomeView();

        const isCompleted = userProgress[lesson.id] || false;
        const isBookmarked = userBookmarks.includes(lesson.id);
        const lessonObjectives = userObjectives[lesson.id] || lesson.objectives.map(() => false);
        const lessonNotes = userNotes[lesson.id] || [];
        const savedQuizScore = userQuizScores[lesson.id] || { latest: '-', best: '-' };

        mainArea.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                <!-- Top Lesson Bar -->
                <div class="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="flex items-center gap-3">
                        <a href="#home" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200">← بازگشت</a>
                        <div>
                            <span class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">${lesson.module}</span>
                            <h2 class="font-bold text-lg text-slate-800 dark:text-slate-100">درس ${lesson.id} از ۱۲</h2>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="lesson-bookmark-btn" class="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium flex items-center gap-1.5 ${isBookmarked ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-300' : ''}">
                            <span>${isBookmarked ? '★ نشانک‌شده' : '☆ نشانک'}</span>
                        </button>
                        <button id="lesson-complete-btn" class="px-4 py-2 rounded-xl font-medium text-sm transition ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50'}" data-completed="${isCompleted}">
                            ${isCompleted ? '✓ درس تکمیل شد' : 'علامت‌گذاری به عنوان تکمیل‌شده'}
                        </button>
                    </div>
                </div>

                <!-- Markdown Content Container -->
                <article class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-700 markdown-body">
                    ${renderMarkdownToHTML(lesson.content)}
                </article>

                <!-- Interactive Features Section (Objectives, Notes, Quiz) -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Learning Objectives Checklist -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                        <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">🎯 اهداف یادگیری این درس</h3>
                        <div class="space-y-2">
                            ${lesson.objectives.map((obj, idx) => `
                                <label class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition">
                                    <input type="checkbox" data-obj-idx="${idx}" ${lessonObjectives[idx] ? 'checked' : ''} class="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500">
                                    <span class="text-sm text-slate-700 dark:text-slate-300">${obj}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Knowledge Check Quiz -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">🧠 آزمون سنجش یادگیری</h3>
                            <span class="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">بهترین امتیاز: ${savedQuizScore.best}</span>
                        </div>
                        ${lesson.quiz && lesson.quiz.length > 0 ? `
                            <div class="space-y-4" id="quiz-container">
                                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">${lesson.quiz[0].q}</p>
                                <div class="space-y-2" id="quiz-options">
                                    ${lesson.quiz[0].options.map((opt, oIdx) => `
                                        <button data-option="${oIdx}" class="w-full text-right p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm text-slate-700 dark:text-slate-300 transition quiz-opt-btn">
                                            ${opt}
                                        </button>
                                    `).join('')}
                                </div>
                                <div id="quiz-feedback" class="hidden p-3 rounded-xl text-sm"></div>
                            </div>
                        ` : '<p class="text-sm text-slate-400">آزمون اختصاصی برای این بخش در منبع تنظیم شده است.</p>'}
                    </div>
                </div>

                <!-- Personal Notes Section -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">📝 یادداشت‌های شخصی شما برای این درس</h3>
                    <div class="flex gap-2">
                        <input id="new-note-input" type="text" placeholder="یادداشت جدید خود را اینجا بنویسید..." class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <button id="add-note-btn" class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition">افزودن</button>
                    </div>
                    <div id="notes-list" class="space-y-2 pt-2">
                        ${lessonNotes.length === 0 ? '<p class="text-sm text-slate-400 text-center py-4">هنوز یادداشتی برای این درس ثبت نکرده‌اید.</p>' : lessonNotes.map((note, nIdx) => `
                            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 text-sm">
                                <span class="text-slate-700 dark:text-slate-300">${note}</span>
                                <button data-note-idx="${nIdx}" class="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded delete-note-btn">حذف</button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Previous / Next Lesson Navigation -->
                <div class="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                    ${lessonId > 1 ? `<a href="#lesson-${lessonId - 1}" class="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium">← درس قبلی</a>` : '<div></div>'}
                    ${lessonId < LESSONS_DATA.length ? `<a href="#lesson-${lessonId + 1}" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm">درس بعدی →</a>` : '<div></div>'}
                </div>
            </div>
        `;

        // Event Listeners for Lesson Features
        document.getElementById('lesson-bookmark-btn').addEventListener('click', () => {
            if (userBookmarks.includes(lesson.id)) {
                userBookmarks = userBookmarks.filter(b => b !== lesson.id);
            } else {
                userBookmarks.push(lesson.id);
            }
            saveState();
            renderSidebarList();
            renderLessonView(lesson.id);
        });

        document.getElementById('lesson-complete-btn').addEventListener('click', (e) => {
            userProgress[lesson.id] = !userProgress[lesson.id];
            saveState();
            renderSidebarList();
            renderLessonView(lesson.id);
        });

        // Objectives Checklist Listeners
        document.querySelectorAll('input[data-obj-idx]').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const idx = parseInt(e.target.getAttribute('data-obj-idx'));
                if (!userObjectives[lesson.id]) userObjectives[lesson.id] = lesson.objectives.map(() => false);
                userObjectives[lesson.id][idx] = e.target.checked;
                saveState();
            });
        });

        // Quiz Option Click
        document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedOpt = parseInt(e.target.getAttribute('data-option'));
                const correctOpt = lesson.quiz[0].correct;
                const feedback = document.getElementById('quiz-feedback');
                feedback.classList.remove('hidden');
                if (selectedOpt === correctOpt) {
                    feedback.className = 'p-3 rounded-xl text-sm bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
                    feedback.innerHTML = `<strong>پاسخ صحیح است!</strong> ${lesson.quiz[0].explanation}`;
                    userQuizScores[lesson.id] = { latest: 'صحیح', best: 'صحیح' };
                } else {
                    feedback.className = 'p-3 rounded-xl text-sm bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800';
                    feedback.innerHTML = `<strong>پاسخ نادرست است.</strong> ${lesson.quiz[0].explanation}`;
                    userQuizScores[lesson.id] = { latest: 'نادرست', best: userQuizScores[lesson.id]?.best || 'نادرست' };
                }
                saveState();
            });
        });

        // Add Note Listener
        document.getElementById('add-note-btn').addEventListener('click', () => {
            const input = document.getElementById('new-note-input');
            const val = input.value.trim();
            if (val) {
                if (!userNotes[lesson.id]) userNotes[lesson.id] = [];
                userNotes[lesson.id].push(val);
                input.value = '';
                saveState();
                renderLessonView(lesson.id);
            }
        });

        // Delete Note Listeners
        document.querySelectorAll('.delete-note-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nIdx = parseInt(e.target.getAttribute('data-note-idx'));
                userNotes[lesson.id].splice(nIdx, 1);
                saveState();
                renderLessonView(lesson.id);
            });
        });

        // Generate Table of Contents dynamically from article headers
        const tocContainer = document.getElementById('toc-container');
        tocContainer.innerHTML = '';
        const headers = mainArea.querySelectorAll('article h2, article h3');
        headers.forEach((h, hIdx) => {
            h.id = `heading-${hIdx}`;
            const tocLink = document.createElement('a');
            tocLink.href = `#heading-${hIdx}`;
            tocLink.className = `block py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50 truncate ${h.tagName === 'H3' ? 'pr-4 text-xs' : 'font-semibold text-xs'}`;
            tocLink.textContent = h.textContent;
            tocContainer.appendChild(tocLink);
        });
    }

    // Global Search Modal Logic
    searchBtn.addEventListener('click', () => searchModal.classList.remove('hidden'));
    searchClose.addEventListener('click', () => searchModal.classList.add('hidden'));
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2) {
            searchResults.innerHTML = '<p class="text-center text-slate-400 py-8">حداقل ۲ کاراکتر وارد کنید...</p>';
            return;
        }
        let matches = [];
        LESSONS_DATA.forEach(lesson => {
            if (lesson.title.toLowerCase().includes(query) || lesson.content.toLowerCase().includes(query)) {
                matches.push(lesson);
            }
        });

        if (matches.length === 0) {
            searchResults.innerHTML = '<p class="text-center text-slate-400 py-8">نتیجه‌ای یافت نشد.</p>';
            return;
        }

        searchResults.innerHTML = matches.map(m => `
            <div class="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer transition search-result-item" data-lesson-id="${m.id}">
                <span class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">${m.module}</span>
                <h4 class="font-bold text-slate-800 dark:text-slate-100">${m.title}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">${m.subtitle}</p>
            </div>
        `).join('');

        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const lId = parseInt(e.currentTarget.getAttribute('data-lesson-id'));
                searchModal.classList.add('hidden');
                window.location.hash = `lesson-${lId}`;
            });
        });
    });

    // Glossary Modal Logic
    glossaryBtn.addEventListener('click', () => {
        renderGlossaryList('');
        glossaryModal.classList.remove('hidden');
    });
    glossaryClose.addEventListener('click', () => glossaryModal.classList.add('hidden'));
    glossarySearch.addEventListener('input', (e) => renderGlossaryList(e.target.value.trim().toLowerCase()));

    function renderGlossaryList(filter) {
        let allTerms = [];
        LESSONS_DATA.forEach(l => {
            if (l.glossary) allTerms.push(...l.glossary);
        });
        if (filter) {
            allTerms = allTerms.filter(t => t.term.toLowerCase().includes(filter) || t.fa.includes(filter) || t.desc.includes(filter));
        }
        glossaryList.innerHTML = allTerms.length === 0 ? '<p class="text-center text-slate-400 py-8">اصطلاحی یافت نشد.</p>' : allTerms.map(t => `
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <div class="flex items-center justify-between">
                    <h4 class="font-bold text-slate-800 dark:text-slate-100 font-mono text-sm">${t.term}</h4>
                    <span class="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold">${t.fa}</span>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-300">${t.desc}</p>
            </div>
        `).join('');
    }

    // Backup & Restore Modal Logic
    backupBtn.addEventListener('click', () => backupModal.classList.remove('hidden'));
    backupClose.addEventListener('click', () => backupModal.classList.add('hidden'));
    
    exportBtn.addEventListener('click', () => {
        const backupData = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            progress: userProgress,
            bookmarks: userBookmarks,
            notes: userNotes,
            highlights: userHighlights,
            objectives: userObjectives,
            quizScores: userQuizScores
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `how-to-quack-quack-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.version && data.progress) {
                    userProgress = data.progress || {};
                    userBookmarks = data.bookmarks || [];
                    userNotes = data.notes || {};
                    userHighlights = data.highlights || {};
                    userObjectives = data.objectives || {};
                    userQuizScores = data.quizScores || {};
                    saveState();
                    alert('اطلاعات با موفقیت بازیابی شد.');
                    backupModal.classList.add('hidden');
                    router();
                } else {
                    alert('فایل پشتیبان نامعتبر است.');
                }
            } catch (err) {
                alert('خطا در خواندن فایل JSON پشتیبان.');
            }
        };
        reader.readAsText(file);
    });

    // Router
    function router() {
        const hash = window.location.hash;
        renderSidebarList();
        if (!hash || hash === '#home') {
            renderHomeView();
        } else if (hash.startsWith('#lesson-')) {
            const id = parseInt(hash.replace('#lesson-', ''));
            renderLessonView(id);
        } else {
            renderHomeView();
        }
        window.scrollTo(0, 0);
    }

    window.addEventListener('hashchange', router);
    router();
});