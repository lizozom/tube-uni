'use client'

import Image from 'next/image'

export interface ErrorScreenProps {
  onBack: () => void
  errorOrCode?: Error | undefined
}

export function ErrorScreen (props: ErrorScreenProps) {
  const { onBack, errorOrCode } = props

  let errMsg = (
    <>
      <span className="text-2xl text-center items-center">it&apos;s not you, it&apos;s us<br/>but something went wrong.</span>
      <span className="text-2xl text-center items-center">we&apos;re sorry</span>
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
    <div className="flex real-100vh relative">
        <div className="flex m-auto flex-col items-center gap-8 ">
            <Image
                src="/images/Error.svg"
                width={150}
                height={150}
                alt="error"
              />

              {errMsg}
        </div>
        <button className="text-main absolute bottom-[35px] left-[50%] -translate-x-[50%]" onClick={onBack}>
          back to start
        </button>
    </div>

  )
}
