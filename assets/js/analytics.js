/* Google アナリティクス（GA4）によるアクセス解析
   測定IDはここ1か所だけに書く。空にすると計測を止められる。 */
(function () {
    'use strict';

    var GA_ID = 'G-5XYP9WQ4T5';

    // 公開しているサイトだけで計測する。手元でファイルを直接開いたとき（file:）や
    // localhost での確認、プレビュー環境などでは計測しない（数字が汚れないように）
    var host = location.hostname;
    var isPublic = /(^|\.)amelab\.vr\.u-tokyo\.ac\.jp$/.test(host) || /\.github\.io$/.test(host);
    if (!GA_ID || location.protocol === 'file:' || !isPublic) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
})();
