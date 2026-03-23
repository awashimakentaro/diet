appフォルダとはこのアプリの画面(ルーティングの入り口)です　appはどの画面があるかを定義する　入り口を分ける　ルーティングをシンプルにするルーティングの設計書

appフォルダはまずapp/(tabs)/_layout.tsx そこからそれぞれのタブの入り口を見る

_layout.tsx
import { Tabs } from 'expo-router'これがあるからfoods.tsxなどのファイルを追加するだけでタブが増えるけど、もしもexpo-routerがなかったらlayout.tsxの代わりにapp.tsなどとして 
```
import { NavigationContainer } from '@react-navigation/native';
  import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

  import { RecordScreen } from '@/features/record/record-screen';
  import { HistoryScreen } from '@/features/history/history-screen';
  import { FoodsScreen } from '@/features/foods/foods-screen';
  import { SettingsScreen } from '@/features/settings/settings-screen';

  const Tab = createBottomTabNavigator();

  export default function App() {
    return (
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Record" component={RecordScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="Foods" component={FoodsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
```
のようにタブを追加する度に毎度ここに書き込まないといけなくなる

import { HapticTab } from '@/components/haptic-tab';　
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

このアプリでのルール感はこんな感じ：

  - app/
    ルーティングの入口（画面の入り口だけ）
    → 画面本体は置かない
  - features/
    画面ごとの実装（UI + その画面専用のロジック）
    例: features/history/ に history-screen.tsx と use-history-screen.ts
  - components/
    画面をまたいで使う共通UI
    例: SummaryCard, MealCard など
  - hooks/
    汎用的なロジック（状態取得・購読など）
    例: use-daily-summary
  - constants/
    定数・型・テーマ
    例: theme.ts, schema.ts
  - agents/
    ドメインロジック（保存・計算・取得）
    UIから独立した処理
  - lib/
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol'; //componentsは画面を跨いで使う共通UI　例えばsummaryとか
import { Colors } from '@/constants/theme';//テーマ　定数　方　などはconstants
import { useColorScheme } from '@/hooks/use-color-scheme'; //状態管理のものはhooks

こいつら全部自作コンポーネントらしいからreact とか　expo routerみたいな外部ライブラリではない

会社とかでも結構ポンポン自作コンポーネント作るみたい

後でこのコンポーネントについて読む

jsdocsとは　この関数は JSX.Element を返す　とは　
 **JSDoc（ジェイエスドック）**は、
  関数や変数の説明を書くためのコメント形式です。

  例：

  /**
   * 〜を行う関数
   * @param x 入力値
   * @returns 返り値の説明
   */

  ———

  これはjsdocsという
  @return sは返り血の説明をしているだけ。　俺が必ずファイルに説明を入れろとsgents.mdに書いたからこのような簡単なファイルにもこういうのが書かれてる

  export default function TabLayout() { 

export defaultとはこのファイルの代表の外部公開をtablayoutにするといういみで、これがあるとimport tablayout from ... として使える。このファイルのメインはTabLayoutですっていってるだけ

export function（名前付きエクスポート）

  - その関数名で外に出す
  - import 側は { } が必要

  export function foo() {}
  export function bar() {}
  // 使う側
  import { foo, bar } from './file';

  export default function（デフォルトエクスポート）

  - そのファイルの“代表1つ”を出す
  - import 側は名前自由

  export default function Foo() {}
  // 使う側
  import Anything from './file'; // 名前は自由

  ### 複数あっていいの？

  - export function は複数OK（同じファイル内でも何個でも）
  - ただし 同じ名前はNG
  - export default は1ファイルに1つだけ

  defaultとそうでないもので違う点は名前を変えて呼んでいいかどうか
  - default = 自由に名付けてOK
  - named = 原則同名、必要なら as で変える

  なんでそんなの使い分けんの？
  由は **「1ファイルに1つの主役を持たせたい場合」と「複数の機能を出したい場合」**で使い分けるためです。

  - default export
    → 「このファイルの主役はこれ」って明示できる
    → import側は名前を自由にできる
  - named export
    → 「このファイルに複数の機能がある」を表現できる
    → import時に名前が明確で読みやすい
    → ツールが「使われていない関数」を検知しやすい

  つまり
  単体の主役なら default、複数なら named
  というのが実用上のメリットです。
Expo Router あり（今のコード）

  - <Tabs.Screen name="history" /> は app/(tabs)/history.tsx を自動で紐づけ

Expo Router なし（React Navigation直書き）

  - 自分で 画面コンポーネントを import して登録が必要
  - ルーティングは 全部コードで手動管理

  例（Expo Routerなし）

  import { NavigationContainer } from '@react-navigation/native';
  import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

  import { RecordScreen } from '@/features/record/record-screen';
  import { HistoryScreen } from '@/features/history/history-screen';

  const Tab = createBottomTabNavigator();

  export default function App() {
    return (
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Record" component={RecordScreen} />

layout.tsxはひとまとまりごとに存在する
ログインーアプリの中身〜たぶみたいに