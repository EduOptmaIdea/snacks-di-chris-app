export const trackEvent = (action, params = {}) => {
    // Fallback quando GA está bloqueado
    if (window.gtag) {
        try {
            gtag('event', action, params);
        } catch (e) {
            console.log('GA error:', e);
            localStorage.setItem('ga_fallback', JSON.stringify({ action, params }));
        }
    } else {
        console.log('GA blocked - logging locally:', action, params);
        const gaEvents = JSON.parse(localStorage.getItem('ga_events') || []);
        gaEvents.push({ action, params, timestamp: new Date() });
        localStorage.setItem('ga_events', JSON.stringify(gaEvents));
    }
};