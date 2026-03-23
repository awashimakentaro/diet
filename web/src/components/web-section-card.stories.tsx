/**
 * web/src/components/web-section-card.stories.tsx
 *
 * 【責務】
 * WebSectionCard の Storybook 表示を定義する。
 *
 * 【使用箇所】
 * - `npm run storybook`
 * - `npm run build-storybook`
 *
 * 【やらないこと】
 * - 本番 UI の実装
 * - 画面遷移制御
 *
 * 【他ファイルとの関係】
 * - web/src/components/web-section-card.tsx を Storybook 上で確認する。
 */

import type { Meta, StoryObj } from '@storybook/react';

import { WebSectionCard } from './web-section-card';

const meta = {
  title: 'Web/WebSectionCard',
  component: WebSectionCard,
  args: {
    eyebrow: 'Storybook',
    title: 'セクションカード',
    description: 'Web 版で使う共通カードの外観確認用 story です。',
    children: (
      <div className="soft-card">
        <p className="soft-card__label">Content</p>
        <p>ここに任意の子要素が入ります。</p>
      </div>
    ),
  },
} satisfies Meta<typeof WebSectionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
