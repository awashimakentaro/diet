/**
 * app/(tabs)/foods.tsx
 *
 * 【責務】
 * 食品タブの画面コンポーネントを Expo Router に接続する。
 *
 * 【使用箇所】
 * - Expo Router の `(tabs)/foods` ルート
 *
 * 【やらないこと】
 * - UI 実装や状態管理
 *
 * 【他ファイルとの関係】
 * - features/foods/foods-screen.tsx を再エクスポートする。
 */

export { FoodsScreen as default } from '@/features/foods/foods-screen';
//ルーティングようのファイルを薄く保ち可読性を上げる　'@/features/foods/foods-screen'をここで使うよと宣言するだけの中継ファイル
