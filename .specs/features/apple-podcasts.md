# Apple Podcasts RSS Feed Specification

**Status**: Planning  
**Priority**: High  
**Created**: December 22, 2025  
**Owner**: @superterran

## Overview

Build a dynamic Apple Podcasts-compatible RSS feed endpoint that exposes public Waccamaw tribal meeting audio recordings as podcast episodes. This will enable wider distribution of tribal meetings through podcast apps like Apple Podcasts, Spotify, and others.

## Goals

- **Primary**: Enable tribal meetings to be discovered and consumed via podcast platforms
- **Secondary**: Increase accessibility and reach for tribal communications
- **Tertiary**: Preserve meeting recordings in podcast format for archival purposes

## Technical Requirements

### Endpoint Specification

**Path**: `/podcasts/feed.xml`  
**Method**: GET  
**Service**: apps/meetings-service (Cloudflare Worker)  
**Auth**: None (public endpoint)  
**Output**: RSS 2.0 XML with iTunes namespace

### RSS Feed Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <!-- Channel metadata -->
    <!-- Episode items -->
  </channel>
</rss>
```

### Required Channel Tags

| Tag | Value | Notes |
|-----|-------|-------|
| `<title>` | "Waccamaw Indian People Tribal Meetings" | Podcast name |
| `<link>` | "https://waccamaw.org/meetings/" | Podcast home page |
| `<description>` | Brief description of podcast | Max 4000 chars |
| `<language>` | "en-us" | Language code |
| `<copyright>` | "© 2025 Waccamaw Indian People" | Copyright notice |
| `<itunes:author>` | "Waccamaw Indian People" | Podcast author |
| `<itunes:email>` | "WaccamawChief@gmail.com" | Owner email |
| `<itunes:image>` | URL to square artwork (1400x1400+) | Podcast logo |
| `<itunes:category>` | "Government" / "Society & Culture" | Apple categories |
| `<itunes:explicit>` | "no" | Content rating |
| `<itunes:type>` | "episodic" | Podcast type |

### Required Item/Episode Tags

| Tag | Source Field | Notes |
|-----|--------------|-------|
| `<title>` | Meeting title | "December 2025 Open Meeting" |
| `<link>` | Meeting detail URL | Deep link to meeting page |
| `<pubDate>` | Meeting date | RFC 2822 format |
| `<guid>` | Meeting ID | Unique identifier |
| `<description>` | Meeting notes | Plain text, CDATA wrapped |
| `<enclosure>` | Audio URL | url, length (bytes), type="audio/mp4" |
| `<itunes:duration>` | Duration | HH:MM:SS format |
| `<itunes:author>` | "Waccamaw Indian People" | Episode author |
| `<itunes:explicit>` | "no" | Episode rating |
| `<itunes:episodeType>` | "full" | Episode type |

## Data Flow

```
1. GET /podcasts/feed.xml
   ↓
2. getMeetingsIndex(KV)
   ↓
3. Filter: visibility="public" AND hasRecording=true
   ↓
4. Sort by date descending
   ↓
5. Limit to 50 most recent
   ↓
6. For each meeting: getMeetingDetail(KV, id)
   ↓
7. Extract audio metadata:
   - audio_url (M4A streaming)
   - audio_download_url (M4A download)
   - audio_size_mb → convert to bytes
   - duration_minutes → convert to HH:MM:SS
   ↓
8. Build RSS XML with proper escaping
   ↓
9. Return with headers:
   - Content-Type: application/rss+xml; charset=utf-8
   - Cache-Control: public, max-age=3600
```

## Meeting Data Structure

### Index Data (from KV)

```json
{
  "id": "meeting-uuid",
  "type": "open",
  "title": "December 2025 Open Meeting",
  "date": "2025-12-05T23:58:28Z",
  "duration": 152,
  "visibility": "public",
  "hasRecording": true,
  "hasTranscript": true,
  "pathComponents": {
    "year": "2025",
    "month": "12",
    "day": "05"
  }
}
```

### Detail Data (from frontmatter in KV)

```yaml
audio_url: "https://us06web.zoom.us/rec/play/..."
audio_download_url: "https://us06web.zoom.us/rec/download/..."
audio_size_mb: 95
duration_minutes: 152
has_audio: true
```

## Implementation Plan

### Phase 1: Basic RSS Endpoint (Week 1)

1. **Add route handler** at line 378 in `apps/meetings-service/src/index.js`
   ```javascript
   app.get('/podcasts/feed.xml', async (c) => {
     // Implementation
   });
   ```

2. **Filter meetings to public with audio**
   - Use existing `getMeetingsIndex()` helper
   - Filter: `m.visibility === 'public' && m.hasRecording`
   - Sort: `sortMeetingsByDate(meetings, 'desc')`
   - Limit: `.slice(0, 50)`

3. **Fetch meeting details**
   - Loop through filtered meetings
   - Call `getMeetingDetail(c.env.MEETINGS_KV, meeting.id)`
   - Extract audio_url/audio_download_url from frontmatter
   - Skip meetings without valid audio URLs

4. **Build RSS XML generator**
   - Create `buildPodcastXML(episodes)` helper function
   - Use template literals for XML generation
   - Include all required iTunes tags
   - Proper XML escaping for special characters

5. **Add utility functions**
   - `escapeXml(text)` - Escape `<`, `>`, `&`, `"`, `'`
   - `formatDuration(minutes)` - Convert 152 → "02:32:00"
   - `formatFileSize(mb)` - Convert 95 → 99614720 bytes
   - `formatPubDate(isoDate)` - Convert to RFC 2822

