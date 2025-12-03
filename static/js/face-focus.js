/**
 * Face Focus - Lightweight client-side face detection and centering
 * Uses smart object-position to center faces in cropped images
 */

(function() {
	'use strict';

	// Configuration
	const SELECTORS = '.governing-body-card img, .featured-chief img';
	const DEFAULT_POSITION = { x: 50, y: 35 };
	const GRID_SIZE = 3;
	const SAMPLE_STEP = 2;

	/**
	 * Simple face detection using brightness analysis
	 * Assumes faces are typically in the upper-middle portion of portrait photos
	 */
	function detectFacePosition(img) {
		return new Promise((resolve) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			
			try {
				ctx.drawImage(img, 0, 0);
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const data = imageData.data;
				
				// Divide image into a grid and find brightest section (likely face)
				const cellWidth = canvas.width / GRID_SIZE;
				const cellHeight = canvas.height / GRID_SIZE;
				
				let maxBrightness = 0;
				let faceX = DEFAULT_POSITION.x;
				let faceY = DEFAULT_POSITION.y;
				
				for (let row = 0; row < GRID_SIZE; row++) {
					for (let col = 0; col < GRID_SIZE; col++) {
						let brightness = 0;
						let pixelCount = 0;
						
						const startX = Math.floor(col * cellWidth);
						const startY = Math.floor(row * cellHeight);
						const endX = Math.floor((col + 1) * cellWidth);
						const endY = Math.floor((row + 1) * cellHeight);
						
						for (let y = startY; y < endY; y += SAMPLE_STEP) {
							for (let x = startX; x < endX; x += SAMPLE_STEP) {
								const idx = (y * canvas.width + x) * 4;
								const r = data[idx];
								const g = data[idx + 1];
								const b = data[idx + 2];
								brightness += (r + g + b) / 3;
								pixelCount++;
							}
						}
						
						const avgBrightness = brightness / pixelCount;
						
						// Prioritize upper rows (where faces typically are)
						const rowBonus = row === 0 ? 1.2 : (row === 1 ? 1.1 : 1.0);
						const adjustedBrightness = avgBrightness * rowBonus;
						
						if (adjustedBrightness > maxBrightness) {
							maxBrightness = adjustedBrightness;
							faceX = ((col + 0.5) / GRID_SIZE) * 100;
							faceY = ((row + 0.5) / GRID_SIZE) * 100;
						}
					}
				}
				
				resolve({ x: faceX, y: faceY });
			} catch (e) {
				// If canvas operations fail (e.g., CORS), use default position
				resolve(DEFAULT_POSITION);
			}
		});
	}

	/**
	 * Apply face-focusing to all governing body images
	 */
	async function applyFaceFocus() {
		const images = document.querySelectorAll(SELECTORS);
		
		for (const img of images) {
			// Skip if image hasn't loaded yet
			if (!img.complete || img.naturalWidth === 0) {
				img.addEventListener('load', () => applyFocusToImage(img), { once: true });
			} else {
				await applyFocusToImage(img);
			}
		}
	}

	async function applyFocusToImage(img) {
		// Skip if already processed
		if (img.dataset.faceFocusApplied === 'true') {
			return;
		}
		img.dataset.faceFocusApplied = 'true';
		
		const position = await detectFacePosition(img);
		img.style.objectPosition = `${position.x}% ${position.y}%`;
	}

	// Run on page load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', applyFaceFocus, { once: true });
	} else {
		applyFaceFocus();
	}
})();
