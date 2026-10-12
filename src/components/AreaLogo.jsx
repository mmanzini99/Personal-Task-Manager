export default function AreaLogo({ area, size = 32 }) {
  const style = { width: size, height: size }
  if (area.logo_url) {
    return <img className="area-logo" src={area.logo_url} alt={area.name} style={style} draggable="false" />
  }
  return (
    <span
      className="area-logo area-logo--initial"
      style={{ ...style, background: area.color, fontSize: Math.round(size * 0.45) }}
      aria-label={area.name}
    >
      {area.name.charAt(0).toUpperCase()}
    </span>
  )
}
