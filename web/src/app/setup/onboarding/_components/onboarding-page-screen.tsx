'use client';

/**
 * web/src/app/setup/onboarding/_components/onboarding-page-screen.tsx
 *
 * 【責務】
 * `/setup/onboarding` ルート専用の共通チュートリアル起動とプロフィール入力 UI を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/setup/onboarding/page.tsx から呼ばれる。
 * - web/src/features/onboarding/use-onboarding-screen.ts の state と保存処理を表示へ反映する。
 *
 * 【やらないこと】
 * - チュートリアルのステップ管理
 * - DB 保存
 * - 目標計算ロジック
 * - 認証状態の保持
 *
 * 【他ファイルとの関係】
 * - web/src/features/onboarding/use-onboarding-screen.ts に依存する。
 * - web/src/styles/globals.css の onboarding 系クラスに依存する。
 */

import type { ChangeEvent, JSX } from 'react';
import { useState } from 'react';
import { CalendarDays, Dumbbell, Library, Utensils } from 'lucide-react';

import { useOnboardingScreen } from '@/features/onboarding/use-onboarding-screen';

type OnboardingStep = 'intro' | 'profile' | 'ready';

type OnboardingPageScreenProps = {
  allowExistingProfile?: boolean;
  guideOnly?: boolean;
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

const GUIDE_CARDS = [
  {
    title: '食事記録',
    body: '写真や文章から食事を追加できます。AIが食品候補とPFCを下書きにするので、必要な部分だけ修正して保存できます。',
    icon: Utensils,
  },
  {
    title: '筋トレ記録',
    body: '種目、セット数、回数、重量を入力すると、体重情報をもとに消費カロリーを推定します。',
    icon: Dumbbell,
  },
  {
    title: 'メニュー',
    body: 'よく使う食品や筋トレメニューを保存して、次回からすぐ再利用できます。',
    icon: Library,
  },
  {
    title: '履歴',
    body: '日付ごとに食事とトレーニングを確認できます。編集、削除、保存もここから行えます。',
    icon: CalendarDays,
  },
] as const;

export function OnboardingPageScreen({
  allowExistingProfile = false,
  guideOnly = false,
  redirectTo,
}: OnboardingPageScreenProps): JSX.Element {
  const [step, setStep] = useState<OnboardingStep>('intro');
  const [isWarping, setIsWarping] = useState(false);
  const {
    profileValues,
    gender,
    activityLevel,
    feedbackMessage,
    isSubmitting,
    handleProfileValueChange,
    handleGenderChange,
    handleActivityChange,
    handleSkip,
    handleSubmitProfile,
  } = useOnboardingScreen({
    allowExistingProfile,
    onSubmitComplete: () => setStep('ready'),
    redirectTo,
  });
  const activeStep = guideOnly ? 'intro' : step;
  const stepIndex = activeStep === 'intro' ? 1 : activeStep === 'profile' ? 2 : 3;

  function createChangeHandler(field: keyof typeof profileValues) {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      handleProfileValueChange(field, event.target.value);
    };
  }

  function handleStartApp(): void {
    setIsWarping(true);
    window.setTimeout(() => {
      handleSkip();
    }, 620);
  }

  return (
    <main className={isWarping ? 'onboarding-screen onboarding-screen--warping' : 'onboarding-screen'}>
      <section className={`onboarding-screen__shell onboarding-screen__shell--step onboarding-screen__shell--${activeStep}`}>
        {!guideOnly ? (
          <div className="onboarding-screen__step-meta">
            <span>{stepIndex} / 3</span>
            <div className="onboarding-screen__progress" aria-hidden="true">
              {(['intro', 'profile', 'ready'] as const).map((item) => (
                <span
                  className={item === activeStep ? 'onboarding-screen__progress-dot onboarding-screen__progress-dot--active' : 'onboarding-screen__progress-dot'}
                  key={item}
                />
              ))}
            </div>
          </div>
        ) : null}

        {activeStep === 'intro' ? (
          <section className="onboarding-screen__hero onboarding-screen__step-card">
            <div className="onboarding-screen__eyebrow">WELCOME TO PFC TRACKER</div>
            <h1>記録を軽くして、続けやすくする</h1>
            <p>
              食事と筋トレを毎日続けやすい形で記録します。AIの下書きとカロリー推定を使い、PFC・カロリー収支・運動消費をまとめて確認できます。
            </p>

            <div className="onboarding-screen__guide-grid">
              {GUIDE_CARDS.map((card) => {
                const Icon = card.icon;

                return (
                  <article className="onboarding-screen__guide-card" key={card.title}>
                    <div className="onboarding-screen__feature-icon">
                      <Icon size={18} strokeWidth={2.3} />
                    </div>
                    <h2>{card.title}</h2>
                    <p>{card.body}</p>
                  </article>
                );
              })}
            </div>

            <div className="onboarding-screen__cta-row onboarding-screen__cta-row--split">
              <button
                className={guideOnly ? 'onboarding-screen__primary-button onboarding-screen__return-button' : 'onboarding-screen__primary-button'}
                onClick={guideOnly ? handleSkip : () => setStep('profile')}
                type="button"
              >
                {guideOnly ? '設定に戻る' : '次へ'}
              </button>
            </div>
          </section>
        ) : null}

        {!guideOnly && activeStep === 'profile' ? (
          <section className="onboarding-screen__panel onboarding-screen__panel--profile onboarding-screen__step-card">
            <div className="onboarding-screen__panel-copy">
              <p className="eyebrow">Profile Setup</p>
              <h2>最初に設定すること</h2>
              <p>
                目標 kcal / PFC、現在体重、目標体重、運動レベルの初期値を作ります。ここで保存すると Home の栄養状況とカロリー収支がすぐ使えます。
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
                disabled={isSubmitting}
                onClick={() => setStep('intro')}
                type="button"
              >
                戻る
              </button>
              <button
                className="onboarding-screen__secondary-button"
                disabled={isSubmitting}
                onClick={() => setStep('ready')}
                type="button"
              >
                あとで設定する
              </button>
              <button
                className="onboarding-screen__primary-button"
                disabled={isSubmitting}
                onClick={() => {
                  void handleSubmitProfile();
                }}
                type="button"
              >
                {isSubmitting ? '保存中...' : '保存して次へ'}
              </button>
            </div>
          </section>
        ) : null}

        {!guideOnly && activeStep === 'ready' ? (
          <section className="onboarding-screen__panel onboarding-screen__step-card onboarding-screen__ready-card">
            <div className="onboarding-screen__panel-copy">
              <p className="eyebrow">Start Tracking</p>
              <h2>それではアプリを始めましょう!!</h2>
            </div>

            <div className="onboarding-screen__cta-row onboarding-screen__ready-actions">
              <button
                className="onboarding-screen__secondary-button"
                disabled={isWarping}
                onClick={() => setStep('profile')}
                type="button"
              >
                戻る
              </button>
              <button
                className="onboarding-screen__primary-button"
                disabled={isWarping}
                onClick={handleStartApp}
                type="button"
              >
                {isWarping ? '移動中...' : 'アプリを始める'}
              </button>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
