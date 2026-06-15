import { useEffect, useRef, useState } from "react";

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  disabled = false,
  align = "left",
  popupClassName = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to { value, label } format
  const normalizedOptions = options.map(opt => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { value: opt, label: opt };
    }
    const val = opt.value !== undefined ? opt.value : (opt.id !== undefined ? opt.id : "");
    const lbl = opt.label !== undefined ? opt.label : (opt.name !== undefined ? opt.name : (opt.typeName !== undefined ? opt.typeName : val));
    return { value: val, label: lbl };
  });

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (disabled) return;
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block w-full text-left" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={[
          "flex w-full items-center justify-between outline-none transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
          className
        ].join(" ")}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <span 
          className="material-symbols-outlined ml-2 text-[20px] transition-transform duration-200" 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          keyboard_arrow_down
        </span>
      </button>

      {isOpen && (
        <ul
          className={[
            "absolute z-[99] mt-1.5 max-h-60 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-1 text-sm font-semibold shadow-xl outline-none focus:outline-none dark:border-white/10 dark:bg-[#11100c]",
            align === "right" ? "right-0" : "left-0",
            popupClassName
          ].join(" ")}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={[
                  "relative cursor-pointer select-none rounded-xl px-4 py-2.5 transition duration-200 text-left",
                  isSelected
                    ? "bg-blue-500 text-white dark:bg-blue-600 dark:text-[#fbf4e7]"
                    : "text-slate-700 hover:bg-slate-100 dark:text-[#fbf4e7] dark:hover:bg-white/5"
                ].join(" ")}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
