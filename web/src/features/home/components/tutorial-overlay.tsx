/**
 * web/src/features/home/components/tutorial-overlay.tsx
 *
 * 【責務】
 * 初回利用者向けのチュートリアル画面（オーバーレイ）を表示する。
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

type TutorialStep = {
    title: string;
    description: string;
    image: string;
};

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: 'PFC Tracker へようこそ！',
        description: '理想の体型への第一歩を踏み出しましょう。AI があなたの食事管理を強力にサポートします。',
        image: '/tutorial/step1.png',
    },
    {
        title: '目標を自動算出',
        description: '設定画面で年齢や体重を入力するだけで、あなたに最適な摂取目標（PFCバランス）を AI が計算します。',
        image: '/tutorial/step2.png',
    },
    {
        title: '写真でかんたん AI 記録',
        description: '料理の写真を撮るか、文章を入力するだけ。AI がメニュー名と栄養素を瞬時に推定して記録します。',
        image: '/tutorial/step3.png',
    },
];

export function TutorialOverlay(): JSX.Element | null {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // チュートリアル済みのフラグを確認（localStorage）
        const hasSeenTutorial = localStorage.getItem('pfc_tutorial_completed');
        if (!hasSeenTutorial) {
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem('pfc_tutorial_completed', 'true');
    };

    if (!isVisible) return null;

    const step = TUTORIAL_STEPS[currentStep];

    return (
        <AnimatePresence>
            <motion.div
                className="tutorial-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="tutorial-overlay__card"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                    <div className="tutorial-overlay__image-box">
                        <motion.img
                            key={step.image}
                            src={step.image}
                            alt={step.title}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        />
                    </div>

                    <div className="tutorial-overlay__content">
                        <p className="tutorial-overlay__step-count">
                            STEP {currentStep + 1} / {TUTORIAL_STEPS.length}
                        </p>
                        <h2>{step.title}</h2>
                        <p className="tutorial-overlay__desc">{step.description}</p>
                    </div>

                    <div className="tutorial-overlay__footer">
                        <button className="tutorial-overlay__skip-btn" onClick={handleComplete}>
                            スキップ
                        </button>
                        <button className="tutorial-overlay__next-btn" onClick={handleNext}>
                            {currentStep === TUTORIAL_STEPS.length - 1 ? 'はじめる' : '次へ'}
                        </button>
                    </div>

                    <div className="tutorial-overlay__dots">
                        {TUTORIAL_STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`tutorial-overlay__dot ${i === currentStep ? 'tutorial-overlay__dot--active' : ''}`}
                            />
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
