// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

document.getElementById("flexSwitchCheckChecked").addEventListener("change", async () => {
    document.getElementById("notificationsText").textContent="newtext";
})
