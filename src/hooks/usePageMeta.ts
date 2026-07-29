import { useEffect } from 'react'

const SITE_NAME = 'Aurexiva Products'
const DEFAULT_DESCRIPTION =
  'Aurexiva Products - Handcrafted luxury footwear, organic clothing, and premium electronics designed for refined modern lifestyles.'

/** Sets document.title and meta description for the current page. This is a
 *  client-rendered SPA with a single static index.html, so without this
 *  every route would show the exact same title/description in search
 *  results and browser tabs — including individual product pages. */
export const usePageMeta = (title: string, description: string = DEFAULT_DESCRIPTION) => {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
  }, [title, description])
}
