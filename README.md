# AME LAB 雨宮研究室 Webサイト

東京大学 雨宮研究室（AME LAB）のWebサイトです。GitHub Pages で公開し、独自ドメイン https://www.amelab.vr.u-tokyo.ac.jp/ を設定しています（https://rayn00.github.io/ にアクセスした場合も、自動でこちらに転送されます）。

## フォルダ構成

```
index.html          トップページ（日英切替・ライト/ダーク切替つき）
research.html       研究紹介
members.html        メンバー（教授のプロフィール・スタッフ・学生・Alumni）
publications.html   論文・発表一覧（種類で絞り込み・キーワード検索）
news.html           ニュース一覧（種類で絞り込み・キーワード検索）
about.html          研究室について（あゆみ・メンバー募集・寄附・取材のご依頼）
faq.html            よくある質問（進学を希望する方へ。開閉式・キーワード検索）
collaboration.html  共同研究・産学連携（主な共同研究と成果、共同研究実績）
404.html            ページが見つからないときの表示
.nojekyll           GitHub Pages の加工処理（Jekyll）を止める空ファイル
assets/
  css/style.css     全ページ共通のデザイン
  js/main.js        全ページ共通の動き（メニュー、日英・配色切替、絞り込み・検索など）
img/
  amelab-mark.png   ヘッダーのロゴマーク
  amelab-logo.png   フッターのロゴ
  favicon.png       ブラウザのタブ用アイコン
  apple-touch-icon.png  スマホのホーム画面用アイコン
  ogp.png           SNSで共有したときの画像（1200×630）
  members/          メンバーの顔写真（伊藤・佐久間の2名は仮の画像）
  research/         研究紹介ページのカード画像（ファイル名は research/README.md）
```

## 公開手順

1. GitHub で新しいリポジトリを作る（公開設定は Public）。
2. 「Add file」→「Upload files」で、このフォルダの中身をすべてアップロードして「Commit changes」。
   - `.nojekyll` は隠しファイルのため、Finder やエクスプローラーで見えないことがあります。アップロードされなかった場合は「Add file」→「Create new file」で、名前を `.nojekyll`、中身を空にして作成してください。
3. リポジトリの「Settings」→「Pages」で、Source を「Deploy from a branch」、Branch を「main」「/ (root)」にして「Save」。
4. 数分後に `https://ユーザー名.github.io/リポジトリ名/` で公開されます。

## 顔写真の差し替え

`img/members/` の同じ名前のファイルを、本物の写真で上書きしてください。

- 形式：JPG、正方形（400×400px 程度）を推奨
- 円形に切り抜いて表示します。縦長の写真は上寄りに切り抜くので、顔が上の方にあっても切れにくくなっています
- ファイルが無い・読み込めない場合は、名字の1文字目（教授はアイコン）が表示されます

| 氏名 | ファイル名 |
| --- | --- |
| 雨宮 智浩 | amemiya-tomohiro.jpg |
| 青山 一真 | aoyama-kazuma.jpg |
| 牛山 奎悟 | ushiyama-keigo.jpg |
| 小柳 陽光 | oyanagi-akimi.jpg |
| 伊藤 充 | ito-mitsuru.jpg |
| 栗田 祐輔 | kurita-yusuke.jpg |
| 佐久間 明日香 | sakuma-asuka.jpg |
| 渡部 理久 | watanabe-riku.jpg |
| 何 毅 | izu-takeshi.jpg |
| 川島 悠輔 | kawashima-yusuke.jpg |
| 佐々尾 月陽 | sasao-tsukihi.jpg |
| 志貴 健太 | shiki-kenta.jpg |
| 長谷川 雄飛 | hasegawa-yuhi.jpg |
| 渡邉 政紀 | watanabe-masatoshi.jpg |
| 佐藤 遼一 | sato-ryoichi.jpg |
| 深谷 太聖 | fukaya-taisei.jpg |
| 塚田 昌孝 | tsukada-masataka.jpg |
| 三上 日向汰 | mikami-hinata.jpg |

メンバーを追加するときは、`<li class="person-chip">` を1人分コピーして名前と画像ファイル名を書き換え、写真を `img/members/` に追加してください。メンバーは `index.html` と `members.html` の両方に載っているので、両方を書き換えます。

