import { useEffect, useRef } from 'react'
import { useDebounce } from 'use-debounce'
import { colord } from "../utils/colord";

const ICON_SIZE = 64;

export const useFavicon = (color: string) => {
  const [faviconColor] = useDebounce(color, 500);
  const canvas = useRef<HTMLCanvasElement>();
  const faviconNode = useRef<HTMLLinkElement>();

  useEffect(() => {
    // generate a favicon only once on mobiles in order to improve performance
    if (window.innerWidth < 768 && faviconNode.current) return;

    // create canvas on first render
    if (!canvas.current) {
      canvas.current = document.createElement("canvas");
      canvas.current.width = ICON_SIZE;
      canvas.current.height = ICON_SIZE;
    }

    const ctx = canvas.current.getContext("2d");
    if (!ctx) return;

    // draw favicon
    ctx.fillStyle = colord(faviconColor).alpha(1).toHex()
    ctx.fillRect(0, 0, ICON_SIZE, ICON_SIZE);

    // create a new favicon tag
    const link = document.createElement("link");
    link.rel = "shortcut icon";
    link.href = canvas.current.toDataURL("image/x-icon");

    // remove the old favicon from the document
    if (faviconNode.current) document.head.removeChild(faviconNode.current);

    // add the new link tag to the page
    document.head.appendChild(link);
    faviconNode.current = link;
  }, [faviconColor])
}
