'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

export function ProgressBarProvider() {
  return (
    <ProgressBar
      height="6px"
      color="#ef4444"
      options={{
        showSpinner: false,
        trickle: true,
        trickleSpeed: 150,
        minimum: 0.15,
        easing: 'ease',
        speed: 300,
      }}
      shallowRouting
      delay={50}
      style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 99999;
        box-shadow: 0 0 10px #ef4444, 0 0 5px #ef4444;
      "
    />
  )
}
