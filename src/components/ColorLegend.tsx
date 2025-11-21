

export const ColorLegend = () => {
  return (
    <div
      className="relative bg-[rgba(255,255,255,0.95)] w-[140px] h-[200px] rounded-[10px] p-4"
    >
      {/* Bordure */}
      <div
        aria-hidden="true"
        className="absolute border border-gray-200 inset-0 rounded-[10px]
                   shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]
                   pointer-events-none"
      />

      <div className="flex gap-4 h-full items-center">
        {/* BARRE DU GRADIENT — sans AUCUNE classe bg- */}
        <div
          style={{
            width: "24px",
            height: "100%",
            borderRadius: "6px",
            background: "linear-gradient(to bottom, \
              #1d4ed8, \
              #60a5fa, \
              #ffffff, \
              #facc15, \
              #f97316, \
              #dc2626 \
            )",
          }}
        />

        {/* Graduation */}
        <div className="flex flex-col justify-between h-full text-[12px] text-neutral-900">
          <span>-1.0°C</span>
          <span>-0.5°C</span>
          <span>0.0°C</span>
          <span>0.5°C</span>
          <span>1.0°C</span>
        </div>
      </div>
    </div>
  );
};