### Phase 2: Audio Hosting (Week 2-3) - **BLOCKED PENDING STORAGE SOLUTION**

**Current Issue**: Zoom audio URLs are time-limited (~30 days) and may expire.

**Solution Options**:

1. **Cloudflare R2 Storage** (Recommended)
   - Upload M4A files to R2 bucket on meeting creation
   - Generate permanent public URLs
   - Update enclosure URLs to point to R2
   - Cost: ~$0.015/GB/month storage, $0.01/GB egress

2. **Cloudflare Workers KV** (Not recommended for audio)
   - 25 MB value size limit (some meetings exceed this)
   - Not designed for large binary files
   - More expensive than R2

3. **Hybrid Approach**
   - Keep recent meetings (6 months) on Zoom URLs
   - Archive older meetings to R2 storage
   - Regenerate Zoom URLs periodically via API

**Action Items**:
- [ ] Research Cloudflare R2 setup and pricing
- [ ] Design audio upload/sync workflow
- [ ] Implement R2 bucket configuration in wrangler.toml
- [ ] Create audio upload utility script
- [ ] Update meeting creation flow to upload audio
- [ ] Add URL fallback logic (R2 → Zoom → Skip)

### Phase 3: Enhancement & Testing (Week 4)

1. **Episode descriptions**
   - Extract plain text from `meeting.content.notes`
   - Strip markdown/HTML formatting
   - Limit to 500 characters
   - Fallback to generic template

2. **Podcast artwork**
   - Verify `waccamaw-seal-1400x1400.png` exists at correct path
   - Ensure HTTPS URL
   - Test image loads in Apple Podcasts

3. **Validation & Testing**
   - Test XML at https://podba.se/validate/
   - Test feed in Apple Podcasts Connect
   - Test feed in Overcast, Pocket Casts, Spotify
   - Verify enclosure URLs are publicly accessible
   - Check audio playback works

4. **Performance optimization**
   - Add 1-hour cache header
   - Consider CDN caching at Cloudflare edge
   - Monitor KV read operations usage

## Known Issues & Considerations

### 🚨 Critical

1. **Zoom URL Expiration** (High Priority)
   - Zoom audio URLs expire after ~30 days
   - **BLOCKER**: Must implement permanent audio hosting before launch
   - See Phase 2 for storage solutions

2. **Audio Format Compatibility**
   - Zoom provides M4A format (not MP3)
   - Use MIME type `audio/mp4` (not `audio/x-m4a`)
   - Apple Podcasts, Spotify, Overcast all support M4A ✅

### ⚠️ Important

3. **Episode Limit**
   - Start with 50 episodes max (Apple recommendation)
   - Can increase to 300 if needed
   - Older episodes drop off feed but remain on website

4. **File Size Accuracy**
   - `audio_size_mb` field may be 0 or inaccurate
   - Consider fetching actual file size via HEAD request
   - Or estimate based on duration (1 minute ≈ 1 MB)

5. **Duration Format**
   - Must convert minutes to HH:MM:SS
   - Handle edge cases: 0 minutes, >24 hours
   - Example: 152 minutes → "02:32:00"

6. **XML Escaping**
   - Meeting titles may contain `&`, `<`, `>`, `"`, `'`
   - Descriptions may contain HTML/markdown
   - Use CDATA sections for long text: `<![CDATA[...]]>`

7. **Date Formatting**
   - RSS requires RFC 2822: "Thu, 05 Dec 2025 23:58:28 +0000"
   - JavaScript: `new Date(date).toUTCString()` ✅

### 💡 Nice to Have

8. **Episode Metadata Enhancement**
   - Extract meeting topics from notes
   - Add chapter markers for agenda items
   - Include speaker names if available

