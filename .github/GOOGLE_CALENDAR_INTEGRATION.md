# Google Calendar Integration

## Overview

The homepage now integrates events from the Waccamaw tribe's Google Calendar alongside Hugo-generated events and meetings from the API.

## Calendar Source

- **Calendar ID**: `nativecalendar13@gmail.com`
- **Public URL**: https://calendar.google.com/calendar/embed?src=nativecalendar13%40gmail.com&ctz=America%2FNew_York
- **iCal Feed**: https://calendar.google.com/calendar/ical/nativecalendar13%40gmail.com/public/basic.ics

## How It Works

### 1. Fetch Calendar Data

The homepage JavaScript fetches the public iCal feed from Google Calendar:

```javascript
const icalUrl = `https://calendar.google.com/calendar/ical/${calendarId}/public/basic.ics`;
const response = await fetch(icalUrl);
const icalData = await response.text();
```

### 2. Parse iCal Format

The `parseICalEvents()` function parses the iCal data to extract:
- **SUMMARY**: Event title
- **DTSTART**: Event date/time
- **DESCRIPTION**: Event description
- **LOCATION**: Event location
- **URL**: Event URL (if provided)

### 3. Combine Event Sources

All events from different sources are combined:
- Hugo site events (posts with "events" category)
- Google Calendar events
- Meetings from the meetings API (when available)

```javascript
const allEvents = [...hugoEvents, ...googleEvents];
```

### 4. Display Upcoming Events

Events are filtered for future dates, sorted chronologically, and displayed in the "Upcoming Meetings & Events" section with:
- Month and day badge
- Event title
- Event type ("Calendar Event" for Google Calendar events)
- Location (if provided)

## Event Types

The system now recognizes three event types:

1. **`event`**: Hugo site events (from posts with "events" category)
2. **`calendar-event`**: Google Calendar events
3. **`meeting`**: Tribal meetings from the meetings API

## Features

### Calendar Events Display

- **External links**: Calendar events open in a new tab (`target="_blank"`)
- **Location display**: Shows location if provided (e.g., "Calendar Event • Tribal Grounds")
- **Fallback handling**: Events display even if the meetings API is unavailable

### Error Handling

- **Network failures**: Gracefully handles Google Calendar fetch failures
- **CORS issues**: Falls back to empty array if calendar cannot be fetched
- **Console logging**: Detailed logs for debugging (`[Google Calendar]` prefix)

## iCal Date Formats

The parser handles two iCal date formats:

1. **Date-time**: `YYYYMMDDTHHMMSSZ` (e.g., `20250222T183000Z`)
   - Converted to: `YYYY-MM-DDTHH:MM:SSZ`
   
2. **All-day**: `YYYYMMDD` (e.g., `20250222`)
   - Converted to: `YYYY-MM-DDT00:00:00Z`

## Calendar Management

### Adding Events to Google Calendar

1. Log in to Google Calendar with the `nativecalendar13@gmail.com` account
2. Create a new event with:
   - Title (required)
   - Date/time (required)
   - Location (optional, will display on site)
   - Description (optional)
   - URL (optional, for external event links)
3. Events appear automatically on the website within minutes

### Making Calendar Public

The calendar must be set to **public** for the iCal feed to work:

1. Open Google Calendar settings for `nativecalendar13@gmail.com`
2. Go to "Access permissions"
3. Check "Make available to public"
4. Verify the public iCal URL is accessible

## Testing

### Browser Console

Open browser DevTools (F12) and check console logs:

```
[Google Calendar] Fetching events...
[Google Calendar] Fetched events: [...]
[Homepage] Hugo events found: [...]
[Homepage] All events combined: [...]
[Homepage] Upcoming events: [...]
```

### Local Testing

```bash
# Hugo is already running on port 1313
# Visit: http://localhost:1313/
```

Check that:
- Google Calendar events appear in "Upcoming Meetings & Events"
- Events show "Calendar Event" type
- Location displays if provided
- Links open in new tab

## Troubleshooting

### No Calendar Events Appearing

**Check console logs**:
- Look for `[Google Calendar] Fetching events...`
- Check for fetch errors or CORS issues

**Verify calendar is public**:
- Try accessing the iCal URL directly in browser
- Should download a `.ics` file with event data

**Check date filtering**:
- Only future events display
- Past events are filtered out
- Verify event dates are correct in Google Calendar

### CORS Issues

If the browser blocks the fetch request due to CORS:

**Option 1**: Use a CORS proxy (temporary solution)
```javascript
const proxyUrl = 'https://corsproxy.io/?';
const response = await fetch(proxyUrl + icalUrl);
```

**Option 2**: Create a Cloudflare Worker proxy (recommended)
- Add to `apps/` directory
- Create simple proxy endpoint
- Update fetch URL in homepage JavaScript

### Invalid Date Formats

The parser expects standard iCal date formats. If dates don't parse:

1. Check console for parsing errors
2. Verify iCal feed structure
3. Update `parseICalEvents()` function to handle edge cases

## Code Locations

- **Homepage template**: `/workspaces/waccamaw/layouts/index.html`
  - Lines ~469-550: iCal parser and Google Calendar fetch
  - Lines ~550-680: Event display logic
  
- **Generated output**: `/workspaces/waccamaw/public/index.html`
  - Contains compiled JavaScript with event data

## Future Enhancements

### Potential Improvements

1. **Event descriptions**: Display event descriptions in a tooltip or modal
2. **Time display**: Show event time, not just date
3. **Recurring events**: Better handling of recurring calendar events
4. **Multiple calendars**: Support multiple Google Calendar sources
5. **Caching**: Cache calendar data to reduce fetch requests
6. **Event categories**: Parse and display event categories from calendar

### Performance Optimization

- Consider caching iCal data in localStorage
- Implement rate limiting for calendar fetches
- Add service worker for offline event access

## Related Documentation

- [Homepage Events](../README.md) - Overall site documentation
- [Micro.blog Posting Guide](./MICROBLOG_POSTING_GUIDE.md) - Adding Hugo site events
- [Meetings Service](../apps/meetings-service/README.md) - Meetings API integration

## Changelog

### 2025-12-23
- Initial implementation of Google Calendar integration
- Added iCal parser for event extraction
- Integrated calendar events with Hugo events and meetings
- Added location display for calendar events
- Implemented external link handling for calendar events
