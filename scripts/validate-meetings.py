#!/usr/bin/env python3
"""
Validate meeting markdown files for Micro.blog compatibility.
Checks YAML front matter syntax, required fields, and date formats.
"""

import os
import sys
from pathlib import Path
import re

try:
    import yaml
except ImportError:
    print("Warning: PyYAML not installed. Skipping YAML validation.")
    yaml = None


def validate_front_matter(filepath):
    """Validate YAML front matter in a markdown file."""
    errors = []
    warnings = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        errors.append(f"Failed to read file: {str(e)}")
        return errors, warnings
    
    # Check for front matter delimiters
    if not content.startswith('---'):
        errors.append("Missing opening front matter delimiter (---)")
        return errors, warnings
    
    # Extract front matter
    parts = content.split('---', 2)
    if len(parts) < 3:
        errors.append("Missing closing front matter delimiter (---)")
        return errors, warnings
    
    front_matter = parts[1]
    body = parts[2] if len(parts) > 2 else ""
    
    # If yaml is not available, skip validation
    if yaml is None:
        return errors, warnings
    
    # Try to parse YAML
    try:
        data = yaml.safe_load(front_matter)
        
        if data is None:
            errors.append("Front matter is empty")
            return errors, warnings
        
        # Check required fields for Micro.blog
        required = ['title', 'date']
        for field in required:
            if field not in data or not data[field]:
                errors.append(f"Missing or empty required field: {field}")
        
        # Validate date format (ISO 8601)
        if 'date' in data and data['date']:
            date_str = str(data['date'])
            # Check for ISO 8601 format: YYYY-MM-DDTHH:MM:SS±HH:MM or YYYY-MM-DD HH:MM:SS±HH:MM
            # Both 'T' separator and space separator are valid ISO 8601
            if not re.match(r'\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}', date_str):
                # Check if it's at least a valid date
                if not re.match(r'\d{4}-\d{2}-\d{2}', date_str):
                    errors.append(f"Invalid date format: {date_str} (should be ISO 8601: YYYY-MM-DD[T ]HH:MM:SS±HH:MM)")
        
        # Check for recommended fields
        recommended = ['author', 'categories']
        for field in recommended:
            if field not in data or not data[field]:
                warnings.append(f"Missing recommended field: {field}")
        
        # Check for problematic characters in title
        if 'title' in data and data['title']:
            title = str(data['title'])
            if '"' in title or "'" in title:
                # Check if properly escaped
                if ('"""' not in front_matter and "'''" not in front_matter and 
                    (': "' not in front_matter or title.count('"') % 2 != 0)):
                    warnings.append("Title contains quotes - ensure they are properly escaped in YAML")
        
        # Check for microblog field (should be false for long posts)
        if 'microblog' in data:
            if data['microblog'] is True and len(body.strip()) > 280:
                warnings.append("microblog: true but content is longer than 280 characters")
        
        # Validate categories format
        # Note: Micro.blog accepts both list format and comma-separated string
        # We're using comma-separated string to avoid bracket interpretation issues
        if 'categories' in data and data['categories']:
            if not isinstance(data['categories'], (list, str)):
                errors.append(f"categories should be a list or string, got: {type(data['categories'])}")
        
        # Check for invalid control characters in content
        if '\x00' in content:
            errors.append("File contains null bytes")
        
        # Check file size (Micro.blog might have limits)
        file_size = len(content.encode('utf-8'))
        if file_size > 1024 * 1024:  # 1MB
            warnings.append(f"File is very large: {file_size / 1024:.1f}KB (may cause import issues)")
        elif file_size > 500 * 1024:  # 500KB
            warnings.append(f"File is large: {file_size / 1024:.1f}KB")
        
        # Check for very long lines that might cause issues
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            if len(line) > 10000:
                warnings.append(f"Line {i} is very long ({len(line)} characters)")
                break
    
    except yaml.YAMLError as e:
        errors.append(f"YAML parsing error: {str(e)}")
    except Exception as e:
        errors.append(f"Unexpected error: {str(e)}")
    
    return errors, warnings


def main():
    meetings_dir = Path('content/meetings')
    
    if not meetings_dir.exists():
        print(f"❌ Error: {meetings_dir} does not exist")
        sys.exit(1)
    
    print("🔍 Validating meeting files for Micro.blog compatibility...\n")
    
    all_valid = True
    total_files = 0
    error_count = 0
    warning_count = 0
    
    # Store files with issues
    files_with_errors = []
    files_with_warnings = []
    
    for filepath in sorted(meetings_dir.glob('*.md')):
        total_files += 1
        errors, warnings = validate_front_matter(filepath)
        
        if errors:
            all_valid = False
            error_count += len(errors)
            files_with_errors.append(filepath.name)
            print(f"❌ {filepath.name}")
            for error in errors:
                print(f"   ERROR: {error}")
        elif warnings:
            warning_count += len(warnings)
            files_with_warnings.append(filepath.name)
            print(f"⚠️  {filepath.name}")
            for warning in warnings:
                print(f"   WARNING: {warning}")
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"📊 Validation Summary")
    print(f"{'='*60}")
    print(f"Total files checked: {total_files}")
    print(f"Files with errors: {len(files_with_errors)}")
    print(f"Files with warnings: {len(files_with_warnings)}")
    print(f"Total errors: {error_count}")
    print(f"Total warnings: {warning_count}")
    
    if all_valid and warning_count == 0:
        print(f"\n✅ All meeting files are valid!")
        sys.exit(0)
    elif all_valid:
        print(f"\n✅ All files passed validation (with {warning_count} warnings)")
        sys.exit(0)
    else:
        print(f"\n❌ Validation failed! Fix errors before exporting.")
        print(f"\nFiles with errors:")
        for filename in files_with_errors:
            print(f"  - {filename}")
        sys.exit(1)


if __name__ == '__main__':
    main()