個人サイトを持っている人は、ローマ字の名前の下に次の1行を入れるとリンクが表示されます（現在は雨宮・青山・牛山の3名）。無い人は不要です。雨宮の Google Scholar・ORCID・researchmap のリンクは、`index.html` と `members.html` の教授欄（`profile-links`）にあります。

```html
<a class="person-link" href="https://個人サイトのURL/" target="_blank" rel="noopener"><i class="fa-solid fa-globe" aria-hidden="true"></i> <span class="ja">個人サイト</span><span class="en" lang="en">Website</span></a>
```

## 公開後に設定すること

- **SNS共有時の表示（OGP）**：各HTMLファイルの `<head>` にある `og:url` と `og:image` は `https://www.amelab.vr.u-tokyo.ac.jp/` に設定済みです。公開URLが変わったら、全ページのこの2行を書き換えてください。
- **独自ドメイン**：`www.amelab.vr.u-tokyo.ac.jp` を「Settings」→「Pages」→「Custom domain」に設定済みです（リポジトリ直下の `CNAME` ファイルに書かれています。このファイルは消さないでください）。証明書が発行されたら、同じ画面の「Enforce HTTPS」にチェックを入れてください。`404.html` の `SITE_ROOT` は `'/'` に設定済みです。
- **旧サイト**：以前のサイト（Google サイト）は https://wwwold.amelab.vr.u-tokyo.ac.jp/ に残しています。以前のURL（例：`/about-us`、`/openlab2026`）で来た人には、`404.html` が新しいサイトの対応するページへ自動で移動させます（対応表は `404.html` の `MOVED`）。対応するページが無いURLや、旧サイトの記事の見出し（`#h.…`）へのリンクのときは、「旧サイトの同じページを開く」ボタンを表示します。

## 更新のしかた

GitHub 上でファイルを開き、鉛筆アイコン（Edit）で編集して「Commit changes」を押すと、数分で公開ページに反映されます。

### デザイン・動きとヘッダー・フッター（全ページ共通）

- 色・文字・レイアウトは `assets/css/style.css`、メニューや日英・配色の切替などの動きは `assets/js/main.js` に、トップページも含めて全ページ共通でまとめています。ここを1か所直せば全ページに反映されます。
- ヘッダー（メニュー）とフッターは各HTMLファイルに書いてあるため、項目を増やすときは全ページ（`index.html`・`research.html`・`members.html`・`publications.html`・`news.html`・`faq.html`）で同じように書き換えてください。トップページだけ、メニューのリンク先がページ内（`#about` など）になっています。

### メールアドレス（迷惑メール対策）

アドレス収集ロボットに読まれないよう、HTML にはメールアドレスをそのまま書いていません。

- 画面には `info [at] amelab.vr.u-tokyo.ac.jp` と表示し、リンクの `data-mail` にアドレスを Base64 という形式に変換して入れています。
- マウスを乗せる・タップする・キーボードで選ぶ・クリックする、のいずれかをしたときに初めて、`assets/js/main.js` がメールのリンクを組み立てます。クリックするとメールソフトが開きます。
- メールのリンクを増やすときは、既存の `<a … data-mail="aW5mb0BhbWVsYWIudnIudS10b2t5by5hYy5qcA=="><span class="mail-addr">info [at] <span class="mail-domain">amelab.vr.u-tokyo.ac.jp</span></span></a>` をコピーしてください（`mail-addr`・`mail-domain` は、狭い画面でアドレスの途中のハイフンで折り返さず「[at]」の後で折り返すための指定です）。
- アドレスを変えるときは、ブラウザの開発者ツールのコンソールで `btoa('新しいアドレス')` を実行し、表示された文字列を `data-mail` に入れて、画面の表示も書き換えます。

### 論文・発表を追加する（publications.html）

該当する年の `<ol class="pub-list">` の先頭に、既存の `<li class="pub-item" data-type="…">` 〜 `</li>` を1件分コピーして書き換えます。新しい年は `<div class="year-group">` ごとコピーして年を書き換えてください。

| data-type | 種類 |
| --- | --- |
| journal | 学術論文誌 |
| intl | 国際会議 |
| dom | 国内発表・解説記事 |
| talk | 招待講演 |
| award | 受賞 |
| media | メディア掲載 |

DOI がある論文は、`<p class="pub-venue">…</p>` の次の行に、次の1行を入れると DOI のリンクが表示されます（DOI の部分を2か所書き換えます）。DOI が無いもの（国内学会の予稿、招待講演など）は不要です。

