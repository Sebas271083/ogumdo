export default function PageHero({ eyebrow, titulo, children, className = '' }) {
  return (
    <div className={`page-hero ${className}`}>
      <div className="container">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{titulo}</h1>
        {children}
      </div>
    </div>
  )
}
