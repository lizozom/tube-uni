"use client";

import { useEffect, useState } from "react"
import { Listbox } from '@headlessui/react'
import { TravelMode } from "@googlemaps/google-maps-services-js";

const methods = [
    { id: 1, name: 'Driving', mode: TravelMode.driving },
    { id: 2, name: 'Public Transportation', mode: TravelMode.transit},
    { id: 3, name: 'Walking', mode: TravelMode.walking},
    { id: 4, name: 'Cycling', mode: TravelMode.bicycling},
  ]

export interface CommuteListboxProps {
  onChange: (method: typeof methods[0]) => void
}

export default function CommuteListbox(props: CommuteListboxProps) {
    const [selectedMethod, setMethod] = useState(methods[0]);
    const { onChange } = props;

    useEffect(() => {
      onChange(selectedMethod);
    }, [selectedMethod, onChange]);
  
    return (
      <Listbox value={selectedMethod} onChange={setMethod}>
      <Listbox.Button className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border border-blue-400 me-2 px-2.5 py-0.5">{selectedMethod.name}</Listbox.Button>
      <Listbox.Options>
        {methods.map((method) => (
          <Listbox.Option
            key={method.id}
            value={method}
            className="ui-active:bg-blue-500 ui-active:text-white ui-not-active:bg-white ui-not-active:text-black"
         
          >
            {method.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
      </Listbox>
    )
  }