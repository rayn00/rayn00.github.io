/* AME LAB 雨宮研究室 — 共通スクリプト（全ページ共通） */
(function () {
    'use strict';

    var root = document.documentElement;
    var store = {
        get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    };
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* ---------- UI文言（日英） ---------- */
    var UI = {
        ja: {
            title: '雨宮研究室 | AME LAB - Augmented Multisensory Experience Lab',
            desc: '東京大学 雨宮研究室（AME LAB）。錯覚と多感覚統合の機序を解明し、人間の知覚・身体機能を拡張するVR・触覚技術を研究しています。',
            toLight: 'ライトモードに切り替え',
            toDark: 'ダークモードに切り替え',
            langText: 'EN',
            langLabel: 'Switch to English',
            langLabelLang: 'en',
            menuOpen: 'メニューを開く',
            menuClose: 'メニューを閉じる',
            nav: 'メインメニュー',
            filter: '論文の種類で絞り込み'
        },
        en: {
            title: 'AME LAB | Amemiya Lab, The University of Tokyo',
            desc: 'AME LAB (Amemiya Lab), The University of Tokyo. We study the mechanisms of illusion and multisensory integration and create VR and haptic technologies that augment human perception and the body.',
            toLight: 'Switch to light mode',
            toDark: 'Switch to dark mode',
            langText: 'JA',
            langLabel: '日本語に切り替え',
            langLabelLang: 'ja',
            menuOpen: 'Open menu',
            menuClose: 'Close menu',
            nav: 'Main menu',
            filter: 'Filter publications by type'
        }
    };
    function t(key) { return UI[root.lang === 'en' ? 'en' : 'ja'][key]; }
    // ページごとのタイトル・説明文（<body data-title-ja="…"> など）。無ければ上の既定値
    function pageText(key) {
        var lang = root.lang === 'en' ? 'En' : 'Ja';
        return document.body.getAttribute('data-' + key + '-' + lang.toLowerCase()) || t(key);
    }

    /* ---------- ヘッダー高さをCSS変数へ（モバイルメニュー位置・アンカー位置用） ---------- */
    var header = document.getElementById('siteHeader');
    function setHeaderH() { root.style.setProperty('--header-h', header.offsetHeight + 'px'); }
    setHeaderH();
    if ('ResizeObserver' in window) new ResizeObserver(setHeaderH).observe(header);
    else window.addEventListener('resize', setHeaderH);

    /* ---------- ロゴ画像が読めないときは文字ロゴに切替 ---------- */
    document.querySelectorAll('img[data-logo]').forEach(function (img) {
        var wrap = img.closest('[data-logo-wrap]');
        function fail() { if (wrap) wrap.classList.add('no-logo'); }
        if (img.complete && img.naturalWidth === 0) fail();
        else img.addEventListener('error', fail);
    });

    /* ---------- 顔写真：縮小版→原寸→頭文字の順にフォールバック ---------- */
    document.querySelectorAll('[data-avatar] img').forEach(function (img) {
        var box = img.closest('[data-avatar]');
        function fail() {
            var full = img.getAttribute('data-full');
            if (full) {
                img.removeAttribute('data-full');
                img.src = full;
            } else {
                box.classList.add('no-photo');
            }
        }
        img.addEventListener('error', fail);
        if (img.complete && img.naturalWidth === 0) fail();
    });

    /* ---------- ヒーローCanvas ---------- */
    var hero = (function () {
        var canvas = document.getElementById('hero-canvas');
        if (!canvas) return { refreshColor: function () {} };
        var section = canvas.parentElement;
        var ctx = canvas.getContext('2d');
        var LINK = 120;
        var w = 0, h = 0, particles = [], rgb = '0, 242, 254';
        var running = false, visible = true, rafId = 0;

        function readColor() {
            var v = getComputedStyle(root).getPropertyValue('--particle-rgb').trim();
            if (v) rgb = v;
        }
        function makeParticle() {
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                r: Math.random() * 2 + 1
            };
        }
        // 画面サイズに応じて粒子数を調整（スマホでは少なめ）
        function targetCount() {
            return Math.round(Math.min(70, Math.max(24, (w * h) / 16000)));
        }
        // Canvasの描画解像度を表示サイズ×devicePixelRatioに合わせる（歪み・ぼやけ防止）
        function resize() {
            var rect = section.getBoundingClientRect();
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = rect.width;
            h = rect.height;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            particles.forEach(function (p) {
                p.x = Math.min(Math.max(p.x, 0), w);
                p.y = Math.min(Math.max(p.y, 0), h);
            });
            var n = targetCount();
            while (particles.length < n) particles.push(makeParticle());
            particles.length = n;
            if (!running) draw();
        }
        function step() {
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                // 端で位置を戻してから反転（縮小時に端で震えて止まるのを防ぐ）
                if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
                else if (p.x > w) { p.x = w; p.vx = -Math.abs(p.vx); }
                if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
                else if (p.y > h) { p.y = h; p.vy = -Math.abs(p.vy); }
            }
        }
        function draw() {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgb(' + rgb + ')';
            ctx.lineWidth = 0.5;
            for (var i = 0; i < particles.length; i++) {
                var a = particles[i];
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
                ctx.fill();
                for (var j = i + 1; j < particles.length; j++) {
                    var b = particles[j];
                    var dx = a.x - b.x, dy = a.y - b.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < LINK) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = 'rgba(' + rgb + ', ' + (1 - dist / LINK) + ')';
                        ctx.stroke();
                    }
                }
            }
        }
        function frame() {
            step();
            draw();
            rafId = requestAnimationFrame(frame);
        }
        function start() {
            if (running || reduceMotion.matches || !visible) return;
            running = true;
            rafId = requestAnimationFrame(frame);
        }
        function stop() {
            running = false;
            cancelAnimationFrame(rafId);
        }

        readColor();
        resize();
        if ('ResizeObserver' in window) new ResizeObserver(resize).observe(section);
        else window.addEventListener('resize', resize);

        // 画面外ではアニメーションを止める
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting;
                if (visible) start(); else stop();
            }).observe(section);
        }
        // 「視差効果を減らす」設定時は静止画で表示
        reduceMotion.addEventListener('change', function () {
            if (reduceMotion.matches) { stop(); draw(); } else { start(); }
        });
        start();

        return {
            refreshColor: function () { readColor(); if (!running) draw(); }
        };
    })();

    /* ---------- テーマ切替（保存・OS設定に追従） ---------- */
    var themeBtn = document.getElementById('themeBtn');
    function updateThemeUI() {
        var light = root.getAttribute('data-theme') === 'light';
        themeBtn.querySelector('i').className = 'fa-solid ' + (light ? 'fa-sun' : 'fa-moon');
        themeBtn.setAttribute('aria-label', light ? t('toDark') : t('toLight'));
    }
    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        updateThemeUI();
        hero.refreshColor();
    }
    themeBtn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        store.set('amelab-theme', next);
        applyTheme(next);
    });
    var mqLight = window.matchMedia('(prefers-color-scheme: light)');
    mqLight.addEventListener('change', function (e) {
        if (!store.get('amelab-theme')) applyTheme(e.matches ? 'light' : 'dark');
    });

    /* ---------- モバイルメニュー ---------- */
    var mobileBtn = document.getElementById('mobileBtn');
    var navLinks = document.getElementById('navLinks');
    function isMenuOpen() { return navLinks.classList.contains('open'); }
    function updateMenuUI() {
        var open = isMenuOpen();
        mobileBtn.setAttribute('aria-expanded', String(open));
        mobileBtn.setAttribute('aria-label', open ? t('menuClose') : t('menuOpen'));
        // アイコン要素は差し替えずクラスだけ変更（クリック中の要素が消えると外側クリック判定が誤作動するため）
        mobileBtn.querySelector('i').className = 'fa-solid ' + (open ? 'fa-xmark' : 'fa-bars');
    }
    function setMenu(open) {
        navLinks.classList.toggle('open', open);
        updateMenuUI();
    }
    mobileBtn.addEventListener('click', function () { setMenu(!isMenuOpen()); });
    // リンクを押したら閉じる
    navLinks.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
    });
    // Escキー・メニュー外クリックで閉じる
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isMenuOpen()) { setMenu(false); mobileBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
        if (isMenuOpen() && !navLinks.contains(e.target) && !mobileBtn.contains(e.target)) setMenu(false);
    });
    window.matchMedia('(max-width: 1100px)').addEventListener('change', function (e) {
        if (!e.matches) setMenu(false);
    });

    /* ---------- 日英切替 ---------- */
    var langBtn = document.getElementById('langBtn');
    var metaDesc = document.querySelector('meta[name="description"]');
    var siteNav = document.getElementById('siteNav');
    var pubTabsGroup = document.querySelector('.pub-tabs');
    var listCounters = [];
    function applyLang(lang) {
        root.lang = lang;
        document.title = pageText('title');
        if (metaDesc) metaDesc.setAttribute('content', pageText('desc'));
        langBtn.textContent = t('langText');
        langBtn.setAttribute('aria-label', t('langLabel'));
        langBtn.setAttribute('lang', t('langLabelLang'));
        siteNav.setAttribute('aria-label', t('nav'));
        if (pubTabsGroup) pubTabsGroup.setAttribute('aria-label', t('filter'));
        // 入力欄の案内文（data-ph-ja / data-ph-en）
        document.querySelectorAll('[data-ph-ja]').forEach(function (el) {
            var ph = el.getAttribute(lang === 'en' ? 'data-ph-en' : 'data-ph-ja');
            el.setAttribute('placeholder', ph);
            el.setAttribute('aria-label', ph);
        });
        listCounters.forEach(function (fn) { fn(); });
        updateThemeUI();
        updateMenuUI();
        updateMapLang(lang);
    }
    // 地図の表示言語を切り替え
    var mapFrame = document.getElementById('mapFrame');
    function updateMapLang(lang) {
        if (!mapFrame) return;
        var src = 'https://maps.google.com/maps?q=' + mapFrame.getAttribute('data-map-q') + '&hl=' + lang + '&z=17&output=embed';
        if (mapFrame.getAttribute('src') !== src) mapFrame.setAttribute('src', src);
        mapFrame.setAttribute('title', mapFrame.getAttribute('data-title-' + lang));
    }
    langBtn.addEventListener('click', function () {
        var next = root.lang === 'en' ? 'ja' : 'en';
        store.set('amelab-lang', next);
        applyLang(next);
        // ?lang=en を付けたURLで英語版を共有できるようにする
        try {
            var url = new URL(location.href);
            if (next === 'en') url.searchParams.set('lang', 'en');
            else url.searchParams.delete('lang');
            history.replaceState(null, '', url);
        } catch (e) {}
    });

    /* ---------- 論文フィルタ ---------- */
    var pubTabs = document.querySelectorAll('.pub-tab');
    var pubItems = document.querySelectorAll('.pub-item');
    pubTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var type = tab.getAttribute('data-type');
            pubTabs.forEach(function (tb) {
                var on = tb === tab;
                tb.classList.toggle('active', on);
                tb.setAttribute('aria-pressed', String(on));
            });
            pubItems.forEach(function (item) {
                item.hidden = !(type === 'all' || item.getAttribute('data-type') === type);
            });
        });
    });

    /* ---------- 表示中のセクションをナビでハイライト ---------- */
    var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-link[href^="#"]'));
    if (navAnchors.length && 'IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                navAnchors.forEach(function (a) {
                    var on = a.getAttribute('href') === '#' + en.target.id;
                    a.classList.toggle('active', on);
                    if (on) a.setAttribute('aria-current', 'location');
                    else a.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main > section[id]').forEach(function (s) { spy.observe(s); });
    }

    /* ---------- Googleサイトに埋め込まれた場合のリンク ---------- */
    // Googleサイトの「埋め込み」(iframe) 内では同じタブでのページ移動が制限されるため、
    // 研究室内ページとメールのリンクは新しいタブで開く。単独で表示している場合は同じタブで移動する。
    var inFrame = true;
    try { inFrame = window.self !== window.top; } catch (e) {}
    if (inFrame) {
        document.querySelectorAll('a[data-site-link], a[href^="mailto:"]').forEach(function (a) {
            a.target = '_blank';
            a.rel = 'noopener';
        });
    }

    /* ---------- メールアドレス（迷惑メール対策） ---------- */
    // HTML にはアドレスを書かず、<a data-mail="…"> に Base64 で入れておく。
    // アドレス収集ロボットに読まれないよう、マウスを乗せる・タップ・キーボードで選ぶ・クリックの
    // いずれかをしたときに初めて mailto: のリンクを組み立てる。
    // アドレスを変えるときは、ブラウザの開発者ツールで btoa('新しいアドレス') を実行した結果を data-mail に入れる。
    document.querySelectorAll('a[data-mail]').forEach(function (a) {
        function reveal() {
            if (a.hasAttribute('data-mail-ready')) return;
            try { a.href = 'mailto:' + atob(a.getAttribute('data-mail')); } catch (e) { return; }
            a.setAttribute('data-mail-ready', '');
            if (inFrame) { a.target = '_blank'; a.rel = 'noopener'; }
        }
        ['pointerenter', 'pointerdown', 'touchstart', 'focus', 'click'].forEach(function (ev) {
            a.addEventListener(ev, reveal, { passive: true });
        });
    });

    /* ---------- 一覧ページの絞り込み・検索（論文・ニュース） ---------- */
    // <div id="…" data-list> の中の [data-type] を、.filter-tab[data-for="…"] と
    // input[data-search-for="…"] で絞り込む。年ごとの .year-group は中身が無くなると隠す
    document.querySelectorAll('[data-list]').forEach(function (list) {
        var id = list.id;
        var tabs = Array.prototype.slice.call(document.querySelectorAll('.filter-tab[data-for="' + id + '"]'));
        var search = document.querySelector('input[data-search-for="' + id + '"]');
        var countEl = document.querySelector('[data-count-for="' + id + '"]');
        var empty = list.querySelector('.empty-state');
        var items = Array.prototype.slice.call(list.querySelectorAll('[data-type]'));
        var groups = Array.prototype.slice.call(list.querySelectorAll('.year-group'));
        var state = { type: 'all', q: '' };
        var shown = items.length;

        function updateCount() {
            if (!countEl) return;
            countEl.textContent = root.lang === 'en'
                ? shown + (shown === 1 ? ' item' : ' items')
                : shown + '件';
        }
        function apply() {
            shown = 0;
            items.forEach(function (it) {
                var okType = state.type === 'all' || it.getAttribute('data-type') === state.type;
                var okText = !state.q || it.textContent.toLowerCase().indexOf(state.q) !== -1;
                it.hidden = !(okType && okText);
                if (!it.hidden) shown++;
            });
            groups.forEach(function (g) {
                g.hidden = !g.querySelector('[data-type]:not([hidden])');
            });
            if (empty) empty.hidden = shown !== 0;
            updateCount();
        }
        tabs.forEach(function (tab) {
            var type = tab.getAttribute('data-filter');
            var c = tab.querySelector('.count');
            if (c) c.textContent = type === 'all' ? items.length
                : items.filter(function (it) { return it.getAttribute('data-type') === type; }).length;
            tab.addEventListener('click', function () {
                state.type = type;
                tabs.forEach(function (tb) {
                    var on = tb === tab;
                    tb.classList.toggle('active', on);
                    tb.setAttribute('aria-pressed', String(on));
                });
                apply();
            });
        });
        if (search) {
            search.addEventListener('input', function () {
                state.q = search.value.trim().toLowerCase();
                apply();
            });
        }
        // URLの #journal などで種類を指定して開けるようにする
        var hashType = location.hash.slice(1);
        var hashTab = tabs.filter(function (tb) { return tb.getAttribute('data-filter') === hashType; })[0];
        if (hashTab) hashTab.click(); else apply();
        listCounters.push(updateCount);
    });

    /* ---------- タブ（配属・連携案内） ---------- */
    // <div data-tabs> の中の [role="tab"]（aria-controls でパネルを指定）で切り替える。
    // index.html#industry のようにパネルのIDを付けたURLで開くと、そのタブを表示する
    document.querySelectorAll('[data-tabs]').forEach(function (box) {
        var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
        var panels = tabs.map(function (tb) { return document.getElementById(tb.getAttribute('aria-controls')); });
        function select(i, focus) {
            tabs.forEach(function (tb, j) {
                var on = i === j;
                tb.setAttribute('aria-selected', String(on));
                tb.tabIndex = on ? 0 : -1;
                if (panels[j]) panels[j].hidden = !on;
            });
            if (focus) tabs[i].focus();
        }
        tabs.forEach(function (tb, i) {
            tb.addEventListener('click', function () { select(i); });
            tb.addEventListener('keydown', function (e) {
                var n = tabs.length;
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    select((i + (e.key === 'ArrowRight' ? 1 : n - 1)) % n, true);
                } else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
                else if (e.key === 'End') { e.preventDefault(); select(n - 1, true); }
            });
        });
        function fromHash() {
            var id = decodeURIComponent(location.hash.slice(1));
            var target = id && document.getElementById(id);
            if (!target) return;
            for (var i = 0; i < panels.length; i++) {
                if (panels[i] && (panels[i] === target || panels[i].contains(target))) {
                    select(i);
                    if (panels[i] === target) box.scrollIntoView({ block: 'start' });
                    return;
                }
            }
        }
        select(0);
        fromHash();
        window.addEventListener('hashchange', fromHash);
    });

    /* ---------- 研究テーマのショート動画 ---------- */
    // カードに data-short="YouTubeの動画ID" を付けると、カードのクリックで縦長の動画をポップアップ再生する
    var shortCards = Array.prototype.slice.call(document.querySelectorAll('[data-short]'));
    if (shortCards.length) {
        var dlg = null, dlgFrame, dlgTitle, dlgLink, dlgClose, lastFocus = null;
        var buildDialog = function () {
            dlg = document.createElement('dialog');
            dlg.className = 'short-dialog';
            dlg.setAttribute('aria-labelledby', 'shortDialogTitle');
            dlg.innerHTML = '<div class="short-dialog-inner">' +
                '<div class="short-dialog-head"><p class="short-dialog-title" id="shortDialogTitle"></p>' +
                '<button type="button" class="short-dialog-close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>' +
                '<div class="short-frame"></div>' +
                '<p class="short-dialog-foot"><a target="_blank" rel="noopener"><i class="fa-brands fa-youtube" aria-hidden="true"></i> ' +
                '<span class="ja">YouTubeで見る</span><span class="en" lang="en">Watch on YouTube</span></a></p></div>';
            document.body.appendChild(dlg);
            dlgFrame = dlg.querySelector('.short-frame');
            dlgTitle = dlg.querySelector('.short-dialog-title');
            dlgLink = dlg.querySelector('.short-dialog-foot a');
            dlgClose = dlg.querySelector('.short-dialog-close');
            dlgClose.addEventListener('click', function () { dlg.close(); });
            // 動画の外側（背景）をクリックしたら閉じる
            dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
            // 閉じたら動画を止める
            dlg.addEventListener('close', function () {
                dlgFrame.innerHTML = '';
                if (lastFocus) lastFocus.focus();
            });
        };
        var openShort = function (card, opener) {
            var id = card.getAttribute('data-short');
            var watch = 'https://youtube.com/shorts/' + encodeURIComponent(id);
            if (typeof HTMLDialogElement !== 'function') { window.open(watch, '_blank', 'noopener'); return; }
            if (!dlg) buildDialog();
            lastFocus = opener || null;
            var h = card.querySelector('h3, h4');
            dlgTitle.innerHTML = h ? h.innerHTML : '';
            var label = h ? (h.querySelector(root.lang === 'en' ? '.en' : '.ja') || h).textContent : '';
            dlgClose.setAttribute('aria-label', root.lang === 'en' ? 'Close' : '閉じる');
            dlgLink.href = watch;
            var f = document.createElement('iframe');
            f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&playsinline=1';
            f.title = label + (root.lang === 'en' ? ' (video)' : '（動画）');
            f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            f.setAttribute('allowfullscreen', '');
            dlgFrame.appendChild(f);
            dlg.showModal();
            dlgClose.focus();
        };
        shortCards.forEach(function (card) {
            card.classList.add('has-short');
            var btn = card.querySelector('.play-badge');
            if (!btn) {
                btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'play-badge';
                btn.innerHTML = '<i class="fa-solid fa-circle-play" aria-hidden="true"></i> <span class="ja">動画を見る</span><span class="en" lang="en">Watch video</span>';
                card.appendChild(btn);
            }
            card.addEventListener('click', function (e) {
                if (e.target.closest('a')) return;   // カード内のリンクはそのまま開く
                openShort(card, btn);
            });
        });
    }

    /* ---------- About の研究紹介動画 ---------- */
    // <figure data-youtube="動画ID" data-ratio="16:9 または 9:16">。最初はサムネイルだけを表示し、
    // クリックしたときに YouTube の再生画面を読み込む（ページの表示を軽くするため）
    document.querySelectorAll('figure[data-youtube]').forEach(function (fig) {
        var id = (fig.getAttribute('data-youtube') || '').trim();
        var wrap = fig.closest('.about-intro');
        if (!id) {
            fig.hidden = true;
            if (wrap) wrap.classList.add('no-video');
            return;
        }
        var portrait = fig.getAttribute('data-ratio') === '9:16';
        fig.classList.toggle('is-portrait', portrait);
        if (wrap) wrap.classList.toggle('is-portrait', portrait);
        var vid = encodeURIComponent(id);
        var watch = portrait ? 'https://youtube.com/shorts/' + vid : 'https://www.youtube.com/watch?v=' + vid;
        fig.querySelectorAll('[data-youtube-link]').forEach(function (a) { a.href = watch; });
        var facade = fig.querySelector('.video-facade');
        var img = facade && facade.querySelector('img');
        if (img) {
            // 横長は高画質のサムネイル（無い動画は標準画質）を使う
            var hq = 'https://i.ytimg.com/vi/' + vid + '/hqdefault.jpg';
            img.onload = function () { if (img.naturalWidth <= 120 && img.src !== hq) img.src = hq; };
            img.onerror = function () { if (img.src !== hq) img.src = hq; };
            img.src = portrait ? hq : 'https://i.ytimg.com/vi/' + vid + '/maxresdefault.jpg';
        }
        if (facade) {
            facade.addEventListener('click', function (e) {
                e.preventDefault();
                var f = document.createElement('iframe');
                f.src = 'https://www.youtube-nocookie.com/embed/' + vid + '?autoplay=1&rel=0&playsinline=1';
                f.title = root.lang === 'en' ? 'Research overview video (YouTube)' : '研究紹介動画（YouTube）';
                f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
                f.setAttribute('allowfullscreen', '');
                facade.replaceWith(f);
                f.focus();
            });
        }
    });

    /* ---------- 初期表示 ---------- */
    applyLang(root.lang === 'en' ? 'en' : 'ja');
    updateThemeUI();
})();
