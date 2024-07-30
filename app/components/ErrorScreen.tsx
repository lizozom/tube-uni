'use client'

import Image from 'next/image'
import { track } from '@vercel/analytics'

export interface ErrorScreenProps {
  errorOrCode?: Error | undefined
  onBack?: () => void
}

export function ErrorScreen (props: ErrorScreenProps) {
  const { errorOrCode, onBack } = props

  const onErrorBack = () => {
    track('errorBackButtonClick')
    if (onBack) {
      onBack()
    }
  }

  let errMsg = (
    <>
      <span className="text-2xl text-center items-center">it&apos;s not you, it&apos;s us<br/>but something went wrong.</span>
      <span className="text-2xl text-center items-center">we&apos;

        re sorry</span>
    </>
  )

  if (errorOrCode?.message === '400') {
    errMsg = (
      <>
        <span className="text-2xl text-center items-center">it seems we could not create<br/>a good podcast on this topic</span>
      </>
    )
  }

  return (
    <div className="flex real-100vh w-full absolute  top-0 page-wrapper">
        <div className="flex m-auto flex-col items-center gap-8 ">
            <Image
                src="/images/Error.svg"
                width={150}
                height={150}
                alt="error"
                priority={true}
              />

              {errMsg}
        </div>
        <button className="text-main absolute bottom-[35px] left-[50%] -translate-x-[50%]" onClick={onErrorBack}>
          back to start
        </button>
    </div>

  )
}
