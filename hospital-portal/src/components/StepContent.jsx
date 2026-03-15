import React from 'react';
import { Step1 } from './steps/Step1';
import { Step2 } from './steps/Step2';
import { Step3 } from './steps/Step3';
import { Step4 } from './steps/Step4';
import { Step5 } from './steps/Step5';
import { Step6 } from './steps/Step6';
import { Step7 } from './steps/Step7';
import { Step8 } from './steps/Step8';
import { Step9 } from './steps/Step9';
import { Step10 } from './steps/Step10';
import { Step11 } from './steps/Step11';
import { Step12 } from './steps/Step12';
import { Step13 } from './steps/Step13';
import { Step14 } from './steps/Step14';
import { AnimatePresence } from 'framer-motion';

export function StepContent({ step, ...props }) {
    return (
        <div className="step-content-container">
            <AnimatePresence mode="wait">
                {step === 1 && <Step1 key="s1" {...props} />}
                {step === 2 && <Step2 key="s2" {...props} />}
                {step === 3 && <Step3 key="s3" {...props} />}
                {step === 4 && <Step4 key="s4" {...props} />}
                {step === 5 && <Step5 key="s5" {...props} />}
                {step === 6 && <Step6 key="s6" {...props} />}
                {step === 7 && <Step7 key="s7" {...props} />}
                {step === 8 && <Step8 key="s8" {...props} />}
                {step === 9 && <Step9 key="s9" {...props} />}
                {step === 10 && <Step10 key="s10" {...props} />}
                {step === 11 && <Step11 key="s11" {...props} />}
                {step === 12 && <Step12 key="s12" {...props} />}
                {step === 13 && <Step13 key="s13" {...props} />}
                {step === 14 && <Step14 key="s14" {...props} />}
            </AnimatePresence>
        </div>
    );
}
