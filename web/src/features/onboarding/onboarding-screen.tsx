/**
 * web/src/features/onboarding/onboarding-screen.tsx
 *
 * 【責務】
 * 登録直後の使い方説明とプロフィール入力 UI を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - /app/onboarding/page.tsx から呼ばれる。
 * - use-onboarding-screen.ts の state と保存処理を表示へ反映する。
 *
 * 【やらないこと】
 * - DB 保存
 * - 目標計算ロジック
 * - 認証状態の保持
 *
 * 【他ファイルとの関係】
 * - use-onboarding-screen.ts に依存する。
 * - web/src/styles/globals.css の onboarding 系クラスに依存する。
 */

'use client';

import { Bolt, Camera, ChartColumnBig, Sparkles } from 'lucide-react';
import type { ChangeEvent, JSX } from 'react';

import { useOnboardingScreen } from './use-onboarding-screen';

type OnboardingScreenProps = {
  redirectTo: string;
};

const ONBOARDING_POINTS = [
  {
    icon: Sparkles,
    title: '最初の2分で、食事管理の土台を整える。',
    description: 'まずは使い方をざっと確認して、次にプロフィールを入力します。入力が終わると、そのまま記録画面から始められます。',
    image: '/tutorial/step1.png',
  },
  {
    icon: Bolt,
    title: '目標を自動算出',
    description: 'プロフィールを入力すると、あなたに最適な摂取目標を自動計算してすぐに始められます。',
    image: '/tutorial/step2.png',
  },
  {
    icon: Camera,
    title: '写真でかんたん AI 記録',
    description: '料理の写真を撮るか、文章を入力するだけ。AI がメニュー名と栄養素を瞬時に推定して記録します。',
    image: '/tutorial/step3.png',
  },
  {
    icon: ChartColumnBig,
    title: '履歴と PFC をあとから見返せる',
    description: '記録した食事は日別にまとまり、PFC バランスもひと目で追えるようになります。',
    image: '/tutorial/step3.png',
  },
] as const;

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
  const {
    step,
    introStep,
    profileValues,
    gender,
    activityLevel,
    feedbackMessage,
    isSubmitting,
    handleStartProfileSetup,
    handleBackToIntro,
    handlePreviousIntroStep,
    handleNextIntroStep,
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
      <section className="onboarding-screen__shell">
        <div className="onboarding-screen__hero">
          <div className="onboarding-screen__eyebrow">WELCOME TO DIET</div>
          <h1>PFC Tracker</h1>
          <p>写真でもテキストでも、食事記録をすぐ始められるように最初の設定だけ先に整えます。</p>

          <div className="onboarding-screen__progress">
            <span className={step === 0 ? 'onboarding-screen__progress-dot onboarding-screen__progress-dot--active' : 'onboarding-screen__progress-dot'} />
            <span className={step === 1 ? 'onboarding-screen__progress-dot onboarding-screen__progress-dot--active' : 'onboarding-screen__progress-dot'} />
          </div>
        </div>

        {step === 0 ? (
          <section className="onboarding-screen__panel onboarding-screen__panel--intro">
            <div className="onboarding-screen__tutorial-card">
              <div className="onboarding-screen__tutorial-image-box">
                <img
                  alt={ONBOARDING_POINTS[introStep].title}
                  className="onboarding-screen__tutorial-image"
                  src={ONBOARDING_POINTS[introStep].image}
                />
              </div>

              <div className="onboarding-screen__tutorial-content">
                <p className="onboarding-screen__tutorial-step">
                  STEP {introStep + 1} / {ONBOARDING_POINTS.length}
                </p>
                <div className="onboarding-screen__feature-icon">
                  {(() => {
                    const Icon = ONBOARDING_POINTS[introStep].icon;
                    return <Icon size={18} strokeWidth={2.1} />;
                  })()}
                </div>
                <h2>{ONBOARDING_POINTS[introStep].title}</h2>
                <p>{ONBOARDING_POINTS[introStep].description}</p>
              </div>

              <div className="onboarding-screen__tutorial-dots">
                {ONBOARDING_POINTS.map((point, index) => (
                  <span
                    className={index === introStep ? 'onboarding-screen__tutorial-dot onboarding-screen__tutorial-dot--active' : 'onboarding-screen__tutorial-dot'}
                    key={point.title}
                  />
                ))}
              </div>
            </div>

            <div className="onboarding-screen__cta-row onboarding-screen__cta-row--split">
              <div className="onboarding-screen__intro-actions">
                <button
                  className="onboarding-screen__secondary-button"
                  disabled={introStep === 0}
                  onClick={handlePreviousIntroStep}
                  type="button"
                >
                  戻る
                </button>
                <button
                  className="onboarding-screen__secondary-button"
                  onClick={handleStartProfileSetup}
                  type="button"
                >
                  説明をスキップ
                </button>
              </div>
              <button
                className="onboarding-screen__primary-button"
                onClick={() => handleNextIntroStep(ONBOARDING_POINTS.length)}
                type="button"
              >
                {introStep === ONBOARDING_POINTS.length - 1 ? 'プロフィール入力へ進む' : '次へ'}
              </button>
            </div>
          </section>
        ) : (
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
                onClick={handleBackToIntro}
                type="button"
              >
                使い方に戻る
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
        )}
      </section>
    </main>
  );
}
