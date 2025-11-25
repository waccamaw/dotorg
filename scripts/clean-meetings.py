#!/usr/bin/env python3
"""
Clean and reorganize meeting posts for Micro.blog compatibility.

Fixes:
1. Extracts actual meeting date from content (not publish date)
2. Removes massive text duplication
3. Cleans scraper artifacts (reading time, hyphens, etc.)
4. Sets correct author (Michelle Hatcher, not Doug)
5. Adds proper categories (meetings, tribal-business)
6. Moves to /content/meetings/ section
7. Preserves Micro.blog required fields (guid, post_id, photos, microblog)
"""

import os
import re
import sys
from pathlib import Path
from datetime import datetime

def extract_meeting_date(content):
    """Extract actual meeting date from content like 'held at the tribal office 8/1/2025'"""
    
    # Pattern: "Summary 8/1/2025" or "held at the tribal office 8/1/2025" or similar
    patterns = [
        r'(?:Summary|held.*?office.*?(?:and via Zoom)?)\s+(\d{1,2})/(\d{1,2})/(\d{4})',
        r'Meeting Summary\s+(\d{1,2})/(\d{1,2})/(\d{4})',
        r'held on\s+(\d{1,2})/(\d{1,2})/(\d{4})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            month, day, year = match.groups()
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    
    return None

def remove_duplicates(content):
    """Remove massive text duplication by finding repeated sections"""
    
    # Split into lines
    lines = content.split('\n')
    
    # Find where duplication starts (usually after first few sections)
    # Look for identical numbered list items appearing multiple times
    seen_sequences = {}
    clean_lines = []
    
    for i, line in enumerate(lines):
        # Create a signature of this line and next few lines
        if i < len(lines) - 5:
            signature = '\n'.join(lines[i:i+5])
            
            # If we've seen this exact 5-line sequence before, it's likely duplication
            if signature in seen_sequences and len(signature.strip()) > 50:
                # Skip duplicated content
                continue
            
            seen_sequences[signature] = True
        
        clean_lines.append(line)
    
    return '\n'.join(clean_lines)

def clean_front_matter(front_matter, actual_date, filename):
    """Clean and update front matter with proper fields"""
    
    # Parse existing front matter
    lines = front_matter.strip().split('\n')
    fields = {}
    
    for line in lines:
        if ':' in line and not line.strip().startswith('#'):
            key = line.split(':', 1)[0].strip()
            value = line.split(':', 1)[1].strip() if ':' in line else ''
            fields[key] = value
    
    # Extract meeting month/type from title or generate from filename
    title = fields.get('title', '').strip('"')
    
    # If title is empty, generate from filename
    if not title:
        # Convert filename like "march-open-meeting-summary-michelle.md" to "March Open Meeting Summary"
        title_base = filename.replace('.md', '').replace('-', ' ').title()
        # Remove author names from title
        title = re.sub(r'\b(Michelle|Doug|Hatcher)\b', '', title_base).strip()
        # Clean up extra spaces
        title = ' '.join(title.split())
    
    # Set correct author (Michelle Hatcher writes all meeting summaries)
    author_name = "Michelle Hatcher"
    
    # Build clean front matter
    clean_fm = ['---']
    clean_fm.append(f'title: "{title}"')
    clean_fm.append(f'date: {actual_date}T19:00:00-05:00')  # Meetings typically at 7pm
    clean_fm.append(f'author: "{author_name}"')
    clean_fm.append('categories:')
    clean_fm.append('  - meetings')
    clean_fm.append('  - tribal-business')
    
    # Preserve Micro.blog required fields
    if 'guid' in fields:
        clean_fm.append(f"guid: {fields['guid']}")
    if 'post_id' in fields:
        clean_fm.append(f"post_id: {fields['post_id']}")
    
    # Keep microblog setting
    clean_fm.append('microblog: false')
    
    # Keep photos if they exist
    if 'photos' in fields:
        clean_fm.append(f"photos: {fields['photos']}")
    
    clean_fm.append('---')
    
    return '\n'.join(clean_fm)

def clean_content_body(body):
    """Remove scraper artifacts and clean up content"""
    
    # Strip leading whitespace FIRST
    body = body.lstrip()
    
    # Remove ALL markdown headers at the start (# Title lines)
    # This handles the duplicate title that appears in the body
    while body.startswith('#'):
        # Find the end of this header line
        first_newline = body.find('\n')
        if first_newline != -1:
            body = body[first_newline+1:].lstrip()
        else:
            break
    
    # Remove scraper artifacts: "-\n\nMichelle Hatcher\n- Sep 23\n- 31 min read"
    body = re.sub(r'-\s*\n\s*(?:Michelle|Doug)\s+Hatcher\s*\n-[^\n]+\n-\s*\d+\s*min\s*read\s*\n', '', body)
    
    # Remove standalone hyphens (empty list items)
    body = re.sub(r'^\s*-\s*$', '', body, flags=re.MULTILINE)
    
    # Fix list formatting: merge standalone list markers with their content
    # Use 3-space indentation per level (markdown standard for nested ordered lists)
    # Auto-detect nesting level based on number value
    lines = body.split('\n')
    cleaned_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # Check if this is a standalone list marker
        list_match = re.match(r'^(\s*)([0-9]+|[a-z]|[A-Z]|[ivxIVX]+)\.\s*$', line)
        if list_match and i + 1 < len(lines):
            indent_spaces = len(list_match.group(1))
            marker = list_match.group(2)
            
            # Determine nesting level intelligently:
            # - If marker is a number > 10, treat as top-level (0 indent)
            # - Otherwise use original indentation but cap at 3 levels
            if marker.isdigit() and int(marker) > 10:
                # High numbers are sequential top-level items
                nest_level = 0
            else:
                # Low numbers, letters = actual nesting based on indentation
                nest_level = indent_spaces // 2  # Original has 2-space increments
                nest_level = min(nest_level, 3)  # Cap at 3 levels
            
            markdown_indent = '   ' * nest_level  # Markdown uses 3-space increments
            
            # Look ahead for content (skip max 2 blank lines)
            j = i + 1
            blanks_skipped = 0
            while j < len(lines) and not lines[j].strip() and blanks_skipped < 2:
                blanks_skipped += 1
                j += 1
            if j < len(lines) and lines[j].strip():
                # Merge: add proper markdown indentation, marker, and content on same line
                content = lines[j].strip()
                cleaned_lines.append(f"{markdown_indent}{marker}. {content}")
                i = j + 1
                continue
        cleaned_lines.append(line)
        i += 1
    
    body = '\n'.join(cleaned_lines)
    
    # ONLY remove leading spaces from high-numbered items (10+) that should be top-level
    # Don't touch properly indented sub-items (1-9 with indentation are legitimate nesting)
    body = re.sub(r'^ {4,}([1-9]\d+\.)', r'\1', body, flags=re.MULTILINE)  # Only numbers >= 10
    
    # Clean up excessive blank lines
    body = re.sub(r'\n{3,}', '\n\n', body)
    
    # Remove "Tags:" section at end (we're using proper categories now)
    body = re.sub(r'\n+Tags:\s*\n[\s\S]*$', '', body)
    
    # Clean up excessive whitespace but preserve paragraph breaks
    body = re.sub(r'\n{3,}', '\n\n', body)
    
    return body.strip()

def process_meeting_file(filepath):
    """Process a single meeting file"""
    
    print(f"\n{'='*60}")
    print(f"Processing: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split front matter and body
    parts = content.split('---', 2)
    if len(parts) < 3:
        print("  ❌ Invalid format (no front matter)")
        return None
    
    front_matter = parts[1]
    body = parts[2]
    
    # Extract actual meeting date from content
    actual_date = extract_meeting_date(body)
    
    if not actual_date:
        print("  ⚠️  Could not extract meeting date from content")
        # Try to extract from filename or path
        path_match = re.search(r'/(\d{4})/(\d{2})/(\d{2})/', filepath)
        if path_match:
            year, month, day = path_match.groups()
            actual_date = f"{year}-{month}-{day}"
            print(f"  ℹ️  Using date from path: {actual_date}")
        else:
            print("  ❌ Skipping - no date found")
            return None
    else:
        print(f"  ✓ Found meeting date: {actual_date}")
    
    # Get filename for new location
    basename = os.path.basename(filepath)
    # Clean up basename - remove date prefixes if they exist
    basename = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', basename)
    
    # New filename with actual meeting date
    new_basename = f"{actual_date}-{basename}"
    new_filepath = f"/workspaces/waccamawdotorg/content/meetings/{new_basename}"
    
    print(f"  → New location: {new_filepath}")
    
    # Clean front matter
    clean_fm = clean_front_matter(front_matter, actual_date, basename)
    
    # Remove duplicates from body
    print(f"  Original body size: {len(body)} chars")
    body = remove_duplicates(body)
    print(f"  After deduplication: {len(body)} chars")
    
    # Clean content body
    body = clean_content_body(body)
    print(f"  After cleaning: {len(body)} chars")
    
    # Combine
    new_content = clean_fm + '\n\n' + body + '\n'
    
    return {
        'original': filepath,
        'new_path': new_filepath,
        'content': new_content,
        'date': actual_date
    }

def main():
    # Find all meeting posts
    content_dir = Path('/workspaces/waccamawdotorg/content')
    
    # Search for meeting posts
    meeting_files = []
    for md_file in content_dir.rglob('*.md'):
        # Skip if already in meetings directory
        if '/meetings/' in str(md_file):
            continue
        
        # Check if it's a meeting post by reading first 500 chars
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                preview = f.read(500).lower()
                if any(term in preview for term in ['meeting summary', 'open meeting', 'executive meeting', 'tribal open meeting']):
                    meeting_files.append(str(md_file))
        except:
            continue
    
    print(f"\n{'='*60}")
    print(f"Found {len(meeting_files)} meeting posts to clean")
    print(f"{'='*60}")
    
    # Process each file
    results = []
    for filepath in meeting_files:
        result = process_meeting_file(filepath)
        if result:
            results.append(result)
    
    print(f"\n{'='*60}")
    print(f"Summary: {len(results)} files processed successfully")
    print(f"{'='*60}")
    
    # Show what would be created
    if results:
        print("\nNew files to be created:")
        date_counts = {}
        for r in results:
            year = r['date'][:4]
            date_counts[year] = date_counts.get(year, 0) + 1
            print(f"  {r['new_path']}")
        
        print("\nMeetings by year:")
        for year, count in sorted(date_counts.items()):
            print(f"  {year}: {count} meetings")
    
    # Ask for confirmation
    if '--dry-run' in sys.argv:
        print("\n🔍 DRY RUN - No files were modified")
        return
    
    print("\nProceed with creating cleaned files? (y/N): ", end='')
    response = input().strip().lower()
    
    if response == 'y':
        # Create meetings directory
        os.makedirs('/workspaces/waccamawdotorg/content/meetings', exist_ok=True)
        
        # Write cleaned files
        for r in results:
            with open(r['new_path'], 'w', encoding='utf-8') as f:
                f.write(r['content'])
            print(f"  ✓ Created {r['new_path']}")
        
        print(f"\n✅ Successfully created {len(results)} cleaned meeting posts")
        print("\nNext steps:")
        print("1. Review the cleaned files in /content/meetings/")
        print("2. Delete the original duplicated files if satisfied")
        print("3. Update layouts/meetings/list.html if needed")
    else:
        print("\n❌ Cancelled")

if __name__ == '__main__':
    main()
