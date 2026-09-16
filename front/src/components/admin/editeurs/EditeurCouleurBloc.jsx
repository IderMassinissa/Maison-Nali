import { STYLES_DEGRADE, construireDegradeCss } from "../../../utils/degrade";

// Sous-composant réutilisable : couleur principale + dégradé optionnel (activation,
// couleur de fin, style). Utilisé par les éditeurs de bloc (content JSON) et par
// GestionTheme (settings globaux) — API identique, seul le state parent change.
export default function EditeurCouleurBloc({
  label,
  couleurDefaut,
  couleur,
  gradientActif,
  gradientFin,
  gradientStyle,
  onChangeCouleur,
  onChangeGradientActif,
  onChangeGradientFin,
  onChangeGradientStyle,
}) {
  return (
    <div className="border border-brand-border rounded-2xl bg-brand-surface/40 p-5">
      <div className="flex items-center justify-between mb-5">
        <label className="text-sm uppercase tracking-widest opacity-60">
          {label}
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!!gradientActif}
            onChange={(e) => onChangeGradientActif(e.target.checked)}
            className="w-4 h-4"
          />
          Activer un dégradé
        </label>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="color"
          value={couleur || couleurDefaut}
          onChange={(e) => onChangeCouleur(e.target.value)}
          className="w-14 h-14 rounded-lg border border-brand-border cursor-pointer shrink-0"
        />
        <span className="text-sm font-mono opacity-70">
          {couleur || couleurDefaut}
        </span>

        {gradientActif && (
          <>
            <span className="opacity-30 text-lg">→</span>
            <input
              type="color"
              value={gradientFin || "#000000"}
              onChange={(e) => onChangeGradientFin(e.target.value)}
              className="w-14 h-14 rounded-lg border border-brand-border cursor-pointer shrink-0"
            />
            <span className="text-sm font-mono opacity-70">{gradientFin}</span>
          </>
        )}
      </div>

      {gradientActif && (
        <div className="mt-5 pt-5 border-t border-brand-border/60 pl-1">
          <label className="block text-sm uppercase tracking-widest opacity-60 mb-2">
            Style du dégradé
          </label>
          <select
            value={gradientStyle || STYLES_DEGRADE[0].valeur}
            onChange={(e) => onChangeGradientStyle(e.target.value)}
            className="w-full px-5 py-3.5 border border-brand-border rounded-lg bg-white text-base mb-4"
          >
            {STYLES_DEGRADE.map(({ valeur, label: labelStyle }) => (
              <option key={valeur} value={valeur}>
                {labelStyle}
              </option>
            ))}
          </select>

          {couleur && gradientFin && (
            <div
              className="h-14 rounded-lg border border-brand-border"
              style={{
                backgroundImage: construireDegradeCss(
                  gradientStyle || STYLES_DEGRADE[0].valeur,
                  couleur,
                  gradientFin,
                ),
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
