/**
 * web/src/features/onboarding/onboarding-screen.tsx
 *
 * 【責務】
 * 登録直後の共通チュートリアル起動とプロフィール入力 UI を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - /app/onboarding/page.tsx から呼ばれる。
 * - 初回表示で共通 TutorialOverlay を開く。
 * - use-onboarding-screen.ts の state と保存処理を表示へ反映する。
 *
 * 【やらないこと】
 * - チュートリアルのステップ管理
 * - DB 保存
 * - 目標計算ロジック
 * - 認証状態の保持
 *
 * 【他ファイルとの関係】
 * - use-onboarding-screen.ts に依存する。
 * - web/src/styles/globals.css の onboarding 系クラスに依存する。
 */

'use client';

import type { ChangeEvent, JSX } from 'react';
import { useState } from 'react';

import { TutorialOverlay } from '@/features/home/components/tutorial-overlay';

import { useOnboardingScreen } from './use-onboarding-screen';

type OnboardingScreenProps = {
  redirectTo: string;
};

const ACTIVITY_OPTIONS = [
  { value: 'low', label: '低', caption: '座り仕事中心' },
  { value: 'moderate', label: '中', caption: '普段よく歩く' },
  { value: 'high', label: '高', caption: '運動習慣あり' },
] as const;

const PROFILE_FIELDS = [
  { field: 'username', label: 'username', placeholder: 'diet_runner', suffix: '' },
  { field: 'displayName', label: '表示名', placeholder: 'Yuta', suffix: '' },
  { field: 'bio', label: 'ひとこと', placeholder: '脂質を抑えて減量中', suffix: '' },
  { field: 'age', label: '年齢', placeholder: '30', suffix: '歳' },
  { field: 'heightCm', label: '身長', placeholder: '170', suffix: 'cm' },
  { field: 'currentWeightKg', label: '現在体重', placeholder: '65', suffix: 'kg' },
  { field: 'targetWeightKg', label: '目標体重', placeholder: '62', suffix: 'kg' },
  { field: 'targetDays', label: '目標日数', placeholder: '84', suffix: '日' },
] as const;

export function OnboardingScreen({
  redirectTo,
}: OnboardingScreenProps): JSX.Element {
  const [isTutorialOpen, setIsTutorialOpen] = useState(true);
  const {
    profileValues,
    gender,
    activityLevel,
    feedbackMessage,
    isSubmitting,
    handleProfileValueChange,
    handleGenderChange,
    handleActivityChange,
    handleSubmitProfile,
  } = useOnboardingScreen({ redirectTo });

  function createChangeHandler(field: keyof typeof profileValues) {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      handleProfileValueChange(field, event.target.value);
    };
  }

  return (
    <main className="onboarding-screen">
      <TutorialOverlay isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <section className="onboarding-screen__shell">
        <div className="onboarding-screen__hero">
          <div className="onboarding-screen__eyebrow">WELCOME TO DIET</div>
          <h1>プロフィールを入力して始める</h1>
          <p>使い方の説明を確認したあと、そのまま初期設定を保存できます。あとから見返したい時は Settings から開けます。</p>
        </div>

        <section className="onboarding-screen__panel onboarding-screen__panel--profile">
          <div className="onboarding-screen__panel-copy">
            <p className="eyebrow">Profile Setup</p>
            <h2>あなた向けの初期設定を作成します</h2>
            <p>
              username は将来の共有プロフィール URL に使います。体格情報は初期目標の自動計算に利用します。
            </p>
          </div>

          <div className="onboarding-screen__form-grid">
            {PROFILE_FIELDS.map((field) => (
              <label className="onboarding-screen__field" key={field.field}>
                <span>{field.label}</span>
                <div className="onboarding-screen__input-wrap">
                  <input
                    onChange={createChangeHandler(field.field)}
                    placeholder={field.placeholder}
                    type="text"
                    value={profileValues[field.field]}
                  />
                  {field.suffix.length > 0 ? <em>{field.suffix}</em> : null}
                </div>
              </label>
            ))}
          </div>

          <div className="onboarding-screen__choice-block">
            <p>性別</p>
            <div className="onboarding-screen__segmented">
              <button
                className={gender === 'male' ? 'onboarding-screen__segment onboarding-screen__segment--active' : 'onboarding-screen__segment'}
                onClick={() => handleGenderChange('male')}
                type="button"
              >
                男性
              </button>
              <button
                className={gender === 'female' ? 'onboarding-screen__segment onboarding-screen__segment--active' : 'onboarding-screen__segment'}
                onClick={() => handleGenderChange('female')}
                type="button"
              >
                女性
              </button>
            </div>
          </div>

          <div className="onboarding-screen__choice-block">
            <p>活動量</p>
            <div className="onboarding-screen__activity-grid">
              {ACTIVITY_OPTIONS.map((option) => (
                <button
                  className={activityLevel === option.value ? 'onboarding-screen__activity onboarding-screen__activity--active' : 'onboarding-screen__activity'}
                  key={option.value}
                  onClick={() => handleActivityChange(option.value)}
                  type="button"
                >
                  <strong>{option.label}</strong>
                  <span>{option.caption}</span>
                </button>
              ))}
            </div>
          </div>

          {feedbackMessage !== null ? (
            <p className="onboarding-screen__feedback">{feedbackMessage}</p>
          ) : null}

          <div className="onboarding-screen__cta-row onboarding-screen__cta-row--split">
            <button
              className="onboarding-screen__secondary-button"
              onClick={() => setIsTutorialOpen(true)}
              type="button"
            >
              使い方を見る
            </button>
            <button
              className="onboarding-screen__primary-button"
              disabled={isSubmitting}
              onClick={() => {
                void handleSubmitProfile();
              }}
              type="button"
            >
              {isSubmitting ? '保存中...' : '始める'}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
