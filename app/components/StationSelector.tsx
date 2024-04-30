"use client";

import { useEffect, useState } from "react";
import { Combobox } from '@headlessui/react'
import { TubeStation } from "../types";
import Image from "next/image";

export interface StationSelectorListboxProps {
  title: string;
  station?: string;
  stations: Array<TubeStation>;
  onChange: (station: string) => void;
}

export default function StationSelector(props: StationSelectorListboxProps) {
  const { stations, title, onChange } = props;
  const [station, setStation] = useState<string>(props.station || '');
  const [query, setQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('choose station');



  const filteredStations =
    query === ''
      ? stations
      : stations.filter((station) => {
          return station.name.toLowerCase().includes(query.toLowerCase())
        })


  useEffect(() => {
    if (station) {
      onChange(station);
    }
  }, [station, onChange]);

  const onFocus = () => {
    setPlaceholder('');
  }

  const onBlur = () => {
    setPlaceholder('choose station');
  }

  return (
    <>

    <div className="px-4 text-main">{title}</div>

    <Combobox value={station} onChange={setStation}>
      <div className="dropdown-button flex flex-row justify-between pe-3 mb-4 w-full">
        <Combobox.Input
          className="bg-transparent focus:outline-none h-fit m-0 px-4 py-3 text-lg placeholder:text-white"
          autoComplete="off"
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(event) => setQuery(event.target.value)} 
        />
        <Combobox.Button className="dropdown-button-footer-1">
              <Image
                src="/icons/arrow-down.svg"
                width={20}
                height={20}
                className="h-2 w-2"
                alt="arrow-down"
              />
        </Combobox.Button>
      </div>
      <Combobox.Options className="item-color-tertiary text-white max-h-[172px] overflow-y-scroll	absolute top-[80px] z-10	w-full">
        {filteredStations.map((s) => (
          <Combobox.Option  className={`px-3 py-2 ${s.name === station ? 'selected' : ''}`} key={s.tla} value={s.name}>
            {s.name}
          </Combobox.Option>
        ))}
      </Combobox.Options>
    </Combobox>
    </>
  );
}
