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
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm">{label}</label>
        <label className="flex items-center gap-2 text-xs opacity-70 cursor-pointer">
          <input
            type="checkbox"
            checked={!!gradientActif}
            onChange={(e) => onChangeGradientActif(e.target.checked)}
          />
          Activer un dégradé
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={couleur || couleurDefaut}
          onChange={(e) => onChangeCouleur(e.target.value)}
          className="w-12 h-12 rounded-lg border border-brand-border cursor-pointer"
        />
        <span className="text-sm font-mono">{couleur || couleurDefaut}</span>

        {gradientActif && (
          <>
            <span className="text-xs opacity-40">→</span>
            <input
              type="color"
              value={gradientFin || "#000000"}
              onChange={(e) => onChangeGradientFin(e.target.value)}
              className="w-12 h-12 rounded-lg border border-brand-border cursor-pointer"
            />
            <span className="text-sm font-mono">{gradientFin}</span>
          </>
        )}
      </div>

      {gradientActif && (
        <div className="mt-3">
          <label className="block text-sm mb-2">Style du dégradé</label>
          <select
            value={gradientStyle || STYLES_DEGRADE[0].valeur}
            onChange={(e) => onChangeGradientStyle(e.target.value)}
            className="w-full px-4 py-3 border border-brand-border rounded-lg bg-white mb-3"
          >
            {STYLES_DEGRADE.map(({ valeur, label: labelStyle }) => (
              <option key={valeur} value={valeur}>
                {labelStyle}
              </option>
            ))}
          </select>

          {couleur && gradientFin && (
            <div
              className="h-12 rounded-lg border border-brand-border"
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
