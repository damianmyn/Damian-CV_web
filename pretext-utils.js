/**
 * Pretext Utility Module
 * Provides text measurement and layout utilities for the CV website
 * Uses @chenglou/pretext for accurate text measurement without DOM reflow
 */

import { prepare, layout, prepareWithSegments, layoutWithLines, walkLineRanges } from '@chenglou/pretext'

/**
 * Measure text height without touching the DOM
 * @param {string} text - The text to measure
 * @param {string} font - Font specification (e.g., '16px Arial')
 * @param {number} maxWidth - Maximum width constraint in pixels
 * @param {number} lineHeight - Line height in pixels
 * @returns {Object} Object with height and lineCount properties
 */
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

/**
 * Get detailed line information for text layout
 * @param {string} text - The text to layout
 * @param {string} font - Font specification (e.g., '16px Arial')
 * @param {number} maxWidth - Maximum width constraint in pixels
 * @param {number} lineHeight - Line height in pixels
 * @returns {Object} Object with lines array and height information
 */
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

/**
 * Find the optimal width to fit text in a given height
 * Useful for responsive containers that need balanced text layout
 * @param {string} text - The text to fit
 * @param {string} font - Font specification
 * @param {number} targetHeight - Target height constraint
 * @param {number} lineHeight - Line height in pixels
 * @param {number} minWidth - Minimum width to try
 * @param {number} maxWidth - Maximum width to try
 * @returns {Object} Object with optimal width and layout info
 */
export function findOptimalWidth(text, font, targetHeight, lineHeight, minWidth = 100, maxWidth = 1000) {
  try {
    const prepared = prepareWithSegments(text, font)
    let bestWidth = maxWidth
    let bestHeight = Infinity
    let bestLayout = null

    // Binary search for optimal width
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

/**
 * Automatically adjust container height based on text content
 * @param {HTMLElement} element - The element containing text
 * @param {string} font - Font specification
 * @param {number} maxWidth - Maximum width of the container
 * @param {number} lineHeight - Line height value
 */
export function autoSizeContainer(element, font, maxWidth, lineHeight) {
  if (!element) return

  const text = element.textContent || element.innerText
  if (!text) return

  const { height, success } = measureTextHeight(text, font, maxWidth, lineHeight)

  if (success) {
    element.style.minHeight = `${height + 20}px` // Add small padding
  }
}

/**
 * Get the natural width of text (what width it needs when not wrapped)
 * @param {string} text - The text to measure
 * @param {string} font - Font specification
 * @returns {number} The natural width in pixels
 */
export function getTextNaturalWidth(text, font) {
  try {
    const prepared = prepareWithSegments(text, font)
    // Measure at a very large width to get natural width
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

/**
 * Check if text will overflow in a container without wrapping
 * @param {string} text - The text to check
 * @param {string} font - Font specification
 * @param {number} containerWidth - Width of the container
 * @returns {boolean} True if text will overflow, false otherwise
 */
export function willTextOverflow(text, font, containerWidth) {
  const naturalWidth = getTextNaturalWidth(text, font)
  return naturalWidth > containerWidth
}

/**
 * Truncate text to fit within a width constraint
 * @param {string} text - The text to truncate
 * @param {string} font - Font specification
 * @param {number} maxWidth - Maximum width in pixels
 * @param {string} ellipsis - Truncation indicator (default: '...')
 * @returns {string} Truncated text
 */
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

/**
 * Calculate text metrics for portfolio descriptions
 * @param {string} description - Portfolio item description
 * @param {string} font - Font specification
 * @param {number} containerWidth - Container width
 * @param {number} lineHeight - Line height
 * @returns {Object} Text metrics including height, line count, and lines
 */
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

/**
 * Batch measure multiple text elements (performance optimized)
 * @param {Array} items - Array of items with text and font properties
 * @returns {Array} Array of measurement results
 */
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

/**
 * Initialize automatic text sizing for elements with data attributes
 * Add data-pretext-font, data-pretext-width, data-pretext-lineheight to elements
 */
export function initializeAutoSizing() {
  const elementsToSize = document.querySelectorAll('[data-pretext-font]')

  elementsToSize.forEach(element => {
    const font = element.getAttribute('data-pretext-font')
    const maxWidth = parseFloat(element.getAttribute('data-pretext-width')) || element.offsetWidth
    const lineHeight = parseFloat(element.getAttribute('data-pretext-lineheight')) || 20

    autoSizeContainer(element, font, maxWidth, lineHeight)

    // Re-calculate on window resize
    window.addEventListener('resize', () => {
      const currentWidth = parseFloat(element.getAttribute('data-pretext-width')) || element.offsetWidth
      autoSizeContainer(element, font, currentWidth, lineHeight)
    }, { passive: true })
  })
}

/**
 * Observer to handle dynamic content updates
 * Automatically size new text elements as they're added to the DOM
 */
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

/**
 * Performance logging for text measurements
 * Use in development to monitor measurement performance
 */
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
