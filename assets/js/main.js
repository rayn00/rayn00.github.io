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
    // カードに data-short="YouTubeの動画ID" を付けると、カードのクリックで縦長の動画をポップアップ再生する。
    // 動画が複数あるときは data-short="ID1 ID2" のように空白で区切る（ポップアップ内の矢印で切り替え）。
    // data-short-titles="題名1|題名2" を付けると、ポップアップに各動画の題名を表示する
    var shortCards = Array.prototype.slice.call(document.querySelectorAll('[data-short]'));
    if (shortCards.length) {
        var dlg = null, dlgFrame, dlgTitle, dlgSub, dlgNav, dlgPrev, dlgNext, dlgCount, dlgLink, dlgClose, lastFocus = null;
        var cur = { ids: [], titles: [], i: 0, label: '' };
        var shortIds = function (card) {
            return (card.getAttribute('data-short') || '').trim().split(/\s+/).filter(Boolean);
        };
        var show = function (i) {
            var en = root.lang === 'en';
            var n = cur.ids.length;
            cur.i = ((i % n) + n) % n;   // 最後の次は最初に戻る
            var id = cur.ids[cur.i], multi = cur.ids.length > 1;
            var sub = (cur.titles[cur.i] || '').trim();
            dlgSub.textContent = sub;
            dlgSub.hidden = !sub;
            dlg.classList.toggle('has-sub', !!sub);
            dlgNav.hidden = !multi;
            dlgCount.textContent = (cur.i + 1) + ' / ' + cur.ids.length;
            dlgLink.href = 'https://youtube.com/shorts/' + encodeURIComponent(id);
            dlgFrame.innerHTML = '';
            var f = document.createElement('iframe');
            f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&playsinline=1';
            f.title = (sub || cur.label) + (en ? ' (video)' : '（動画）');
            f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            f.setAttribute('allowfullscreen', '');
            dlgFrame.appendChild(f);
        };
        var buildDialog = function () {
            dlg = document.createElement('dialog');
            dlg.className = 'short-dialog';
            dlg.setAttribute('aria-labelledby', 'shortDialogTitle');
            dlg.innerHTML = '<div class="short-dialog-inner">' +
                '<div class="short-dialog-head"><p class="short-dialog-title" id="shortDialogTitle"></p>' +
                '<button type="button" class="short-dialog-close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>' +
                '<p class="short-dialog-sub" lang="en" hidden></p>' +
                '<div class="short-frame"></div>' +
                '<div class="short-dialog-nav" hidden>' +
                '<button type="button" class="short-nav-btn" data-step="-1"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>' +
                '<span class="short-nav-count" aria-live="polite"></span>' +
                '<button type="button" class="short-nav-btn" data-step="1"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></div>' +
                '<p class="short-dialog-foot"><a target="_blank" rel="noopener"><i class="fa-brands fa-youtube" aria-hidden="true"></i> ' +
                '<span class="ja">YouTubeで見る</span><span class="en" lang="en">Watch on YouTube</span></a></p></div>';
            document.body.appendChild(dlg);
            dlgFrame = dlg.querySelector('.short-frame');
            dlgTitle = dlg.querySelector('.short-dialog-title');
            dlgSub = dlg.querySelector('.short-dialog-sub');
            dlgNav = dlg.querySelector('.short-dialog-nav');
            dlgPrev = dlgNav.querySelector('[data-step="-1"]');
            dlgNext = dlgNav.querySelector('[data-step="1"]');
            dlgCount = dlgNav.querySelector('.short-nav-count');
            dlgLink = dlg.querySelector('.short-dialog-foot a');
            dlgClose = dlg.querySelector('.short-dialog-close');
            dlgClose.addEventListener('click', function () { dlg.close(); });
            [dlgPrev, dlgNext].forEach(function (b) {
                b.addEventListener('click', function () { show(cur.i + Number(b.getAttribute('data-step'))); });
            });
            // 左右の矢印キーでも前後の動画に切り替える
            dlg.addEventListener('keydown', function (e) {
                if (cur.ids.length < 2) return;
                if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur.i - 1); }
                if (e.key === 'ArrowRight') { e.preventDefault(); show(cur.i + 1); }
            });
            // 動画の外側（背景）をクリックしたら閉じる
            dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
            // 閉じたら動画を止める
            dlg.addEventListener('close', function () {
                dlgFrame.innerHTML = '';
                if (lastFocus) lastFocus.focus();
            });
        };
        var openShort = function (card, opener) {
            var ids = shortIds(card);
            if (!ids.length) return;
            if (typeof HTMLDialogElement !== 'function') {
                window.open('https://youtube.com/shorts/' + encodeURIComponent(ids[0]), '_blank', 'noopener');
                return;
            }
            if (!dlg) buildDialog();
            var en = root.lang === 'en';
            lastFocus = opener || null;
            var h = card.querySelector('h3, h4');
            dlgTitle.innerHTML = h ? h.innerHTML : '';
            cur.label = h ? (h.querySelector(en ? '.en' : '.ja') || h).textContent : '';
            cur.ids = ids;
            cur.titles = (card.getAttribute('data-short-titles') || '').split('|');
            dlgClose.setAttribute('aria-label', en ? 'Close' : '閉じる');
            dlgPrev.setAttribute('aria-label', en ? 'Previous video' : '前の動画');
            dlgNext.setAttribute('aria-label', en ? 'Next video' : '次の動画');
            dlg.classList.toggle('is-multi', ids.length > 1);
            show(0);
            dlg.showModal();
            dlgClose.focus();
        };
        shortCards.forEach(function (card) {
            card.classList.add('has-short');
            var n = shortIds(card).length;
            var btn = card.querySelector('.play-badge');
            if (!btn) {
                btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'play-badge';
                btn.innerHTML = '<i class="fa-solid fa-circle-play" aria-hidden="true"></i> ' + (n > 1
                    ? '<span class="ja">動画を見る（' + n + '本）</span><span class="en" lang="en">Watch videos (' + n + ')</span>'
                    : '<span class="ja">動画を見る</span><span class="en" lang="en">Watch video</span>');
                card.appendChild(btn);
            }
            card.addEventListener('click', function (e) {
                if (e.target.closest('a')) return;   // カード内のリンクはそのまま開く
                openShort(card, btn);
            });
        });
    }

    /* ---------- 研究のショート動画をランダムに1本ずつ紹介（research.html の data-shorts） ---------- */
    // 動画の一覧は <script type="application/json" id="shortsData">。最初は動画の画像だけを表示し、
    // 「再生する」を押したときに YouTube の再生画面を読み込む。一度再生したあとは、次・前の動画もそのまま再生する
    var shortsBox = document.querySelector('[data-shorts]');
    var shortsDataEl = document.getElementById('shortsData');
    if (shortsBox && shortsDataEl) (function () {
        var videos;
        try { videos = JSON.parse(shortsDataEl.textContent); } catch (e) { return; }
        if (!videos || !videos.length) return;
        var q = function (sel) { return shortsBox.querySelector(sel); };
        var section = shortsBox.closest('section') || document;
        var cover = q('.shorts-cover'), poster = q('.shorts-poster'), stage = q('.shorts-video');
        var elNo = q('.shorts-no'), elTitle = q('.shorts-title'), elCite = q('.shorts-citation');
        var related = q('.shorts-related'), relatedLink = related.querySelector('a'), relatedLabel = q('.shorts-related-label');
        var btnNext = q('.shorts-next'), btnPrev = q('.shorts-prev');
        var lnkPaper = q('.shorts-paper'), lnkYT = q('.shorts-youtube'), btnList = q('.shorts-open-list');
        var catalog = section.querySelector('.shorts-catalog');
        var listEl = catalog.querySelector('.shorts-catalog-list'), countEl = catalog.querySelector('.shorts-catalog-count');
        var search = catalog.querySelector('input[type="search"]');
        var pad = function (n) { return (n < 10 ? '0' : '') + n; };
        var closeCatalog = function () { if (typeof catalog.close === 'function') catalog.close(); else catalog.removeAttribute('open'); };

        // 各動画に関係する研究カード（同じ DOI の論文リンクを持つカード → 同じ動画を付けたカード の順に探す）
        var cards = Array.prototype.slice.call(document.querySelectorAll('.theme-card[id]'));
        videos.forEach(function (v, i) {
            v.no = i + 1;
            var doi = (v.doi || '').toLowerCase();
            v.card = cards.filter(function (c) {
                return doi && Array.prototype.some.call(c.querySelectorAll('a[href*="doi.org/"]'), function (a) {
                    return a.getAttribute('href').toLowerCase().indexOf('doi.org/' + doi) !== -1;
                });
            })[0] || cards.filter(function (c) {
                return (' ' + (c.getAttribute('data-short') || '') + ' ').indexOf(' ' + v.id + ' ') !== -1;
            })[0] || null;
            var h = v.card && v.card.querySelector('h3, h4');
            v.heading = h ? h.innerHTML : '';
            v.search = (v.title + ' ' + (v.citation || '') + ' ' + (h ? h.textContent : '')).toLowerCase();
        });

        var bag = [], hist = [], pos = -1, cur = null, playing = false;
        var shuffled = function () {
            var a = videos.map(function (v) { return v.id; });
            for (var i = a.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
            }
            // 直前と同じ動画が続かないようにする
            if (cur && a.length > 1 && a[a.length - 1] === cur.id) { var t2 = a[0]; a[0] = a[a.length - 1]; a[a.length - 1] = t2; }
            return a;
        };
        var byId = function (id) { return videos.filter(function (v) { return v.id === id; })[0]; };
        var loadPlayer = function () {
            var old = stage.querySelector('iframe');
            if (old) old.remove();
            var f = document.createElement('iframe');
            f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(cur.id) + '?autoplay=1&rel=0&playsinline=1';
            f.title = cur.title + (root.lang === 'en' ? ' (video)' : '（動画）');
            f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            f.setAttribute('allowfullscreen', '');
            stage.appendChild(f);
            cover.hidden = true;
        };
        var show = function (id) {
            cur = byId(id);
            elNo.textContent = pad(cur.no);
            elTitle.textContent = cur.title;
            elCite.textContent = cur.citation || '';
            lnkPaper.hidden = !cur.doi;
            if (cur.doi) lnkPaper.href = 'https://doi.org/' + cur.doi;
            lnkYT.href = 'https://youtube.com/shorts/' + encodeURIComponent(cur.id);
            related.hidden = !cur.card;
            if (cur.card) { relatedLink.href = '#' + cur.card.id; relatedLabel.innerHTML = cur.heading; }
            btnPrev.disabled = pos <= 0;
            poster.hidden = false;
            poster.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(cur.id) + '/hqdefault.jpg';
            cover.setAttribute('aria-label', (root.lang === 'en' ? 'Play: ' : '再生：') + cur.title);
            if (playing) loadPlayer();
            else {
                var old = stage.querySelector('iframe');
                if (old) old.remove();
                cover.hidden = false;
            }
        };
        var next = function () {
            if (pos < hist.length - 1) { pos++; show(hist[pos]); return; }
            if (!bag.length) bag = shuffled();
            var id = bag.pop();
            hist.push(id); pos = hist.length - 1;
            show(id);
        };
        var choose = function (id) {
            bag = bag.filter(function (x) { return x !== id; });
            hist = hist.slice(0, pos + 1); hist.push(id); pos = hist.length - 1;
            show(id);
        };

        poster.addEventListener('error', function () { poster.hidden = true; });
        cover.addEventListener('click', function () { playing = true; loadPlayer(); });
        btnNext.addEventListener('click', next);
        btnPrev.addEventListener('click', function () { if (pos > 0) { pos--; show(hist[pos]); } });
        // 関係する研究カードへ移動したら、カードを少しのあいだ光らせる
        relatedLink.addEventListener('click', function () {
            var c = cur && cur.card;
            if (!c) return;
            c.classList.remove('is-flash');
            void c.offsetWidth;
            c.classList.add('is-flash');
            setTimeout(function () { c.classList.remove('is-flash'); }, 2400);
        });

        // 動画一覧（検索つき）
        var renderList = function () {
            var term = search.value.trim().toLowerCase();
            var hits = videos.filter(function (v) { return !term || v.search.indexOf(term) !== -1; });
            listEl.innerHTML = '';
            hits.forEach(function (v) {
                var li = document.createElement('li');
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'shorts-item' + (cur && v.id === cur.id ? ' is-current' : '');
                var no = document.createElement('span'); no.className = 'shorts-item-no'; no.textContent = pad(v.no);
                var tx = document.createElement('span'); tx.className = 'shorts-item-text';
                var tt = document.createElement('span'); tt.className = 'shorts-item-title'; tt.lang = 'en'; tt.textContent = v.title;
                tx.appendChild(tt);
                if (v.heading) { var hd = document.createElement('span'); hd.className = 'shorts-item-topic'; hd.innerHTML = v.heading; tx.appendChild(hd); }
                b.appendChild(no); b.appendChild(tx);
                b.addEventListener('click', function () { choose(v.id); closeCatalog(); });
                li.appendChild(b);
                listEl.appendChild(li);
            });
            updateCatalogCount(hits.length);
        };
        var lastHits = videos.length;
        var updateCatalogCount = function (n) {
            if (typeof n === 'number') lastHits = n;
            countEl.textContent = root.lang === 'en'
                ? lastHits + ' / ' + videos.length + ' videos'
                : lastHits + ' / ' + videos.length + '本';
            if (!lastHits) countEl.textContent += root.lang === 'en' ? ' — no matching videos' : '（該当する動画がありません）';
        };
        listCounters.push(function () { updateCatalogCount(); });
        btnList.addEventListener('click', function () {
            renderList();
            if (typeof catalog.showModal === 'function') catalog.showModal(); else catalog.setAttribute('open', '');
        });
        search.addEventListener('input', renderList);
        catalog.querySelector('.shorts-catalog-close').addEventListener('click', closeCatalog);
        catalog.addEventListener('click', function (e) { if (e.target === catalog) closeCatalog(); });

        var fallback = section.querySelector('.shorts-fallback');
        if (fallback) fallback.hidden = true;
        shortsBox.hidden = false;
        next();
    })();

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

    /* ---------- 研究紹介カードの図・写真 ---------- */
    // 画像ファイルが無い・読み込めないときは、アイコン入りの背景を表示する
    document.querySelectorAll('[data-media] img').forEach(function (img) {
        var box = img.closest('[data-media]');
        function ok() { box.classList.add('has-image'); }
        function fail() { box.classList.add('is-empty'); img.remove(); }
        if (img.complete) { if (img.naturalWidth) ok(); else fail(); }
        else { img.addEventListener('load', ok); img.addEventListener('error', fail); }
    });

    /* ---------- 研究のつながり（ネットワーク図・研究紹介ページ） ---------- */
    // <div data-network> が画面に近づいたら D3.js を読み込んで描く。
    // 点は、研究カード（id と data-topics を付けた .theme-card）と、
    // <script type="application/json" id="networkData"> のキーワードから自動で作る
    var netBox = document.querySelector('[data-network]');
    if (netBox && document.getElementById('networkData')) {
        var startNetwork = function () {
            if (window.d3) { buildNetwork(netBox); return; }
            var sc = document.createElement('script');
            sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
            sc.onload = function () {
                try { buildNetwork(netBox); } catch (e) { netBox.classList.add('is-error'); }
            };
            sc.onerror = function () { netBox.classList.add('is-error'); };
            document.head.appendChild(sc);
        };
        if ('IntersectionObserver' in window) {
            var netIO = new IntersectionObserver(function (entries) {
                if (entries.some(function (en) { return en.isIntersecting; })) { netIO.disconnect(); startNetwork(); }
            }, { rootMargin: '400px 0px' });
            netIO.observe(netBox);
        } else {
            startNetwork();
        }
    }

    function buildNetwork(box) {
        var d3 = window.d3;
        var data = JSON.parse(document.getElementById('networkData').textContent);
        var isEn = function () { return root.lang === 'en'; };
        var tx = function (o) { return o ? (isEn() ? o.en : o.ja) : ''; };
        var pair = function (el) {
            if (!el) return { ja: '', en: '' };
            var ja = el.querySelector('.ja'), en = el.querySelector('.en');
            return { ja: (ja || el).textContent.trim(), en: (en || ja || el).textContent.trim() };
        };
        var KIND = {
            core: ['研究室', 'Lab'], domain: ['研究分野', 'Research area'], topic: ['キーワード', 'Keyword'],
            current: ['現在の研究', 'Current research'], past: ['これまでの研究', 'Past research']
        };

        // ---- 点と線
        var nodes = [], links = [], byId = {};
        var addNode = function (n) { nodes.push(n); byId[n.id] = n; return n; };
        var addLink = function (a, b, kind) { if (byId[a] && byId[b]) links.push({ source: a, target: b, kind: kind }); };
        document.querySelectorAll('#themes > .theme-group[id]').forEach(function (grp) {
            addNode({ id: 'd-' + grp.id, kind: 'domain', name: pair(grp.querySelector('.theme-group-head h2, .theme-group-head h3')),
                desc: pair(grp.querySelector('.theme-group-head p')), target: grp });
        });
        data.topics.forEach(function (t) {
            addNode({ id: 't-' + t.id, kind: 'topic', name: { ja: t.ja, en: t.en }, desc: { ja: t.desc_ja, en: t.desc_en }, href: t.href || null });
        });
        document.querySelectorAll('.theme-card[data-topics][id]').forEach(function (card) {
            var grp = card.closest('.theme-group');
            var dom = grp ? grp.id.replace(/^past-/, '') : '';
            var n = addNode({ id: 'r-' + card.id, kind: card.closest('#past') ? 'past' : 'current',
                name: pair(card.querySelector('h3, h4')), desc: pair(card.querySelector('.card-text')), card: card });
            addLink(n.id, 'd-' + dom, 'domain');
            card.getAttribute('data-topics').split(/[\s,]+/).forEach(function (t) { if (t) addLink(n.id, 't-' + t, 'topic'); });
        });
        links.forEach(function (l) {
            byId[l.source].deg = (byId[l.source].deg || 0) + 1;
            byId[l.target].deg = (byId[l.target].deg || 0) + 1;
        });
        nodes.forEach(function (n) {
            n.r = n.kind === 'domain' ? 16 : n.kind === 'topic' ? 7 + Math.min(8, n.deg || 0) : 6;
        });

        // ---- 配置（最初にまとめて計算してから描く）
        // 分野ごとに左右へ寄せる（1つ目の分野は左、2つ目は右）。キーワードはつながる研究の分野の平均の位置へ
        // 縦長の枠（スマホ）では上下に分け、狭い枠では全体を小さめに配置する
        var portrait = box.clientWidth < box.clientHeight * 1.1;
        var sf = Math.max(0.6, Math.min(1, box.clientWidth / 1100));
        var domIds = nodes.filter(function (n) { return n.kind === 'domain'; }).map(function (n) { return n.id; });
        var SPREAD = 340 * sf;
        var domX = {};
        domIds.forEach(function (id, k) { domX[id] = domIds.length > 1 ? -SPREAD + (2 * SPREAD) * k / (domIds.length - 1) : 0; });
        nodes.forEach(function (n) {
            if (n.kind === 'domain') n.tx = domX[n.id];
        });
        links.forEach(function (l) {
            if (l.kind === 'domain') byId[l.source].tx = domX[l.target] * 0.85;
        });
        nodes.forEach(function (n) {
            if (n.kind !== 'topic') return;
            var xs = links.filter(function (l) { return l.target === n.id; }).map(function (l) { return byId[l.source].tx || 0; });
            n.tx = xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : 0;
        });
        nodes.forEach(function (n, k) {   // 初期位置（毎回同じ形になるように）
            var along = n.tx || 0, across = Math.sin(k * 2.4) * 120 * sf;
            n.x = portrait ? across : along + Math.cos(k * 2.4) * 40;
            n.y = portrait ? along + Math.cos(k * 2.4) * 40 : across;
        });
        var sim = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(function (n) { return n.id; })
                .distance(function (l) { return (l.kind === 'domain' ? 170 : 62) * sf; })
                .strength(function (l) { return l.kind === 'domain' ? 0.05 : 0.5; }))
            .force('charge', d3.forceManyBody().strength(function (n) {
                return (n.kind === 'domain' ? -500 : n.kind === 'topic' ? -340 : -130) * sf;
            }))
            .force('collide', d3.forceCollide().radius(function (n) { return n.r + (n.kind === 'topic' ? 16 : 7); }))
            .force('x', portrait
                ? d3.forceX(0).strength(0.09)
                : d3.forceX(function (n) { return n.tx || 0; }).strength(function (n) { return n.kind === 'topic' ? 0.08 : 0.14; }))
            .force('y', portrait
                ? d3.forceY(function (n) { return n.tx || 0; }).strength(function (n) { return n.kind === 'topic' ? 0.08 : 0.14; })
                : d3.forceY(0).strength(0.07))
            .stop();
        for (var i = 0; i < 420; i++) sim.tick();
        nodes.forEach(function (n) { n.x0 = n.x; n.y0 = n.y; });

        var adj = {};
        nodes.forEach(function (n) { adj[n.id] = {}; adj[n.id][n.id] = true; });
        links.forEach(function (l) { adj[l.source.id][l.target.id] = true; adj[l.target.id][l.source.id] = true; });

        // ---- 描画
        box.classList.add('is-ready');
        var svg = d3.select(box).insert('svg', ':first-child').attr('class', 'net-svg');
        var g = svg.append('g');
        var link = g.append('g').selectAll('line').data(links).join('line')
            .attr('class', function (l) { return 'net-link k-' + l.kind; });
        var node = g.append('g').selectAll('g').data(nodes).join('g')
            .attr('class', function (n) { return 'net-node k-' + n.kind; })
            .attr('tabindex', 0).attr('role', 'button');
        node.append('circle').attr('r', function (n) { return n.r; });
        node.append('text').attr('class', 'net-label')
            .attr('text-anchor', function (n) { return n.kind === 'domain' ? 'middle' : 'start'; })
            .attr('x', function (n) { return n.kind === 'domain' ? 0 : n.r + 5; })
            .attr('y', function (n) { return n.kind === 'domain' ? -(n.r + 9) : 0; })
            .attr('dy', function (n) { return n.kind === 'domain' ? 0 : '0.35em'; });
        var position = function () {
            link.attr('x1', function (l) { return l.source.x; }).attr('y1', function (l) { return l.source.y; })
                .attr('x2', function (l) { return l.target.x; }).attr('y2', function (l) { return l.target.y; });
            node.attr('transform', function (n) { return 'translate(' + n.x + ',' + n.y + ')'; });
        };
        var updateText = function () {
            node.select('text').text(function (n) { return tx(n.name); });
            node.attr('aria-label', function (n) { return tx(n.name) + '（' + KIND[n.kind][isEn() ? 1 : 0] + '）'; });
        };
        sim.on('tick', position);
        updateText();
        position();

        // ---- 拡大・縮小・移動（ページのスクロールを邪魔しないよう、ホイールは Ctrl/⌘ 付き、タッチは2本指のときだけ）
        var quick = reduceMotion.matches ? 0 : 500;
        var zoom = d3.zoom().scaleExtent([0.3, 4])
            .filter(function (e) {
                if (e.type === 'wheel') return e.ctrlKey || e.metaKey;
                if (e.type === 'touchstart') return e.touches.length > 1;
                return !e.button;
            })
            .on('zoom', function (e) {
                g.attr('transform', e.transform);
                // 縮小しているときは文字を少し大きくして読みやすくする
                box.style.setProperty('--net-font', e.transform.k < 1 ? Math.pow(e.transform.k, -0.6).toFixed(3) : 1);
            });
        svg.call(zoom).on('dblclick.zoom', null);
        svg.style('touch-action', 'pan-y');
        var fit = function () {
            var b = g.node().getBBox();
            var w = box.clientWidth, h = box.clientHeight, pad = 28;
            if (!b.width || !b.height) return d3.zoomIdentity;
            var k = Math.min((w - pad * 2) / b.width, (h - pad * 2) / b.height, 1.5);
            return d3.zoomIdentity.translate(w / 2 - k * (b.x + b.width / 2), h / 2 - k * (b.y + b.height / 2)).scale(k);
        };
        svg.call(zoom.transform, fit());
        var lastW = box.clientWidth;
        if ('ResizeObserver' in window) {
            new ResizeObserver(function () {
                if (Math.abs(box.clientWidth - lastW) > 40) { lastW = box.clientWidth; svg.call(zoom.transform, fit()); }
            }).observe(box);
        }

        // ---- 点のドラッグ（マウス・ペン・指）。動かした点はその場所に留まる（↺ボタンで元に戻す）
        var moved = false;
        node.call(d3.drag()
            .filter(function (e) {
                if (e.type === 'touchstart') return e.touches.length === 1;
                return !e.button;
            })
            .on('start', function (e, n) { moved = false; n.fx = n.x; n.fy = n.y; })
            .on('drag', function (e, n) {
                if (!moved) {
                    moved = true;
                    sim.alphaTarget(0.25).restart();
                    d3.select(this).classed('is-dragging', true);
                }
                n.fx = e.x; n.fy = e.y;
                n.x = e.x; n.y = e.y;
                position();
            })
            .on('end', function (e, n) {
                sim.alphaTarget(0);
                d3.select(this).classed('is-dragging', false).classed('is-pinned', moved || d3.select(this).classed('is-pinned'));
                if (!moved && !d3.select(this).classed('is-pinned')) { n.fx = null; n.fy = null; }
            }));
        var resetLayout = function () {
            sim.stop();
            nodes.forEach(function (n) { n.fx = null; n.fy = null; n.x = n.x0; n.y = n.y0; n.vx = 0; n.vy = 0; });
            node.classed('is-pinned', false);
            position();
        };

        // ---- 強調表示と説明パネル
        var selected = null;
        var highlight = function (n) {
            box.classList.toggle('has-focus', !!n);
            node.classed('is-on', function (m) { return !!n && !!adj[n.id][m.id]; })
                .classed('is-selected', function (m) { return !!selected && m === selected; });
            link.classed('is-on', function (l) { return !!n && (l.source === n || l.target === n); });
        };
        var panel = document.createElement('div');
        panel.className = 'net-panel';
        panel.hidden = true;
        panel.setAttribute('aria-live', 'polite');
        box.appendChild(panel);
        var el = function (tag, cls, text) { var x = document.createElement(tag); if (cls) x.className = cls; if (text != null) x.textContent = text; return x; };
        var goTo = function (target) {
            target.scrollIntoView({ behavior: quick ? 'smooth' : 'auto', block: 'center' });
            target.classList.add('is-flash');
            setTimeout(function () { target.classList.remove('is-flash'); }, 1800);
        };
        var renderPanel = function () {
            var n = selected;
            panel.innerHTML = '';
            if (!n) { panel.hidden = true; return; }
            var close = el('button', 'net-panel-close');
            close.type = 'button';
            close.setAttribute('aria-label', isEn() ? 'Close' : '閉じる');
            close.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
            close.addEventListener('click', function () { select(null); });
            panel.appendChild(close);
            panel.appendChild(el('span', 'net-badge k-' + n.kind, KIND[n.kind][isEn() ? 1 : 0]));
            panel.appendChild(el('p', 'net-title', tx(n.name)));
            if (tx(n.desc)) panel.appendChild(el('p', 'net-desc', tx(n.desc)));
            var actions = el('div', 'net-actions');
            if (n.card || n.target) {
                var b = el('button', 'chip-link');
                b.type = 'button';
                b.innerHTML = '<i class="fa-solid fa-arrow-down" aria-hidden="true"></i> ';
                b.appendChild(document.createTextNode(n.card ? (isEn() ? 'See the card' : 'カードを見る') : (isEn() ? 'See this area' : 'この分野のカードを見る')));
                b.addEventListener('click', function () { goTo(n.card || n.target); });
                actions.appendChild(b);
            }
            if (n.card && n.card.querySelector('.play-badge')) {
                var vb = el('button', 'chip-link');
                vb.type = 'button';
                vb.innerHTML = '<i class="fa-solid fa-circle-play" aria-hidden="true"></i> ';
                vb.appendChild(document.createTextNode(isEn() ? 'Watch video' : '動画を見る'));
                vb.addEventListener('click', function () { n.card.querySelector('.play-badge').click(); });
                actions.appendChild(vb);
            }
            if (n.card) {
                Array.prototype.slice.call(n.card.querySelectorAll('.theme-links a')).slice(0, 3).forEach(function (a) {
                    actions.appendChild(a.cloneNode(true));
                });
            }
            if (n.href) {
                var a = el('a', 'chip-link');
                a.href = n.href;
                a.innerHTML = '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i> ';
                a.appendChild(document.createTextNode(isEn() ? 'Learn more' : 'くわしく見る'));
                actions.appendChild(a);
            }
            if (actions.children.length) panel.appendChild(actions);
            if (n.kind === 'topic' || n.kind === 'domain') {
                var rel = nodes.filter(function (m) { return m !== n && adj[n.id][m.id]; })
                    .sort(function (a, b) { return (a.kind === 'past') - (b.kind === 'past'); });
                if (rel.length) {
                    panel.appendChild(el('p', 'net-sub', isEn() ? 'Connected' : 'つながっている項目'));
                    var ul = el('ul', 'net-related');
                    rel.forEach(function (m) {
                        var li = el('li');
                        var rb = el('button', m.kind === 'past' ? 'is-past' : '', tx(m.name));
                        rb.type = 'button';
                        rb.addEventListener('click', function () { select(m); });
                        li.appendChild(rb);
                        ul.appendChild(li);
                    });
                    panel.appendChild(ul);
                }
            }
            panel.hidden = false;
        };
        var select = function (n) { selected = n; highlight(n); renderPanel(); };
        node.on('mouseenter', function (e, n) { highlight(n); })
            .on('mouseleave', function () { highlight(selected); })
            .on('focus', function (e, n) { highlight(n); })
            .on('blur', function () { highlight(selected); })
            .on('click', function (e, n) { e.stopPropagation(); select(n); })
            .on('keydown', function (e, n) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n); }
            });
        svg.on('click', function () { select(null); });
        box.addEventListener('keydown', function (e) { if (e.key === 'Escape' && selected) select(null); });

        // ---- 操作ボタン
        document.querySelectorAll('[data-net]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var act = btn.getAttribute('data-net');
                if (act === 'in') svg.transition().duration(quick ? 250 : 0).call(zoom.scaleBy, 1.3);
                else if (act === 'out') svg.transition().duration(quick ? 250 : 0).call(zoom.scaleBy, 1 / 1.3);
                else if (act === 'reset') { select(null); resetLayout(); svg.transition().duration(quick).call(zoom.transform, fit()); }
                else if (act === 'labels') {
                    var on = box.classList.toggle('labels-all');
                    btn.setAttribute('aria-pressed', String(on));
                }
            });
        });

        // ---- 日英切替に合わせて文字を更新
        new MutationObserver(function () { updateText(); renderPanel(); })
            .observe(root, { attributes: true, attributeFilter: ['lang'] });
    }

    /* ---------- ニュースの詳しい記事（ポップアップ） ---------- */
    // ニュースの項目に data-article="記事のid" を付けると、項目のクリックで同じページ内の
    // <article class="news-article" id="記事のid"> をポップアップで表示する（news.html#記事のid でも開く）
    var newsArticles = document.querySelectorAll('.news-article[id]');
    if (newsArticles.length) {
        var adlg = null, aBody, aClose, aLast = null;
        var clearHash = function () {
            if (location.hash.indexOf('#article-') === 0 && window.history && history.replaceState) {
                history.replaceState(null, '', location.pathname + location.search);
            }
        };
        var buildArticleDialog = function () {
            adlg = document.createElement('dialog');
            adlg.className = 'article-dialog';
            adlg.innerHTML = '<div class="article-dialog-inner">' +
                '<button type="button" class="article-dialog-close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>' +
                '<div class="article-dialog-body"></div></div>';
            document.body.appendChild(adlg);
            aBody = adlg.querySelector('.article-dialog-body');
            aClose = adlg.querySelector('.article-dialog-close');
            aClose.addEventListener('click', function () { adlg.close(); });
            adlg.addEventListener('click', function (e) { if (e.target === adlg) adlg.close(); });
            adlg.addEventListener('close', function () {
                aBody.innerHTML = '';
                clearHash();
                if (aLast) aLast.focus();
                aLast = null;
            });
        };
        var openArticle = function (id, opener) {
            var src = document.getElementById(id);
            if (!src || !src.classList.contains('news-article')) return;
            if (typeof HTMLDialogElement !== 'function') {   // ポップアップに対応していないブラウザ
                src.parentNode.hidden = false;
                src.scrollIntoView();
                return;
            }
            if (!adlg) buildArticleDialog();
            aLast = opener || null;
            var art = src.cloneNode(true);
            art.removeAttribute('id');
            var title = art.querySelector('.news-article-title');
            if (title) { title.id = 'articleDialogTitle'; adlg.setAttribute('aria-labelledby', 'articleDialogTitle'); }
            // 写真が無い（読み込めない）ときは、写真の枠ごと表示しない
            art.querySelectorAll('.news-article-photo img').forEach(function (img) {
                img.addEventListener('error', function () { var f = img.closest('figure'); if (f) f.remove(); });
            });
            aBody.innerHTML = '';
            aBody.appendChild(art);
            aClose.setAttribute('aria-label', root.lang === 'en' ? 'Close' : '閉じる');
            if (location.hash !== '#' + id && window.history && history.replaceState) history.replaceState(null, '', '#' + id);
            if (!adlg.open) adlg.showModal();
            aBody.scrollTop = 0;
            aClose.focus();
        };
        document.querySelectorAll('[data-article]').forEach(function (item) {
            item.classList.add('has-article');
            var more = item.querySelector('.news-more');
            item.addEventListener('click', function (e) {
                var a = e.target.closest('a');
                if (a && a !== more) return;   // 項目内のほかのリンクはそのまま開く
                e.preventDefault();
                openArticle(item.getAttribute('data-article'), more || null);
            });
        });
        var articleFromHash = function () {
            var id = decodeURIComponent(location.hash.slice(1));
            if (id.indexOf('article-') === 0) openArticle(id, null);
        };
        articleFromHash();
        window.addEventListener('hashchange', articleFromHash);
    }

    // トップページの新着ニュース：「詳しく読む」がある項目は、項目のどこをクリックしても記事を開く
    document.querySelectorAll('.news-card:not([data-article])').forEach(function (item) {
        var more = item.querySelector('a.news-more');
        if (!more) return;
        item.classList.add('has-article');
        item.addEventListener('click', function (e) {
            if (e.target.closest('a')) return;
            more.click();
        });
    });

    /* ---------- 旧サイトの記事へのリンクで来た人への案内 ---------- */
    // 旧サイト（Google サイト）の見出しへのリンク（例：/news#h.xxxx）は新しいサイトには無いので、旧サイトで開けるようにする
    var OLD_SITE = 'https://wwwold.amelab.vr.u-tokyo.ac.jp';
    if (/^#h\./.test(location.hash)) {
        var oldPath = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
        var bar = document.createElement('div');
        bar.className = 'old-site-bar';
        bar.setAttribute('role', 'status');
        bar.innerHTML = '<span><span class="ja">以前のサイトの記事へのリンクです。</span><span class="en" lang="en">This link points to an article on our previous site.</span></span> ' +
            '<a target="_blank" rel="noopener"><span class="ja">旧サイトで開く</span><span class="en" lang="en">Open on the previous site</span> <i class="fa-solid fa-up-right-from-square" aria-hidden="true"></i></a>' +
            '<button type="button"><i class="fa-solid fa-xmark" aria-hidden="true"></i><span class="sr-only"><span class="ja">閉じる</span><span class="en" lang="en">Close</span></span></button>';
        bar.querySelector('a').href = OLD_SITE + oldPath + location.hash;
        bar.querySelector('button').addEventListener('click', function () { bar.remove(); });
        document.body.appendChild(bar);
    }

    /* ---------- 文字をコピーするボタン（data-copy="コピーする文字"） ---------- */
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
        var label = btn.innerHTML;
        btn.addEventListener('click', function () {
            var text = btn.getAttribute('data-copy');
            var done = function () {
                btn.classList.add('is-done');
                btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> ' + (root.lang === 'en' ? 'Copied' : 'コピーしました');
                setTimeout(function () { btn.classList.remove('is-done'); btn.innerHTML = label; }, 2000);
            };
            var fallback = function () {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); done(); } catch (e) {}
                ta.remove();
            };
            if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
            else fallback();
        });
    });

    /* ---------- 論文・発表の件数（data-pub-stats） ---------- */
    // data-pub-stats に書いたページ（publications.html）の一覧を読み込み、各カードの data-types に
    // 書いた種類の件数を数えて、画面に入ったら 0 から数え上げる。読み込めないとき
    // （ファイルを直接開いたときなど）は HTML に書いてある数字を使う
    document.querySelectorAll('[data-pub-stats]').forEach(function (box) {
        var cards = Array.prototype.slice.call(box.querySelectorAll('[data-types]'));
        var nums = cards.map(function (c) { return c.querySelector('[data-count]'); });
        var fallback = nums.map(function (n) { return parseInt(n.textContent, 10) || 0; });
        var values = null, visible = false, loading = false, played = false;
        var animate = !reduceMotion.matches && 'IntersectionObserver' in window && !!window.requestAnimationFrame;

        function show(v) { nums.forEach(function (n, i) { n.textContent = v[i]; }); }
        function play() {
            if (played || !values || !visible) return;
            played = true;
            if (!animate) { show(values); return; }
            var t0 = null;
            var step = function (t) {
                if (t0 === null) t0 = t;
                var p = Math.min((t - t0) / 1200, 1);
                var e = 1 - Math.pow(1 - p, 3);
                show(values.map(function (v) { return Math.round(v * e); }));
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }
        function finish(v) {
            if (values) return;
            values = v;
            if (!animate) show(values);
            play();
        }
        function load() {
            if (loading) return;
            loading = true;
            var src = box.getAttribute('data-pub-stats');
            if (!src || !window.fetch || !window.DOMParser || location.protocol === 'file:') { finish(fallback); return; }
            setTimeout(function () { finish(fallback); }, 4000); // 応答が遅いときは予備の数字で表示
            fetch(src).then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.text();
            }).then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                var items = Array.prototype.slice.call(doc.querySelectorAll('[data-list] [data-type]'));
                if (!items.length) throw new Error('no items');
                finish(cards.map(function (c) {
                    var types = c.getAttribute('data-types').split(/\s+/);
                    return items.filter(function (it) { return types.indexOf(it.getAttribute('data-type')) !== -1; }).length;
                }));
            })['catch'](function () { finish(fallback); });
        }

        if (!animate) { visible = true; load(); return; }
        show(fallback.map(function () { return 0; }));
        // 近づいたら一覧を読み込み、半分ほど見えたら数え上げる
        new IntersectionObserver(function (entries, io) {
            if (entries[0].isIntersecting) { load(); io.disconnect(); }
        }, { rootMargin: '0px 0px 600px 0px' }).observe(box);
        new IntersectionObserver(function (entries, io) {
            if (entries[0].isIntersecting) { visible = true; play(); io.disconnect(); }
        }, { threshold: 0.5 }).observe(box);
    });

    /* ---------- 写真が無いときは写真の枠を出さない（data-photo-item） ---------- */
    document.querySelectorAll('[data-photo-item] img').forEach(function (img) {
        var item = img.closest('[data-photo-item]');
        var fail = function () { var f = img.closest('figure'); if (f) f.remove(); item.classList.add('no-photo'); };
        if (img.complete) { if (!img.naturalWidth) fail(); }
        else img.addEventListener('error', fail);
    });

    /* ---------- 初期表示 ---------- */
    applyLang(root.lang === 'en' ? 'en' : 'ja');
    updateThemeUI();
})();