9. **Analytics**
   - Track podcast feed requests
   - Monitor which episodes are popular
   - Add redirect URL for download tracking

10. **Automation**
    - Auto-generate episodes when meetings recorded
    - Send notification to podcast platforms on new episode
    - Validate feed on every deployment

## Testing Plan

### Unit Tests

- [ ] `filterPublicMeetingsWithAudio()` - Filters correctly
- [ ] `escapeXml()` - Handles all special characters
- [ ] `formatDuration()` - Converts minutes to HH:MM:SS
- [ ] `formatFileSize()` - Converts MB to bytes
- [ ] `formatPubDate()` - RFC 2822 format

### Integration Tests

- [ ] GET `/podcasts/feed.xml` returns 200
- [ ] Response Content-Type is `application/rss+xml`
- [ ] XML is well-formed (parse with DOMParser)
- [ ] Channel has required iTunes tags
- [ ] Items have required enclosure tags
- [ ] Only public meetings included
- [ ] Meetings sorted newest first

### Manual QA

- [ ] Validate feed at https://podba.se/validate/
- [ ] Test in Apple Podcasts Connect
- [ ] Subscribe in Overcast app
- [ ] Subscribe in Pocket Casts app
- [ ] Subscribe in Spotify (if supported)
- [ ] Verify audio plays correctly
- [ ] Check artwork displays
- [ ] Verify descriptions render properly

## Dependencies

### Existing Code

- `apps/meetings-service/src/services/meetings.js`:
  - `getMeetingsIndex(kv)` ✅
  - `getMeetingDetail(kv, id)` ✅
  - `filterMeetingsByVisibility(meetings, userRole)` ✅
  - `sortMeetingsByDate(meetings, order)` ✅

### New Dependencies

- None (use native JavaScript for XML generation)

### External Services

- **Zoom Cloud Recordings API** - Audio source (current)
- **Cloudflare R2 Storage** - Audio hosting (future)
- **Apple Podcasts Connect** - Distribution platform
- **Podcast validators** - Feed testing

## Configuration

### wrangler.toml (Future)

```toml
[[r2_buckets]]
binding = "AUDIO_BUCKET"
bucket_name = "waccamaw-meeting-audio"
preview_bucket_name = "waccamaw-meeting-audio-preview"
```

### Environment Variables

None required (uses existing `MEETINGS_KV` binding)

## Documentation Updates

- [ ] Add podcast feed to README.md
- [ ] Document podcast submission process
- [ ] Update DEPLOYMENT.md with R2 setup
- [ ] Add podcast feed URL to website footer
- [ ] Create user guide for podcast subscriptions

## Success Metrics

- Feed validates without errors ✅
- Accepted by Apple Podcasts ✅
- Audio files play correctly ✅
- 10+ subscribers in first month 📊
- 50+ downloads in first month 📊

## Future Enhancements

1. **Multi-language support** - Spanish/Lumbee translations
2. **Video podcast** - Include video files for YouTube Music
3. **Transcript episodes** - Audio version of meeting notes
4. **Private feed** - Password-protected feed for members-only meetings
5. **Chapter markers** - Jump to specific agenda items
6. **Show notes** - Rich HTML descriptions with links

## References

- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [Apple Podcasts RSS Requirements](https://podcasters.apple.com/support/823-podcast-requirements)
- [iTunes Podcast Tags](https://help.apple.com/itc/podcasts_connect/#/itcb54353390)
- [Podcast Feed Validator](https://podba.se/validate/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)

## Timeline

| Phase | Duration | Blockers |
|-------|----------|----------|
| Phase 1: Basic RSS | 1 week | None |
| Phase 2: Audio Hosting | 2-3 weeks | **BLOCKED** - Need storage solution |
| Phase 3: Testing | 1 week | Phase 2 completion |
| **Total** | 4-5 weeks | R2 setup decision |

## Next Steps

1. ✅ Create specification document (this file)
2. ⏳ Research Cloudflare R2 storage pricing and setup
3. ⏳ Decide on permanent audio hosting solution
4. ⏳ Implement Phase 1 (basic RSS endpoint)
5. ⏳ Set up R2 bucket and audio upload workflow
6. ⏳ Update RSS to use R2 URLs
7. ⏳ Validate and test feed
8. ⏳ Submit to Apple Podcasts
9. ⏳ Announce to tribal members

---

**Notes**: Implementation blocked pending permanent audio storage solution. Recommend Cloudflare R2 for cost-effective, reliable hosting. Feed can be built with Zoom URLs for testing, but must migrate to permanent storage before public launch to avoid broken links.
