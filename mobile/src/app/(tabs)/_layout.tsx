/**
 * app/(tabs)/_layout.tsx
 *
 * 【責務】
 * タブナビゲーションを定義し、Record/History/Foods/Settings の 4 画面を束ねる。
 *
 * 【使用箇所】
 * - Expo Router によるルート定義
 *
 * 【やらないこと】
 * - 各タブの UI 実装
 *
 * 【他ファイルとの関係】
 * - app/(tabs) 配下のスクリーンを参照する。
 */

import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol'; //componentsは画面を跨いで使う共通UI　例えばsummaryとか
import { Colors } from '@/constants/theme';//テーマ　定数　方　などはconstants
import { useColorScheme } from '@/hooks/use-color-scheme'; //状態管理のものはhooks
//こいつら全部自作コンポーネントらしいからreact とか　expo routerみたいな外部ライブラリではない。今はとりあえずlayout.tsxを読み進める

/**
 * Diet アプリの主要タブレイアウトを描画する。
 * @returns JSX.Element
 */
export default function TabLayout() {//export default はこのファイルの主役はtablayoutで、他のファイルからimport tablayout form ...として扱えるようにしてるだけ
  const colorScheme = useColorScheme();

  return (
    <Tabs //この中にどのタブ画面を出すかを書いてタブナビゲーションを作る
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"//expo-roiterのおかげでここにindexと書くだけでindex.同じディレクトリにないと指定できない

        options={{
          title: '記録',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.and.pencil" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '履歴',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock" color={color} />,
        }}
      />
      <Tabs.Screen
        name="foods"
        options={{
          title: 'ライブラリ',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="fork.knife" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
