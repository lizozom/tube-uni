"use client";

import { useEffect, useState } from "react";

export interface StationSelectorListboxProps {
  commuteTime?: number;
  onChange: (commuteTime: number | undefined) => void;
}

export default function TravelTimeSelector(props: StationSelectorListboxProps) {
  const { onChange } = props;
  const [commuteTime , setCommuteTime] = useState<number | undefined>(props.commuteTime);

  useEffect(() => {
    setCommuteTime(props.commuteTime);
  }, [props.commuteTime]);

  const handleChange = (e: any) => {
    if (e.target.value === '') {
      setCommuteTime(undefined);
      onChange(undefined);
      return;
    }

    const val = parseInt(e.target.value, 10);
    if (val && val > 0 && val <= 20) {
      setCommuteTime(val);
      onChange(val);
    } else {
      setCommuteTime(commuteTime);
    }
  }

  return (
    <div className="py-6 text-m flex flex-row gap-2">
      or just set commute time to 
      <input 
        className="inline w-6 h-6 p-0 m-0 text-center text-xs focus:outline-none text-white placeholder-white item-color-main" 
        placeholder="*"
        value={commuteTime}     
        onInput={handleChange}/> minutes
      </div>
  );
}
