import React from 'react';

const QuickScheduler = ({ scheduleData = null, onSlotSelect }) => {
  // Données par défaut si non fournies
  const defaultScheduleData = {
    matin: [
      { day: "Jeu.05", status: "disabled", label: "Jeu.05" },
      { day: "Ven.06", status: "active", label: "Ven.06" },
      { day: "Sam.07", status: "active", label: "Sam.07" },
    ],
    apresMidi: [
      { day: "Jeu.05", status: "active", label: "Jeu.05" },
      { day: "Ven.06", status: "active", label: "Ven.06" },
      { day: "Sam.07", status: "active", label: "Sam.07" },
    ]
  };

  const data = scheduleData || defaultScheduleData;

  const SlotButton = ({ day, status, label }) => {
    const baseStyles = "flex-1 py-2 px-4 rounded-lg border text-sm font-semibold transition-all text-center min-w-[90px]";
    const activeStyles = "border-blue-600 text-blue-700 hover:bg-blue-50 cursor-pointer";
    const disabledStyles = "border-transparent bg-gray-50 text-gray-300 cursor-not-allowed";

    return (
      <button
        disabled={status === "disabled"}
        onClick={() => onSlotSelect && status === "active" && onSlotSelect({ day, status, label })}
        className={`${baseStyles} ${status === "active" ? activeStyles : disabledStyles}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md py-4">
      {/* SECTION MATIN */}
      <div className="flex items-center gap-4">
        <span className="w-24 text-[11px] font-bold text-gray-900 uppercase tracking-wider">
          Matin
        </span>
        <div className="flex gap-2 flex-1">
          {data.matin.map((slot, index) => (
            <SlotButton key={`matin-${index}`} {...slot} />
          ))}
        </div>
      </div>

      {/* SECTION APRÈS-MIDI */}
      <div className="flex items-center gap-4">
        <span className="w-24 text-[11px] font-bold text-gray-900 uppercase tracking-wider">
          Après-midi
        </span>
        <div className="flex gap-2 flex-1">
          {data.apresMidi.map((slot, index) => (
            <SlotButton key={`apres-${index}`} {...slot} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickScheduler;
