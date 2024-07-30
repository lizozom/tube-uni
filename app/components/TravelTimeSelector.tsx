'use client'

import { useEffect, useState } from 'react'

export interface StationSelectorListboxProps {
  commuteTime?: number
  onChange: (commuteTime: number | undefined) => void
}

export default function TravelTimeSelector (props: StationSelectorListboxProps) {
  const { onChange } = props
  const [commuteTime, setCommuteTime] = useState<string>(props.commuteTime ? props.commuteTime.toString() : '')
  const [placeholder, setPlaceholder] = useState('*')

  useEffect(() => {
    setCommuteTime(props.commuteTime ? props.commuteTime.toString() : '')
  }, [props.commuteTime])

  const onFocus = () => {
    setPlaceholder('')
  }

  const onBlur = () => {
    setPlaceholder('*')
  }

  const handleChange = (e: any) => {
    if (e.target.value === '') {
      setCommuteTime('')
      onChange(undefined)
      return
    }

    const val = parseInt(e.target.value, 10)
    if (val && val > 0 && val <= 20) {
      setCommuteTime(val.toString())
      onChange(val)
    } else {
      setCommuteTime(commuteTime)
    }
  }

  return (
    <div className="py-6 text-m flex flex-row gap-2">
      or just set commute time to
      <input
        className="inline w-6 h-6 p-0 m-0 text-center text-xs focus:outline-none text-white placeholder-white item-color-main"
        placeholder={placeholder}
        value={commuteTime}
        onFocus={onFocus}
        onBlur={onBlur}
        onInput={handleChange}/> minutes
      </div>
  )
}