```html
<p class="pub-links"><a class="pub-doi" href="https://doi.org/10.xxxx/xxxxx" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> DOI: 10.xxxx/xxxxx</a></p>
```

絞り込みタブの件数は自動で数えます。トップページの「主要論文・学会発表」に載せたい場合は、`index.html` にも追加してください。

トップページの「主要論文・学会発表」にある件数（論文・発表／学術論文誌／国際会議／受賞）も、`publications.html` の一覧から自動で数え直します（`index.html` の `.pub-stat` の `data-types` に、数える種類を空白区切りで書きます。「論文・発表」は `journal intl dom talk` の合計です）。`index.html` に書いてある数字は、一覧を読み込めなかったとき（ファイルを直接開いたときなど）の予備なので、ときどき実際の件数に合わせておくと安心です。

### 進学希望者向けの募集のお知らせ（index.html と faq.html）

募集年度（例：「2027年度入学希望者を受け入れています」）は、トップページの「配属・連携案内」→「進学を希望する方」の `admit-box` と、faq.html の「募集のお知らせ」の2か所に書いています。年度が変わったら、両方を書き換えてください。

### よくある質問のキャンパス写真（faq.html）

「募集のお知らせ」の横に、本郷キャンパスのいちょう並木の写真（`img/campus/`）を表示しています。安田講堂の写真は about.html の「取材・講演・執筆のご依頼」の右側にあります。差し替えるときは img/campus/README.md を見てください。写真の位置情報は消してから置いてください。

### 研究室について（about.html）

研究室のあゆみ、メンバー募集（大学院生・学生インターン・研究員・企業の方）、東京大学基金でのご寄附、取材・講演のご依頼をまとめたページです。旧サイトの「About us」に当たり、旧サイトの `/about-us` で来た人はこのページに移動します。

- **あゆみの写真**：`img/about/` に `history-2019.jpg`・`history-2020.jpg`・`history-2023.jpg`・`history-2026.jpg`（現在の研究室）を置くと、各時期の横に表示されます（横幅 480px）（無い時期は文章だけ。詳しくは img/about/README.md）。
- **寄附の指定欄に入れる文**：「コピー」ボタンでコピーできます。文を変えるときは、`<code>` の中と、ボタンの `data-copy` の2か所を書き換えてください。

### ニュースを追加する（news.html）

冒頭の日付は**掲載日**（ニュースを載せた日）です。学会やイベントの開催日は、文の中に書いてください（例：「UIST 2026（11月2日〜5日、米国デトロイト）の…」）。

該当する年の `<ul class="news-list">` の先頭に、`<li class="news-card" data-type="…">` 〜 `</li>` を1件分コピーして書き換えます。`data-type` は `award`（受賞）・`conf`（学会発表）・`pub`（掲載・出版）・`event`（イベント）・`info`（お知らせ）のいずれかです。種類ラベルの色は、award が `badge-blue`、conf が `badge-purple`、pub が `badge-cyan`、event と info が `badge-gray` です。トップページのニュース欄（最新8件）は `index.html` を書き換えてください。日本語の文はニュース一覧と同じ文にし、文末に句点（。）は付けません（英語の文はピリオドで終えます）。

### ニュース欄のショート動画を差し替える（index.html）

トップページのニュース欄の右（スマホでは下）に、YouTube のショート動画を縦長で表示しています。別の動画にするときは、`index.html` の「ショート動画」のコメントの下にある動画ID（`https://youtube.com/shorts/` の後ろの部分、現在は `-jkH-vsxufw`）を、埋め込み用の `src` とリンクの `href` の2か所で書き換えてください。動画の説明文は `figcaption` の中を書き換えます。

- プライバシー強化モード（`youtube-nocookie.com`）で埋め込んでいます。
- ページを開いた時点では読み込まず、ニュース欄の近くまでスクロールしたときに読み込みます。
- 投稿者が「埋め込みを許可」をオフにしている動画は再生できません。

### 配属・連携案内のタブ（index.html）

トップページの「配属希望者・企業連携案内」は、「進学を希望する方」と「企業・研究機関の方」の2つのタブで切り替わります。`index.html#industry` のように、タブの中身の ID（`students` または `industry`）を付けたURLで開くと、そのタブが表示されます。

