import React from "react";

interface CountryMapProps {
  mapColor?: string;
}

const CountryMap: React.FC<CountryMapProps> = ({ mapColor }) => {
  return (
    <div className="relative w-full h-[250px] flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-dark rounded-xl border border-gray-100 dark:border-gray-800 p-4">
      {/* Simplified, premium abstract world map SVG */}
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full opacity-80 dark:opacity-60 text-gray-300 dark:text-gray-700"
        fill={mapColor || "currentColor"}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* North America */}
        <path d="M150,120 L220,100 L320,130 L380,180 L290,260 L230,280 L180,220 L130,180 Z" />
        {/* South America */}
        <path d="M290,280 L350,310 L380,380 L340,460 L310,480 L280,420 L270,330 Z" />
        {/* Greenland */}
        <path d="M350,50 L420,40 L440,80 L390,100 Z" />
        {/* Africa */}
        <path d="M480,240 L560,200 L610,240 L630,320 L580,410 L520,380 L480,300 Z" />
        {/* Europe / Northern Asia */}
        <path d="M480,180 L520,100 L600,80 L720,80 L880,100 L890,150 L840,210 L750,220 L620,180 L560,200 Z" />
        {/* Southern Asia / Middle East */}
        <path d="M620,180 L750,220 L840,210 L820,280 L780,310 L710,290 L630,240 Z" />
        {/* Australia */}
        <path d="M800,380 L860,370 L890,410 L840,450 L790,420 Z" />
      </svg>

      {/* Markers (Hotspots) */}
      {/* United States */}
      <div className="absolute top-[34%] left-[24%] group">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
        </span>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap shadow-lg z-999">
          United States (42%)
        </div>
      </div>

      {/* United Kingdom */}
      <div className="absolute top-[26%] left-[49%] group">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
        </span>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap shadow-lg z-999">
          United Kingdom (18%)
        </div>
      </div>

      {/* Sweden */}
      <div className="absolute top-[20%] left-[53%] group">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
        </span>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap shadow-lg z-999">
          Sweden (8%)
        </div>
      </div>

      {/* India */}
      <div className="absolute top-[44%] left-[72%] group">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
        </span>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap shadow-lg z-999">
          India (25%)
        </div>
      </div>
    </div>
  );
};

export default CountryMap;
