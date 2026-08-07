'use client'

import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import { Check, ChevronDown } from '@/components/icons'

export type MenuOption = {
  value: string
  label: string
  /** Right-aligned tally. Omitted where a count would mean nothing, as on sort. */
  count?: number
}

type Props = {
  /** Funnel or sort arrows — the mark that says what the control does. */
  icon: React.ReactNode
  /** Names the control for a screen reader, e.g. "Filter by topic". */
  label: string
  options: MenuOption[]
  value: string
  onChange: (value: string) => void
}

/**
 * A menu button that picks one of a list.
 *
 * The newsroom's topic filter was a row of pills, which is a good control right
 * up to the point where there are more topics than fit on a line — then it is a
 * wall of pills that wraps three deep and pushes the feed off the screen. A menu
 * costs one click and is the same size at four topics or forty.
 *
 * Built rather than borrowed because the site ships no UI library and this is
 * the whole of what the pattern needs: a button, a list, and the keyboard
 * handling that makes it a control rather than a div that responds to mice.
 * Roles are menu/menuitemradio, and focus moves to the rows themselves rather
 * than being tracked with aria-activedescendant — with real focus, :focus-visible
 * does the highlighting and there is no second notion of "current row" to keep
 * in sync with the first.
 */
export default function FilterMenu({ icon, label, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const selected = options.find((option) => option.value === value) ?? options[0]

  const close = useCallback((returnFocus = true) => {
    setOpen(false)
    // preventScroll, because the reader is looking at the feed the control just
    // changed. Choosing a topic makes the page shorter, and a plain focus() then
    // scrolls the button back into view — a small jump, in the middle of a
    // control that exists to stop this page jumping. The button was on screen a
    // moment ago by definition; there is nothing to scroll to.
    if (returnFocus) buttonRef.current?.focus({ preventScroll: true })
  }, [])

  // Focus the checked row on open, so the keyboard lands where the eye does.
  useEffect(() => {
    if (!open) return
    const rows = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')
    const checked = listRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
    ;(checked ?? rows?.[0])?.focus()
  }, [open])

  // Pointer down rather than click: a click that starts inside the menu and ends
  // outside it is a drag, not a dismissal.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, close])

  const moveFocus = (from: HTMLElement, delta: number) => {
    const rows = [
      ...(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []),
    ]
    const next = rows[(rows.indexOf(from as HTMLButtonElement) + delta + rows.length) % rows.length]
    next?.focus()
  }

  const onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveFocus(target, 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveFocus(target, -1)
        break
      case 'Home':
        event.preventDefault()
        listRef.current?.querySelector<HTMLButtonElement>('[role="menuitemradio"]')?.focus()
        break
      case 'End': {
        event.preventDefault()
        const rows = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')
        rows?.[rows.length - 1]?.focus()
        break
      }
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'Tab':
        // Let focus leave naturally; the menu just stops existing behind it.
        close(false)
        break
    }
  }

  return (
    <div className="filter-menu" ref={rootRef}>
      <button
        type="button"
        ref={buttonRef}
        className="filter-menu-button"
        // The control's purpose, then its current value: "Filter by topic, Web
        // Design" rather than a bare topic name with no clue what it does. The
        // visible text is kept inside the name so voice control still works.
        aria-label={`${label}, ${selected?.label ?? ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
          }
        }}
      >
        {icon}
        <span className="filter-menu-label">{selected?.label}</span>
        <ChevronDown />
      </button>

      {open && (
        <div
          id={menuId}
          ref={listRef}
          role="menu"
          aria-label={label}
          className="filter-menu-list"
          onKeyDown={onListKeyDown}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              className="filter-menu-item"
              onClick={() => {
                onChange(option.value)
                close()
              }}
            >
              <span className="filter-menu-item-check">
                {option.value === value && <Check />}
              </span>
              <span className="filter-menu-item-label">{option.label}</span>
              {option.count !== undefined && (
                <span className="filter-menu-item-count">{option.count}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
