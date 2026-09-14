import { cn } from '@/lib/utils'

/**
 * DoomSSH mark: a D whose top-left corner folds like a page. The tile takes the
 * foreground colour and the letter the background, so it inverts with the theme.
 * Static copies live in public/logo.svg and app/icon.svg.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className={cn('size-5 shrink-0', className)}>
      <rect width="512" height="512" rx="116" className="fill-foreground" />
      <path
        className="fill-background"
        fillRule="evenodd"
        d="M214 116 H262 A140 140 0 0 1 262 396 H150 V180 Z M214 180 V332 H262 A76 76 0 0 0 262 180 Z"
      />
      <path className="fill-background opacity-60" d="M150 180 H214 V116 Z" />
    </svg>
  )
}
