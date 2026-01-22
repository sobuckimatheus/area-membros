'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

export function ProgressBarProvider() {
  return (
    <ProgressBar
      height="4px"
      color="#ef4444"
      options={{
        showSpinner: false,
        trickle: true,
        trickleSpeed: 200,
        minimum: 0.08,
        easing: 'ease',
        speed: 200,
      }}
      shallowRouting
      style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 99999;
      "
    />
  )
}
