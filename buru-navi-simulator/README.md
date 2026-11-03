# Buru-Navi Lab — 非対称振動シミュレーター

ぶるなびの非対称振動の原理を、内部質量の往復運動・筐体への反力・波形で観察するブラウザ教材です。

## できること

- 対称／非対称波形の比較、左右の方向反転
- 非対称性、振動周波数、変位振幅、質量の調整
- おもりの加速度と、それに逆向きの筐体反力の表示
- 変位・速度・反力の同期グラフ、同条件の対称波形の重ね合わせ
- スロー再生、一時停止、位相スライダー、1/48周期のコマ送り
- 左右の反力ピーク、ピーク比、平均反力、正負の力積の表示
- 1周期のCSV出力（SI単位）

スマートフォンではスライダーをタッチ操作できます。バイブレーターや外部機器は駆動しません。実際の牽引感を提示する機能ではなく、原理の視覚的な説明です。

## 研究室サイトへの配置

研究室サイト（AME LAB）のリポジトリ直下に、このフォルダを**`buru-navi-simulator`という名前のまま**置きます。公開URLは次のとおりです。

https://www.amelab.vr.u-tokyo.ac.jp/buru-navi-simulator/

```
（リポジトリ直下）
├─ index.html ほか研究室サイトのファイル
├─ assets/  img/  .nojekyll
├─ view-delay-lab/  pseudo-haptics/
└─ buru-navi-simulator/   ← このフォルダ
```

- ヘッダー・フッター・色・文字は研究室サイト共通の`../assets/css/style.css`と`../assets/js/main.js`を使っています。ライト／ダーク切替・日英切替（ヘッダーとフッターのみ）・アクセス解析（ページ閲覧数）もほかのページと共通です。
- このページ専用の見た目は`style.css`に、研究室サイトの色の変数を使って書いています。機構図は両テーマとも濃紺です。
- 波形グラフの色は`style.css`の`--wv-*`・`--force-*`を`app.js`が読み取るため、テーマに合わせて切り替わります。反力の向きは、右向き＝オレンジ、左向き＝青のままです。
- トップページなどからはリンクしていません。URLを直接案内してください。
- ビルドやnpm installは不要です。デモ本体はHTML・CSS・JavaScript・Canvas 2Dのみで、外部ライブラリに依存しません（ページの文字・アイコンは研究室サイト共通のGoogle Fonts・Font Awesomeを読み込みます）。

## ローカル実行

研究室サイトのリポジトリ直下（`buru-navi-simulator`の1つ上のフォルダ）で実行：

```sh
python3 -m http.server 8000
```

`http://localhost:8000/buru-navi-simulator/` をブラウザで開きます。ES Modulesを使うので `file://` で直接開かずHTTPサーバーを使います。

## 計算モデル

この計算式は、このデモのために定義した教材用の調和波モデルです。特定の論文の数式を採用したものではありません。基本波と第2高調波を合成した変位を微分して速度・加速度を求め、筐体反力を `F = −ma` で計算しています。参考資料は牽引力錯覚の研究背景を示すもので、この式の出典や妥当性を示すものではありません。

θ = 2πft、片振幅A、質量m、非対称性r（0〜0.5）、方向d（±1）とする理想化です。

```text
x = d A [cos θ + (r/4) cos 2θ − r/4]
v = −d A (2πf) [sin θ + (r/2) sin 2θ]
a = −d A (2πf)² [cos θ + r cos 2θ]
F_case = −m a
```

- UIのAはmm、mはg。計算時にSI単位へ換算します。
- 変位の範囲は常に−A〜+A。全ストロークは2Aです。
- 変位の時間平均は−dAr/4ですが、ストロークの中心は0です。
- 速度・加速度・反力の1周期平均は0です。正負の力積がつり合います。
- r=0は対称、r=0.5では反力の強い側と弱い側のピーク比が2:1です。
- 図では筐体を手で固定しているものとします。反力はおもりの加速度と逆向きです。
- 方向反転は全運動・反力の符号反転です。
- スロー再生は表示時刻だけを変更し、物理量の計算には影響しません。
- ピーク・力積は4096点の中点則で数値計算します。
- CSVは1000区間・1001点。最初と最後のサンプルは周期境界です。

グラフの縦軸は設定に応じて変わります。異なる条件間の強度比較には数値を参照してください。機構図の変位・加速度・力は見やすく拡大した模式表示です。実時間表示はディスプレイの更新周期によるエイリアシングを含みます。

この波形は説明用に定義した調和波モデルで、特定のぶるなび実機の計測値や駆動波形ではありません。筐体・手のコンプライアンス、共振、摩擦、アクチュエーターの応答は含めません。牽引方向や知覚強度を予測する心理物理モデルではありません。

## 操作

初期周波数は20 Hzです。

「対称振動」はr=0、「非対称振動」はr=0.5に設定します。その他の物理パラメーターは保持します。位相スライダーを操作すると一時停止します。リセットは位相のみを0に戻します。

Spaceで再生／一時停止（入力部品やボタンにフォーカスがある場合を除く）。タブを非表示にすると停止します。OSで動きを減らす設定を有効にしている場合、初期状態は停止です。値の変更・CSV生成はブラウザ内で完結し、データを送信・保存しません（研究室サイト共通のアクセス解析でページの閲覧数だけを計測します）。

## 確認

Node.js 20以降で、依存インストールなし：

```sh
npm test
```

12項目のテストで周期の閉鎖、変位範囲、解析微分と数値微分の整合、反力の符号、力積の釣り合い、方向反転、単位・スケーリング、再生位相、CSVを確認します。錯覚の強度や実機との一致を検証するテストではありません。

## 参考資料

- [AMELab研究紹介](https://www.amelab.vr.u-tokyo.ac.jp/research.html)
- Tomohiro Amemiya, Hiroaki Gomi. [Distinct Pseudo-Attraction Force Sensation by a Thumb-Sized Vibrator that Oscillates Asymmetrically](https://doi.org/10.1007/978-3-662-44196-1_12). EuroHaptics 2014, LNCS 8619, pp. 88–95, 2014.
- 田辺 健, 雨宮 智浩, 遠藤 博史, 井野 秀一. [非対称振動刺激による牽引力錯覚の研究動向](https://doi.org/10.18974/tvrsj.25.4_291). 日本バーチャルリアリティ学会論文誌, 25(4), pp. 291–301, 2020（総説論文）.
- Takuya Noto, Takuto Nakamura, Tomohiro Amemiya. [Synergistic Illusions: Enhancing Perceptual Effects of Pseudo-Attraction Force by Kinesthetic Illusory Hand Movement](https://doi.org/10.1109/TOH.2024.3386199). IEEE Transactions on Haptics, 17(4), pp. 729–741, 2024.
- Koki Fukuda, Kazuma Aoyama, Hideaki Kuzuoka, Takuji Narumi, Tomohiro Amemiya. [AsymDrive: Fingertip-Free Force Illusions Induced by Asymmetric Vibrations on Dorsal-Palmar Tendons](https://doi.org/10.1109/VR67842.2026.00060). IEEE Conference on Virtual Reality and 3D User Interfaces (VR), 2026.
- Amemiya, Ando & Maeda. [Lead-Me Interface for a Pulling Sensation from Hand-held Devices](https://doi.org/10.1145/1402236.1402239). ACM Transactions on Applied Perception, 2008.

資料は2026年11月3日に確認。模式図と波形はコードで新規描画しています。