### ニュースに詳しい記事（ポップアップ）を付ける（news.html）

受賞などの一部のニュースには、一覧の項目をクリックするとポップアップで開く詳しい記事を付けられます。記事は news.html の中（`<div class="news-articles" hidden>` の中）にまとめて書きます。

1. `<div class="news-articles" hidden>` の中の `<article class="news-article" id="article-…">` 〜 `</article>` を1件分コピーし、`id`（`article-` で始まる重ならない名前）、日付、見出し、本文、賞・受賞者などの表（`<dl>`）、関連リンクを書き換えます。
2. ニュース一覧の該当する項目の `<li class="news-card" …>` に `data-article="article-…"` を加え、`</p>` の後に「詳しく読む」のリンク `<a href="#article-…" class="news-more">…</a>` を入れます（ほかの記事付きの項目からコピーできます）。
3. トップページ（index.html）の新着ニュースにも同じ項目があるときは、「詳しく読む」のリンクを `href="news.html#article-…"` にして入れると、ニュース一覧のページで記事が開きます。
4. 写真は `img/news/記事のid（article- を除いた部分）.jpg` に置くと記事の上部に表示されます。無いときは写真の枠は表示されません（詳しくは img/news/README.md）。

`news.html#article-…` のURLを共有すると、記事を開いた状態のページを直接見てもらえます。

大学のお知らせなど、外部のページに記事があるときは、ポップアップの代わりに外部へのリンクを付けられます。該当する項目の `</p>` の後に、
`<a href="外部のURL" class="news-more is-external" target="_blank" rel="noopener">…記事を読む…</a>` を入れてください（既存の項目からコピーできます）。項目のどこをクリックしてもそのページが新しいタブで開きます。トップページにも同じ項目があるときは、両方に入れてください。

### 共同研究・産学連携を更新する（collaboration.html）

- **主な共同研究と成果**：`<article class="collab-project" id="…">` 〜 `</article>` が1件分です。成果は、その中の `<li class="collab-output">` 〜 `</li>` を1件分コピーして書き換えます。DOI などのリンクは論文・発表一覧と同じ書き方です。
- **共同研究実績**：`<ul class="partner-chips">` の中に1社1行で並んでいます。詳しい紹介があるところは `<a class="partner-chip has-detail" href="#ID">`、無いところは `<span class="partner-chip">` です。トップページの「企業・研究機関の方」タブにも同じ一覧があるので、両方を書き換えてください（トップページ側のリンク先は `collaboration.html#ID`）。
- トップページのタブにあるカード（4件）は、`index.html` の `collab-card` を書き換えます。

### 研究紹介のカードに図・写真を入れる（research.html）

研究紹介ページのすべてのカードの上部に、同じ大きさ（横長 16:9）の図・写真の枠があります。`img/research/` フォルダに決められたファイル名で JPG 画像を入れると表示され、画像が無いカードにはアイコン入りの背景が表示されます。ファイル名の一覧と画像の推奨サイズは `img/research/README.md` を見てください。

- 16:9 からはみ出す部分は切り取られます。グラフや模式図など全体を見せたいものは、該当カードの `<figure class="card-media" data-media>` を `<figure class="card-media fit-contain" data-media>` にします（余白は白）。
- 動画（`data-short`）があるカードは、画像の右下に再生マークが付きます。
- ページ下部の「これまでの研究」（`<section id="past">`）のカードも同じ仕組みです。カードを追加するときは、`<article class="card theme-card past-card">` 〜 `</article>` を1件分コピーし、期間（`past-period`）・見出し・説明・論文リンクと画像ファイル名を書き換えます。カードは期間の新しい順に並べています。「身体感覚・錯覚・五感インタフェース」は、牽引力錯覚（ぶるなび）のまとまり（`<div class="past-series" id="past-pulling">`）と、そのほかの研究（`id="past-sensation-other"`）の2つに分けています。

### 研究のつながり（ネットワーク図・research.html）

研究紹介ページの上部に、研究とキーワードのつながりを表すネットワーク図があります（D3.js で描画。図の近くまでスクロールしたときに読み込みます）。図は研究カードから自動で作られるので、次の2か所を書き換えるだけで更新できます。

