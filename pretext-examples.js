/**
 * PRETEXT INTEGRATION - QUICK REFERENCE
 * 
 * This file demonstrates common use cases for Pretext in your CV website
 */

import {
    measureTextHeight,
    getTextLines,
    calculatePortfolioTextMetrics,
    autoSizeContainer,
    getTextNaturalWidth,
    willTextOverflow,
    truncateToWidth,
    batchMeasureText,
    findOptimalWidth,
    logMeasurementPerformance
} from './pretext-utils.js'

// ============================================
// TASK 1: Measure portfolio item text
// ============================================
function optimizePortfolioItem(text, containerWidth) {
    const metrics = calculatePortfolioTextMetrics(
        text,
        '14px Arial',
        containerWidth,
        20  // line height
    )
    
    console.log('Portfolio metrics:', {
        height: metrics.height,
        lineCount: metrics.lineCount,
        willOverflow: metrics.willOverflow,
        preview: metrics.truncatedPreview
    })
    
    return metrics
}

// Example:
// optimizePortfolioItem("Beautiful artwork...", 300)


// ============================================
// TASK 2: Auto-size a container
// ============================================
function autoSizeMyContainer(elementId) {
    const element = document.getElementById(elementId)
    if (!element) return
    
    autoSizeContainer(
        element,
        '14px Arial',
        element.offsetWidth,
        20
    )
}

// Example:
// autoSizeMyContainer('about')


// ============================================
// TASK 3: Check if text overflows
// ============================================
function checkOverflow(text, containerWidth) {
    const font = '14px Arial'
    
    if (willTextOverflow(text, font, containerWidth)) {
        const truncated = truncateToWidth(text, font, containerWidth)
        console.log('Text truncated:', truncated)
        return truncated
    }
    
    return text
}

// Example:
// checkOverflow('Very long certificate name here', 250)


// ============================================
// TASK 4: Get detailed line information
// ============================================
function getLineBreaks(text, containerWidth) {
    const { lines, height } = getTextLines(
        text,
        '14px Arial',
        containerWidth,
        20
    )
    
    console.log(`Text breaks into ${lines.length} lines, ${height}px tall`)
    lines.forEach((line, i) => {
        console.log(`Line ${i + 1}: "${line.text}" (${line.width}px wide)`)
    })
    
    return lines
}

// Example:
// getLineBreaks("Your description text here", 300)


// ============================================
// TASK 5: Batch measure multiple elements
// ============================================
function measureAllSections() {
    const sections = [
        {
            text: document.getElementById('about')?.textContent || '',
            font: '14px Arial',
            maxWidth: 300,
            lineHeight: 20,
            name: 'About'
        },
        {
            text: document.getElementById('experience')?.textContent || '',
            font: '14px Arial',
            maxWidth: 300,
            lineHeight: 20,
            name: 'Experience'
        }
    ]
    
    const results = batchMeasureText(sections)
    results.forEach(r => {
        if (r.success) {
            console.log(`${r.name}: ${r.height}px (${r.lineCount} lines)`)
        }
    })
    
    return results
}

// Example:
// measureAllSections()


// ============================================
// TASK 6: Find optimal width for text
// ============================================
function balanceText(text) {
    const result = findOptimalWidth(
        text,
        '14px Arial',
        150,   // target height
        20,    // line height
        100,   // min width
        500    // max width
    )
    
    console.log(`Optimal width: ${result.optimalWidth}px`)
    console.log(`Actual height: ${result.height}px`)
    
    return result
}

// Example:
// balanceText("Your long text that should wrap nicely...")


// ============================================
// TASK 7: Monitor measurement performance
// ============================================
function debugTextMeasurement(text) {
    logMeasurementPerformance(
        text,
        '14px Arial',
        300,
        20
    )
}

// Example:
// debugTextMeasurement("Portfolio description")


// ============================================
// TASK 8: Responsive text sizing
// ============================================
function setupResponsiveText() {
    function updateSizes() {
        // Measure all portfolio descriptions
        document.querySelectorAll('#portfolio-gallery').forEach(gallery => {
            const description = gallery.previousElementSibling
            if (description && description.tagName === 'P') {
                autoSizeContainer(
                    description,
                    '14px Arial',
                    description.offsetWidth,
                    20
                )
            }
        })
    }
    
    // Update on resize
    window.addEventListener('resize', () => {
        updateSizes()
    }, { passive: true })
    
    // Initial update
    updateSizes()
}

// Example:
// setupResponsiveText()


// ============================================
// TASK 9: Certificate title optimization
// ============================================
function optimizeCertificateTitle(titleElement, containerWidth) {
    const title = titleElement.textContent
    const font = '14px Arial'
    
    // Check if title needs truncation
    if (willTextOverflow(title, font, containerWidth)) {
        titleElement.textContent = truncateToWidth(title, font, containerWidth)
        titleElement.title = title  // Show full text on hover
    }
    
    // Auto-size container
    autoSizeContainer(titleElement, font, containerWidth, 16)
}

// Example:
// document.querySelectorAll('.certificate-title').forEach(el => {
//     optimizeCertificateTitle(el, 250)
// })


// ============================================
// TASK 10: Get text width without wrapping
// ============================================
function getNaturalWidth(text) {
    const width = getTextNaturalWidth(text, '14px Arial')
    console.log(`Text "${text}" is ${width}px wide (unwrapped)`)
    return width
}

// Example:
// getNaturalWidth("Certificate Name")


// ============================================
// HELPER: Initialize all optimizations
// ============================================
export function initializeAllOptimizations() {
    console.log('Initializing Pretext optimizations...')
    
    // Auto-size all text sections
    document.querySelectorAll('#scroll-sections section').forEach(section => {
        section.querySelectorAll('p, li').forEach(element => {
            autoSizeContainer(
                element,
                '14px Arial',
                element.offsetWidth,
                20
            )
        })
    })
    
    // Re-optimize on resize
    window.addEventListener('resize', () => {
        document.querySelectorAll('#scroll-sections section').forEach(section => {
            section.querySelectorAll('p, li').forEach(element => {
                autoSizeContainer(
                    element,
                    '14px Arial',
                    element.offsetWidth,
                    20
                )
            })
        })
    }, { passive: true })
    
    console.log('Pretext optimizations initialized!')
}

// Call this on DOMContentLoaded:
// window.addEventListener('DOMContentLoaded', initializeAllOptimizations)
