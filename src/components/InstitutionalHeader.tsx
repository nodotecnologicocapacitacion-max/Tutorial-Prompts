import React, { useState } from "react";

export const InstitutionalHeader: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      role="banner"
      aria-label="Encabezado Institucional — Catamarca Capital y Nodo Tecnológico"
      className="w-full bg-white border-b border-slate-200"
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center">
        {!imgError ? (
          <img
            src="/header-institucional.svg"
            alt="Catamarca Capital · Secretaría de Gobierno y Coordinación · Dirección General de Recursos Humanos · Nodo Tecnológico"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full max-w-[1080px] h-auto max-h-20 object-contain select-none"
          />
        ) : (
          <div className="w-full max-w-[1080px] py-2 flex flex-wrap items-center justify-between gap-4 text-[#041E49]">
            <div className="font-extrabold text-lg leading-tight">
              <div>Catamarca</div>
              <div>Capital.</div>
            </div>
            <div className="h-8 w-0.5 bg-[#041E49] hidden sm:block" />
            <div className="text-xs sm:text-sm leading-tight">
              <div className="font-medium">Secretaría de</div>
              <div className="font-bold">Gobierno y Coordinación</div>
            </div>
            <div className="h-8 w-0.5 bg-[#041E49] hidden sm:block" />
            <div className="text-xs sm:text-sm leading-tight">
              <div className="font-medium">Dirección General de</div>
              <div className="font-bold">Recursos Humanos</div>
            </div>
            <div className="text-[#59B2E8] font-bold tracking-wider text-base">
              nODO <span className="block text-[10px] tracking-[0.35em]">TECNOLÓGICO</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