- **研究カードの点**：各カードの `<article … id="card-…" data-topics="…">` が1つの点になります。`data-topics` にはつながるキーワードの ID を半角スペース区切りで書きます（例：`data-topics="pseudo-haptics multisensory"`）。新しいカードを図に出すときは、重ならない `id` と `data-topics` を付けてください。付けないカードは図に出ません。
- **キーワード**：research.html の `<script type="application/json" id="networkData">` の `topics` に、ID・日本語名・英語名・説明があります。キーワードを増やすときはここに1件追加します。

使えるキーワードの ID：`illusion`（錯覚）、`pseudo-force`（擬似力覚）、`pseudo-haptics`、`tendon`（腱刺激・運動錯覚）、`locomotion`（移動感覚・歩行）、`vestibular`（前庭感覚）、`multisensory`（多感覚・五感）、`navigation`（歩行支援・ナビゲーション）、`avatar`（アバタ・身体性）、`remote`（遠隔・テレプレゼンス）、`education`（講義・学習支援）、`training`（VR訓練）、`collaboration`（共同研究）

### About の研究紹介動画（index.html）

トップページの「About AME LAB」の右（スマホでは下）に、研究紹介動画を表示します。`index.html` の「研究紹介動画」のコメントの下にある `<figure class="about-video" data-youtube="" data-ratio="16:9">` の `data-youtube` に、YouTube の動画IDを入れてください（動画IDの調べ方は下の「研究テーマのショート動画」と同じです）。

- `data-youtube` が空のあいだは動画欄を表示せず、見出しは中央そろえのままになります。
- 横長の動画は `data-ratio="16:9"`、縦長のショート動画は `data-ratio="9:16"` にします。
- 最初はサムネイルだけを表示し、再生ボタンを押したときに YouTube の再生画面を読み込みます（ページの表示を軽くするため）。「YouTubeで見る」のリンク先も自動で設定されます。

### 研究テーマのショート動画（index.html・research.html）

研究テーマのカードに `data-short="YouTubeの動画ID"` を付けると、カードに「動画を見る」ボタンが表示され、カードをクリックすると縦長の動画が画面中央に開いて再生されます。閉じるボタン・Esc キー・動画の外側のクリックで閉じ、閉じると再生も止まります。

- 動画IDは `https://youtube.com/shorts/` の後ろの部分です（例：`https://youtube.com/shorts/-jkH-vsxufw` なら `-jkH-vsxufw`）。
- トップページは「研究テーマ」の `<div class="card">` を `<div class="card" data-short="動画ID">` に、研究紹介ページは `<article class="card theme-card">` を `<article class="card theme-card" data-short="動画ID">` にします。
- `data-short` を付けていないカードは、これまでどおりクリックしても何も起きません。
- 動画は原則として1枚のカードに1本です（研究ごとにカードを分けています）。どうしても1枚に複数付けたいときは、`data-short="ID1 ID2"` のように半角スペースで区切ります。ボタンが「動画を見る（2本）」になり、ポップアップの矢印（またはキーボードの ← →）で切り替えられます。
- `data-short-titles="動画1の題名|動画2の題名"` を付けると、ポップアップの見出しの下に各動画の題名が出ます（`|` で区切り、`data-short` と同じ順番）。

### よくある質問を更新する（faq.html）

- **募集のお知らせ**：ページ上部の「募集のお知らせ」のコメントの下にある見出し（現在は「2027年度入学希望者を受け入れています」）と箇条書きを、年度が変わったら書き換えてください。
- **質問を追加する**：該当するカテゴリの `<div class="faq-list">` の中に、既存の `<details class="faq-item" id="…">` 〜 `</details>` を1件分コピーし、`id`（半角英数字とハイフン、ページ内で重複しないもの）と質問・回答を書き換えます。全体の件数とカテゴリ横の件数は自動で数えます。
- `faq.html#q-apply` のように `#質問のid` を付けたURLを開くと、その質問が開いた状態で表示されます。メールで質問に答えるときなどに使えます。
- このページ専用のデザインと動きは、`faq.html` の中の `<style>` と `<script>` に書いてあります。

### 種類を指定してページを開く

`publications.html#journal` や `news.html#award` のように `#種類` を付けると、その種類で絞り込んだ状態で開きます。

### ページを Google サイトに埋め込む場合

Google サイトの制約で、埋め込んだページの中のメールのリンクは自動で新しいタブで開きます。ページ間のリンクは埋め込み枠の中で移動します。
