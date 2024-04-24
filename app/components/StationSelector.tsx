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
  const { stations, title } = props;
  const [station, setStation] = useState<string | undefined>(props.station);
  const [query, setQuery] = useState('');


  const filteredStations =
    query === ''
      ? stations
      : stations.filter((station) => {
          return station.name.toLowerCase().includes(query.toLowerCase())
        })


  useEffect(() => {
    if (station) {
      props.onChange(station);
    }
  }, [station]);

  return (
    <>

    <div className="px-3 text-lg">{title}</div>

    <Combobox value={station} onChange={setStation}>
      <div className="dropdown-button flex flex-row justify-between px-3 mb-4 w-[70%]">
        <Combobox.Input
          className="bg-transparent focus:outline-none h-fit m-0 px-3 py-3 text-lg "
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)} 
        />
        <Combobox.Button className="dropdown-button-footer-1">
              <Image
                src="/icons/arrow-down.png"
                width={20}
                height={20}
                className="h-2 w-2"
                alt="arrow-down"
              />
        </Combobox.Button>
      </div>
      <Combobox.Options className="item-color-tertiary text-white">
        {filteredStations.map((s) => (
          <Combobox.Option  className="px-3 py-2" key={s.tla} value={s.name}>
            {s.name}
          </Combobox.Option>
        ))}
      </Combobox.Options>
    </Combobox>
    </>
  );
}
