import { prepare, layout, prepareWithSegments, layoutWithLines, walkLineRanges } from '@chenglou/pretext'

export function measureTextHeight(text, font, maxWidth, lineHeight) {
  try {
    const prepared = prepare(text, font)
    const { height, lineCount } = layout(prepared, maxWidth, lineHeight)
    return { height, lineCount, success: true }
  } catch (error) {
    console.error('Error measuring text height:', error)
    return { height: 0, lineCount: 0, success: false }
  }
}

export function getTextLines(text, font, maxWidth, lineHeight) {
  try {
    const prepared = prepareWithSegments(text, font)
    const { height, lineCount, lines } = layoutWithLines(prepared, maxWidth, lineHeight)
    return { lines, height, lineCount, success: true }
  } catch (error) {
    console.error('Error getting text lines:', error)
    return { lines: [], height: 0, lineCount: 0, success: false }
  }
}

export function findOptimalWidth(text, font, targetHeight, lineHeight, minWidth = 100, maxWidth = 1000) {
  try {
    const prepared = prepareWithSegments(text, font)
    let bestWidth = maxWidth
    let bestHeight = Infinity
    let bestLayout = null
    let low = minWidth
    let high = maxWidth

    while (high - low > 10) {
      const mid = Math.floor((low + high) / 2)
      const { height, lineCount, lines } = layoutWithLines(prepared, mid, lineHeight)

      if (height <= targetHeight) {
        bestWidth = mid
        bestHeight = height
        bestLayout = { height, lineCount, lines }
        high = mid
      } else {
        low = mid + 1
      }
    }

    return {
      optimalWidth: bestWidth,
      height: bestHeight,
      layout: bestLayout,
      success: true
    }
  } catch (error) {
    console.error('Error finding optimal width:', error)
    return { optimalWidth: maxWidth, height: 0, layout: null, success: false }
  }
}

export function autoSizeContainer(element, font, maxWidth, lineHeight) {
  if (!element) return

  const text = element.textContent || element.innerText
  if (!text) return

  const { height, success } = measureTextHeight(text, font, maxWidth, lineHeight)

  if (success) {
    element.style.minHeight = `${height + 20}px` // Add small padding
  }
}

export function getTextNaturalWidth(text, font) {
  try {
    const prepared = prepareWithSegments(text, font)
    const { lines } = layoutWithLines(prepared, 10000, 20)
    if (lines.length > 0) {
      return Math.max(...lines.map(line => line.width))
    }
    return 0
  } catch (error) {
    console.error('Error getting natural width:', error)
    return 0
  }
}

export function willTextOverflow(text, font, containerWidth) {
  const naturalWidth = getTextNaturalWidth(text, font)
  return naturalWidth > containerWidth
}

export function truncateToWidth(text, font, maxWidth, ellipsis = '...') {
  try {
    if (getTextNaturalWidth(text, font) <= maxWidth) {
      return text
    }

    const prepared = prepareWithSegments(text, font)
    let truncated = ''

    for (let i = text.length; i > 0; i--) {
      const testText = text.substring(0, i) + ellipsis
      if (getTextNaturalWidth(testText, font) <= maxWidth) {
        return testText
      }
    }

    return ellipsis
  } catch (error) {
    console.error('Error truncating text:', error)
    return text
  }
}

export function calculatePortfolioTextMetrics(description, font, containerWidth, lineHeight) {
  try {
    const { lines, height, lineCount, success } = getTextLines(description, font, containerWidth, lineHeight)

    if (!success) {
      return { height: 0, lineCount: 0, lines: [], success: false }
    }

    return {
      height,
      lineCount,
      lines,
      willOverflow: lineCount > 3, // Flag if description is very long
      truncatedPreview: lineCount <= 2 ? description : lines.slice(0, 2).map(l => l.text).join(' ') + '...',
      success: true
    }
  } catch (error) {
    console.error('Error calculating portfolio metrics:', error)
    return { height: 0, lineCount: 0, lines: [], willOverflow: false, truncatedPreview: '', success: false }
  }
}

export function batchMeasureText(items) {
  return items.map(item => {
    try {
      const { height, lineCount } = measureTextHeight(
        item.text,
        item.font,
        item.maxWidth || 300,
        item.lineHeight || 20
      )
      return { ...item, height, lineCount, success: true }
    } catch (error) {
      console.error(`Error measuring "${item.text}"`, error)
      return { ...item, height: 0, lineCount: 0, success: false }
    }
  })
}

export function initializeAutoSizing() {
  const elementsToSize = document.querySelectorAll('[data-pretext-font]')

  elementsToSize.forEach(element => {
    const font = element.getAttribute('data-pretext-font')
    const maxWidth = parseFloat(element.getAttribute('data-pretext-width')) || element.offsetWidth
    const lineHeight = parseFloat(element.getAttribute('data-pretext-lineheight')) || 20

    autoSizeContainer(element, font, maxWidth, lineHeight)
    window.addEventListener('resize', () => {
      const currentWidth = parseFloat(element.getAttribute('data-pretext-width')) || element.offsetWidth
      autoSizeContainer(element, font, currentWidth, lineHeight)
    }, { passive: true })
  })
}

export function initializeMutationObserver() {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        const newElements = mutation.addedNodes
        newElements.forEach(node => {
          if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute('data-pretext-font')) {
            const font = node.getAttribute('data-pretext-font')
            const maxWidth = parseFloat(node.getAttribute('data-pretext-width')) || node.offsetWidth
            const lineHeight = parseFloat(node.getAttribute('data-pretext-lineheight')) || 20
            autoSizeContainer(node, font, maxWidth, lineHeight)
          }
        })
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  return observer
}

export function logMeasurementPerformance(text, font, maxWidth, lineHeight) {
  const start = performance.now()
  const result = measureTextHeight(text, font, maxWidth, lineHeight)
  const end = performance.now()

  console.log(`Text measurement took ${(end - start).toFixed(2)}ms`, {
    text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
    font,
    maxWidth,
    lineHeight,
    ...result,
    duration: (end - start).toFixed(2) + 'ms'
  })

  return result
}
