import { showError } from "./error-warning"
import { fetchPreviewStatusAndUpdateUI } from "./preview-status"

/**
 * This file is printed out in preview-template.php
 * initialState global comes from preview-template.php above where this is printed to the page
 */
;(async () => {
	try {
		await start()
	} catch (e) {
		console.error(e)
		if (document.readyState === "complete" || document.readyState === "loaded") {
			// document is already ready to go so show the error
			showError(e)
		} else {
			// otherwise wait for it to load before showing the error
			document.addEventListener("DOMContentLoaded", () => {
				showError(e)
			})
		}
	}
})()

async function start() {
	const [, fetchResponse] = await Promise.all([
		// optimistically try to load the UI
		initialState.previewWebhookIsOnline && fetchPreviewStatusAndUpdateUI(),
		// Also check if the frontend has been online
		// since the last backend check
		fetch(initialState.previewFrontendUrl),
	])

	if (fetchResponse.ok) {
		// if the response came back ok and we haven't already started loading the UI
		if (!initialState.previewWebhookIsOnline) {
			// start loading it because the frontend actually is online
			await fetchPreviewStatusAndUpdateUI()
		}
	} else {
		// otherwise throwing this will display the error UI
		throw Error(`The Gatsby Preview instance can't be reached.`)
	}
}