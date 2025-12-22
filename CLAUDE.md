# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a collection of Google Apps Script (GAS) utilities and snippets. Each script is self-contained in its own directory and serves a specific automation purpose. Scripts are often partially generated with AI tools like ChatGPT or GitHub Copilot.

## Architecture

**Directory Structure:**
- Each utility lives in its own directory (e.g., `ScheduleInNextFreeSlot/`, `OrganizeFilesByYear/`)
- Scripts use the `.gs` extension (Google Apps Script JavaScript variant)
- No build system or dependencies - scripts are deployed directly to Google Apps Script

**Script Organization:**
- **ScheduleInNextFreeSlot/**: Calendar automation that creates events in the next available time slot
  - Exposed as web app via `doGet(e)` function accepting `title` parameter
  - Uses Calendar.Freebusy API to find gaps in schedule
  - Creates Google Docs in year/date folder structure (YYYY/YYYY-MM-DD)
  - Default event duration: 35 minutes with 5-minute buffer between events

- **OrganizeFilesByYear/**: Drive file organization utility
  - Moves files from Drive root into year/date folder structure (YYYY/YYYY-MM-DD)
  - Logs operations to a spreadsheet ("Sheet1")
  - Only processes files directly in root folder (not nested files)

- **WorkOutTime/**: Weather-based workout calendar automation
  - Checks weather conditions for Vancouver, BC (V6N 2P5 area)
  - Creates "Work Out and Podcast listening" event at 11am when conditions are good
  - Weather thresholds: Temperature ≥ 7°C AND precipitation probability < 10%
  - Uses Open-Meteo API (free, no API key required)
  - Set up with daily trigger via `setupDailyTrigger()` function

## Key Implementation Patterns

**Google Drive Folder Management:**
Both scripts use a consistent pattern for organizing files:
1. Create/find year folder in root (e.g., "2025")
2. Create/find date subfolder (format: YYYY-MM-DD)
3. Move/create files in the date folder
4. Remove from root folder when moving files

**Calendar Event Scheduling Logic:**
The ScheduleInNextFreeSlot script uses a multi-step approach:
1. Query free/busy status for next 24 hours
2. Find gaps between busy periods that fit the event duration
3. Check for conflicts with existing events
4. If conflicts exist, reschedule 5 minutes after the last conflicting event

## Deployment

Google Apps Script projects are deployed through the Apps Script web editor:
1. Open https://script.google.com
2. Create new project or import existing code
3. For web apps (like ScheduleInNextFreeSlot): Deploy > New deployment > Web app
4. For spreadsheet-bound scripts (like OrganizeFilesByYear): Run from Extensions > Apps Script menu

**Required API Scopes:**
- ScheduleInNextFreeSlot: Calendar API (Calendar.Freebusy), Drive API, Docs API
- OrganizeFilesByYear: Drive API, Spreadsheet API
- WorkOutTime: Calendar API, UrlFetch (for Open-Meteo API)

## Testing

Test functions are included inline (e.g., `testCreateEventwithDoc()` in ScheduleInNextFreeSlot/ScheduleInNextFreeSlot.gs:16).

Run tests through the Apps Script editor by selecting the function and clicking "Run".

## License

MIT License - see LICENSE file for details.
