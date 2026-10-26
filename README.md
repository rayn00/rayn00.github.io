# AME LAB 雨宮研究室 Webサイト

東京大学 雨宮研究室（AME LAB）のWebサイトです。GitHub Pages で https://rayn00.github.io/ に公開しています。

## フォルダ構成

```
index.html          トップページ（日英切替・ライト/ダーク切替つき）
research.html       研究紹介
members.html        メンバー（教授のプロフィール・スタッフ・学生・OB/OG）
publications.html   論文・発表一覧（種類で絞り込み・キーワード検索）
news.html           ニュース一覧（種類で絞り込み・キーワード検索）
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

- **SNS共有時の表示（OGP）**：各HTMLファイルの `<head>` にある `og:url` と `og:image` は `https://rayn00.github.io/` に設定済みです。公開URLが変わったら、全ページのこの2行を書き換えてください。
- **独自ドメイン（任意）**：「Settings」→「Pages」→「Custom domain」に設定し、DNS に CNAME レコードを追加します。`404.html` の `SITE_ROOT` は、ユーザーサイト（`rayn00.github.io`）用に `'/'` に設定済みです。

## 更新のしかた

GitHub 上でファイルを開き、鉛筆アイコン（Edit）で編集して「Commit changes」を押すと、数分で公開ページに反映されます。

### デザイン・動きとヘッダー・フッター（全ページ共通）

- 色・文字・レイアウトは `assets/css/style.css`、メニューや日英・配色の切替などの動きは `assets/js/main.js` に、トップページも含めて全ページ共通でまとめています。ここを1か所直せば全ページに反映されます。
- ヘッダー（メニュー）とフッターは各HTMLファイルに書いてあるため、項目を増やすときは全ページ（`index.html`・`research.html`・`members.html`・`publications.html`・`news.html`・`faq.html`）で同じように書き換えてください。トップページだけ、メニューのリンク先がページ内（`#about` など）になっています。

### メールアドレス（迷惑メール対策）

アドレス収集ロボットに読まれないよう、HTML にはメールアドレスをそのまま書いていません。

- 画面には `info [at] vr.u-tokyo.ac.jp` と表示し、リンクの `data-mail` にアドレスを Base64 という形式に変換して入れています。
- マウスを乗せる・タップする・キーボードで選ぶ・クリックする、のいずれかをしたときに初めて、`assets/js/main.js` がメールのリンクを組み立てます。クリックするとメールソフトが開きます。
- メールのリンクを増やすときは、既存の `<a … data-mail="aW5mb0B2ci51LXRva3lvLmFjLmpw">info [at] vr.u-tokyo.ac.jp</a>` をコピーしてください。
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

### ニュースを追加する（news.html）

該当する年の `<ul class="news-list">` の先頭に、`<li class="news-card" data-type="…">` 〜 `</li>` を1件分コピーして書き換えます。`data-type` は `award`（受賞）・`conf`（学会発表）・`pub`（掲載・出版）・`event`（イベント）・`info`（お知らせ）のいずれかです。種類ラベルの色は、award が `badge-blue`、conf が `badge-purple`、pub が `badge-cyan`、event と info が `badge-gray` です。トップページのニュース欄（最新6件）は `index.html` を書き換えてください。

### ニュース欄のショート動画を差し替える（index.html）

トップページのニュース欄の右（スマホでは下）に、YouTube のショート動画を縦長で表示しています。別の動画にするときは、`index.html` の「ショート動画」のコメントの下にある動画ID（`https://youtube.com/shorts/` の後ろの部分、現在は `-jkH-vsxufw`）を、埋め込み用の `src` とリンクの `href` の2か所で書き換えてください。動画の説明文は `figcaption` の中を書き換えます。

- プライバシー強化モード（`youtube-nocookie.com`）で埋め込んでいます。
- ページを開いた時点では読み込まず、ニュース欄の近くまでスクロールしたときに読み込みます。
- 投稿者が「埋め込みを許可」をオフにしている動画は再生できません。

### 配属・連携案内のタブ（index.html）

トップページの「配属希望者・企業連携案内」は、「進学を希望する方」と「企業・研究機関の方」の2つのタブで切り替わります。`index.html#industry` のように、タブの中身の ID（`students` または `industry`）を付けたURLで開くと、そのタブが表示されます。

### 共同研究・産学連携を更新する（collaboration.html）

- **主な共同研究と成果**：`<article class="collab-project" id="…">` 〜 `</article>` が1件分です。成果は、その中の `<li class="collab-output">` 〜 `</li>` を1件分コピーして書き換えます。DOI などのリンクは論文・発表一覧と同じ書き方です。
- **共同研究実績**：`<ul class="partner-chips">` の中に1社1行で並んでいます。詳しい紹介があるところは `<a class="partner-chip has-detail" href="#ID">`、無いところは `<span class="partner-chip">` です。トップページの「企業・研究機関の方」タブにも同じ一覧があるので、両方を書き換えてください（トップページ側のリンク先は `collaboration.html#ID`）。
- トップページのタブにあるカード（4件）は、`index.html` の `collab-card` を書き換えます。

### 研究紹介のカードに図・写真を入れる（research.html）

研究紹介ページのすべてのカードの上部に、同じ大きさ（横長 16:9）の図・写真の枠があります。`img/research/` フォルダに決められたファイル名で JPG 画像を入れると表示され、画像が無いカードにはアイコン入りの背景が表示されます。ファイル名の一覧と画像の推奨サイズは `img/research/README.md` を見てください。

- 16:9 からはみ出す部分は切り取られます。グラフや模式図など全体を見せたいものは、該当カードの `<figure class="card-media" data-media>` を `<figure class="card-media fit-contain" data-media>` にします（余白は白）。
- 動画（`data-short`）があるカードは、画像の右下に再生マークが付きます。
- ページ下部の「これまでの研究」（`<section id="past">`）のカードも同じ仕組みです。カードを追加するときは、`<article class="card theme-card past-card">` 〜 `</article>` を1件分コピーし、期間（`past-period`）・見出し・説明・論文リンクと画像ファイル名を書き換えます。

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

### よくある質問を更新する（faq.html）

- **募集のお知らせ**：ページ上部の「募集のお知らせ」のコメントの下にある見出し（現在は「2027年度入学希望者を受け入れています」）と箇条書きを、年度が変わったら書き換えてください。
- **質問を追加する**：該当するカテゴリの `<div class="faq-list">` の中に、既存の `<details class="faq-item" id="…">` 〜 `</details>` を1件分コピーし、`id`（半角英数字とハイフン、ページ内で重複しないもの）と質問・回答を書き換えます。全体の件数とカテゴリ横の件数は自動で数えます。
- `faq.html#q-apply` のように `#質問のid` を付けたURLを開くと、その質問が開いた状態で表示されます。メールで質問に答えるときなどに使えます。
- このページ専用のデザインと動きは、`faq.html` の中の `<style>` と `<script>` に書いてあります。

### 種類を指定してページを開く

`publications.html#journal` や `news.html#award` のように `#種類` を付けると、その種類で絞り込んだ状態で開きます。

### ページを Google サイトに埋め込む場合

Google サイトの制約で、埋め込んだページの中のメールのリンクは自動で新しいタブで開きます。ページ間のリンクは埋め込み枠の中で移動します。
