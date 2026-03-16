/**
 * MT5 sends datetime in broker server timezone (EET = Europe/Athens).
 * This converts to Italian time (CET = Europe/Rome).
 * Handles DST automatically for both timezones.
 */
export function formatBrokerToItalian(isoString) {
    if (!isoString) return '--:--';

    const s = String(isoString);
    const hasTimezone = s.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(s);

    // If already has timezone info (e.g. from backend UTC), just convert to Rome
    if (hasTimezone) {
        const date = new Date(s);
        if (isNaN(date.getTime())) return '--:--';
        return date.toLocaleString('it-IT', {
            timeZone: 'Europe/Rome',
            day: '2-digit', month: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    }

    // No timezone = broker time (EET). Treat as UTC temporarily, then correct.
    const asUtc = new Date(s + 'Z');
    if (isNaN(asUtc.getTime())) return '--:--';

    // Find broker timezone (Europe/Athens) UTC offset at this moment
    const getParts = (date, tz) => {
        const map = {};
        new Intl.DateTimeFormat('en-US', {
            timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
        }).formatToParts(date).forEach(({ type, value }) => {
            map[type] = parseInt(value, 10);
        });
        return Date.UTC(map.year, map.month - 1, map.day, map.hour, map.minute, map.second);
    };

    const brokerOffset = getParts(asUtc, 'Europe/Athens') - getParts(asUtc, 'UTC');
    const correctedUtc = new Date(asUtc.getTime() - brokerOffset);

    return correctedUtc.toLocaleString('it-IT', {
        timeZone: 'Europe/Rome',
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}
