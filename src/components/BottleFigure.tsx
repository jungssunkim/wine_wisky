import type { Bottle } from "../types";

export function BottleFigure({ bottle, empty = false, onClick }: {
  bottle: Bottle; empty?: boolean; onClick?: () => void;
}) {
  const classes = "bottle bottle--" + bottle.shape + " bottle--" + bottle.tone;
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={"bottle-item " + (empty ? "is-empty" : "")} onClick={onClick} aria-label={bottle.name}>
      <div className={classes}>
        <div className="bottle-cap" />
        <div className="bottle-neck" />
        <div className="bottle-body">
          <div className="bottle-glass-shine" />
          <div className="bottle-label">
            <span className="label-brand">{bottle.brand.slice(0, 12)}</span>
            <strong>{bottle.shortName}</strong>
            <small>{bottle.abv}%</small>
          </div>
          {empty && <div className="empty-line" />}
        </div>
      </div>
      <span className="bottle-name">{bottle.shortName}</span>
    </Tag>
  );
}

