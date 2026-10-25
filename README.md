# AME LAB 雨宮研究室 Webサイト

東京大学 雨宮研究室（AME LAB）のWebサイトです。GitHub Pages でそのまま公開できます。

## フォルダ構成

```
index.html          トップページ（日英切替・ライト/ダーク切替つき）
research.html       研究紹介
members.html        メンバー（教授のプロフィール・スタッフ・学生・OB/OG）
publications.html   論文・発表一覧（種類で絞り込み・キーワード検索）
news.html           ニュース一覧（種類で絞り込み・キーワード検索）
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
  members/          メンバーの顔写真（現在はすべてプレースホルダー）
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

## 公開後に設定すること

- **SNS共有時の表示（OGP）**：各HTMLファイルの `<head>` にある `og:url` と `og:image` の2行を、公開URLに書き換えてからコメントを外してください。
- **独自ドメイン（任意）**：「Settings」→「Pages」→「Custom domain」に設定し、DNS に CNAME レコードを追加します。独自ドメインやユーザーサイト（`ユーザー名.github.io` リポジトリ）で公開する場合は、`404.html` の `SITE_ROOT` を `'/'` にしてください。

## 更新のしかた

GitHub 上でファイルを開き、鉛筆アイコン（Edit）で編集して「Commit changes」を押すと、数分で公開ページに反映されます。

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

絞り込みタブの件数は自動で数えます。トップページの「主要論文・学会発表」に載せたい場合は、`index.html` にも追加してください。

### ニュースを追加する（news.html）

該当する年の `<ul class="news-list">` の先頭に、`<li class="news-card" data-type="…">` 〜 `</li>` を1件分コピーして書き換えます。`data-type` は `award`（受賞）・`conf`（学会発表）・`pub`（掲載・出版）・`event`（イベント）・`info`（お知らせ）のいずれかです。種類ラベルの色は、award が `badge-blue`、conf が `badge-purple`、pub が `badge-cyan`、event と info が `badge-gray` です。トップページのニュース欄（最新6件）は `index.html` を書き換えてください。

### 種類を指定してページを開く

`publications.html#journal` や `news.html#award` のように `#種類` を付けると、その種類で絞り込んだ状態で開きます。

### ページを Google サイトに埋め込む場合

Google サイトの制約で、埋め込んだページの中のメールのリンクは自動で新しいタブで開きます。ページ間のリンクは埋め込み枠の中で移動します。
