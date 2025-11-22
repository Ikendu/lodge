import React, { useMemo } from "react";
import NIGERIA_LGAS from "../data/nigeria_lgas";

export default function StateLgaSelect({
  stateValue = "",
  lgaValue = "",
  onChange = () => {},
  onBlur = () => {},
  stateName = "addressState",
  lgaName = "addressLga",
  errorState = null,
  errorLga = null,
}) {
  const states = useMemo(() => Object.keys(NIGERIA_LGAS).sort(), []);

  const lgasForState = useMemo(() => {
    if (!stateValue) return [];
    return NIGERIA_LGAS[stateValue] || [];
  }, [stateValue]);

  const handleStateChange = (e) => {
    const val = e.target.value;
    // notify parent like a normal input change
    onChange({ target: { name: stateName, value: val } });
    // reset LGA when state changes
    onChange({ target: { name: lgaName, value: "" } });
  };

  const handleLgaChange = (e) => {
    onChange({ target: { name: lgaName, value: e.target.value } });
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      <select
        name={stateName}
        value={stateValue}
        onChange={handleStateChange}
        onBlur={onBlur}
        className={`p-3 rounded-xl w-full ${
          errorState ? "border-red-500 ring-1 ring-red-400" : ""
        }`}
        aria-invalid={errorState ? "true" : "false"}
      >
        <option value="">Select State</option>
        {states.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <label htmlFor="" className="text-white mb-2 font-medium">
        LGA of Residency
      </label>

      <select
        name={lgaName}
        value={lgaValue}
        onChange={handleLgaChange}
        onBlur={onBlur}
        className={`p-3 rounded-xl w-full ${
          errorLga ? "border-red-500 ring-1 ring-red-400" : ""
        }`}
        aria-invalid={errorLga ? "true" : "false"}
      >
        <option value="">Select LGA</option>
        {lgasForState.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
