// FamFood Deep Link Handler
// Handles opening recipe in FamFood app or redirecting to app stores

function openInApp() {
    const recipeUrl = window.location.href;
    const deepLink = `famfood://recipe/import?url=${encodeURIComponent(recipeUrl)}`;

    // FamFood App Store URLs
    const appStoreUrl = 'https://apps.apple.com/de/app/famfood-dein-familienkochbuch/id6746147366';
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=app.famfood.mobile&hl=de';

    // Detect platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);

    // Try to open deep link
    window.location.href = deepLink;

    // Fallback to app store after delay
    setTimeout(() => {
        if (isIOS) {
            window.location.href = appStoreUrl;
        } else if (isAndroid) {
            window.location.href = playStoreUrl;
        } else {
            // Desktop - show message
            alert('Bitte öffne diesen Link auf deinem Smartphone, um das Rezept in der FamFood App zu speichern!');
        }
    }, 1500);
}

// Social Share Functions
function shareOnWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.querySelector('h1').textContent);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
}

function shareOnInstagram() {
    // Instagram doesn't support direct web sharing, so we copy URL to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link wurde in die Zwischenablage kopiert! Füge ihn in deiner Instagram Story ein.');
    });
}

// Expose functions globally
window.openInApp = openInApp;
window.shareOnWhatsApp = shareOnWhatsApp;
window.shareOnInstagram = shareOnInstagram;
