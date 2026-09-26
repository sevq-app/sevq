interface BookmarkTagProps {
  size?: number;
  className?: string;
}

/**
 * Закладка для системного чата "Избранное" — приземистая (шире, чем выше),
 * с мягко скруглённым вырезом снизу вместо острого пика.
 */
export function BookmarkTag({ size = 24, className }: BookmarkTagProps) {
  const height = Math.round((size * 24) / 28);
  return (
    <svg width={size} height={height} viewBox="0 0 28 24" fill="white" className={className}>
      <path
        d="
          M8,2
          L20,2
          Q25,2 25,7
          L25,17.5
          Q25,20.3 22.4,19.1
          L16,16.3
          Q14,14.6 12,16.3
          L5.6,19.1
          Q3,20.3 3,17.5
          L3,7
          Q3,2 8,2
          Z"
      />
    </svg>
  );
}
