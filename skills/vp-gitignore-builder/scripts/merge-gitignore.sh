#!/usr/bin/env bash
#
# merge-gitignore.sh
# Fetch and merge .gitignore templates from github/gitignore
#
# Usage: merge-gitignore.sh <template1> [template2] ...
#
# Templates can be:
#   - Top-level: Node, Python, Rust, Go, etc.
#   - Global: Global/macOS, Global/VisualStudioCode, etc.
#
# Exit codes:
#   0 - Success
#   1 - Network error (failed to fetch)
#   2 - EOL conflict detected (details in stderr)
#

set -euo pipefail

GITHUB_RAW_BASE="https://raw.githubusercontent.com/github/gitignore/main"

# Temporary directory for downloads
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# File to track EOL types
EOL_LOG="${TEMP_DIR}/eol_types.log"
touch "$EOL_LOG"

# Detect EOL type of a file
# Returns: LF, CRLF, CR, or MIXED
detect_eol() {
    local file="$1"
    local has_crlf=false
    local has_lf=false
    local has_cr=false

    if grep -q $'\r\n' "$file" 2>/dev/null; then
        has_crlf=true
    fi
    if grep -q $'[^\r]\n' "$file" 2>/dev/null || grep -q $'^\n' "$file" 2>/dev/null; then
        has_lf=true
    fi
    if grep -q $'\r[^\n]' "$file" 2>/dev/null || grep -q $'\r$' "$file" 2>/dev/null; then
        has_cr=true
    fi

    # Determine type
    local count=0
    $has_crlf && ((count++)) || true
    $has_lf && ((count++)) || true
    $has_cr && ((count++)) || true

    if [ "$count" -gt 1 ]; then
        echo "MIXED"
    elif $has_crlf; then
        echo "CRLF"
    elif $has_cr; then
        echo "CR"
    else
        echo "LF"
    fi
}

# Fetch a template from github/gitignore
fetch_template() {
    local template="$1"
    local output_file="$2"
    local url="${GITHUB_RAW_BASE}/${template}.gitignore"

    if ! curl -sS -f -o "$output_file" "$url" 2>/dev/null; then
        echo "Error: Failed to fetch ${template}.gitignore" >&2
        echo "URL: ${url}" >&2
        return 1
    fi

    # Detect and record EOL type
    local eol_type
    eol_type=$(detect_eol "$output_file")
    echo "${template}:${eol_type}" >> "$EOL_LOG"

    return 0
}

# Print templates start marker
print_templates_start() {
    cat <<'EOF'
# ╔═══════════════════════════════════════════════════════════════════════╗
# ║                    github/gitignore templates                         ║
# ║           https://github.com/github/gitignore                         ║
# ╠═══════════════════════════════════════════════════════════════════════╣
# ║ START - Do not edit this section manually                             ║
# ╚═══════════════════════════════════════════════════════════════════════╝

EOF
}

# Print templates end marker
print_templates_end() {
    cat <<'EOF'
# ╔═══════════════════════════════════════════════════════════════════════╗
# ║ END - github/gitignore templates                                      ║
# ╚═══════════════════════════════════════════════════════════════════════╝
EOF
}

# Print source header for individual template
print_source_header() {
    local template="$1"
    echo "# --------------------------------------------"
    echo "# Source: ${template}.gitignore"
    echo "# --------------------------------------------"
    echo ""
}

# Print local files section
print_local_files_section() {
    cat <<'EOF'

# ============================================
# Local files (project-specific ignores)
# ============================================

# Add project-specific files to ignore here
# Example: .env.local, local-config.json
EOF
}

# Print overrides section
print_overrides_section() {
    cat <<'EOF'

# ============================================
# Overrides (highest priority - last wins)
# ============================================

# Local configuration files (should never be committed)
*.local
*.local.*

# Add custom overrides here
# Use negation (!) to re-include files excluded above
# Example: !important.log
EOF
}

# Check for EOL conflicts and report
check_eol_conflicts() {
    local first_eol=""
    local has_conflict=false

    while IFS=: read -r template eol; do
        if [ -z "$first_eol" ]; then
            first_eol="$eol"
        elif [ "$eol" != "$first_eol" ]; then
            has_conflict=true
            break
        fi
    done < "$EOL_LOG"

    if $has_conflict; then
        echo "⚠️  EOL inconsistency detected:" >&2
        while IFS=: read -r template eol; do
            echo "  - ${template}.gitignore: ${eol}" >&2
        done < "$EOL_LOG"
        echo "" >&2
        echo "EOL_CONFLICT=true" >&2
        return 2
    fi

    return 0
}

# Convert file to LF line endings
convert_to_lf() {
    local file="$1"
    local temp_file="${file}.tmp"
    # Remove CR characters (handles both CRLF and CR)
    tr -d '\r' < "$file" > "$temp_file"
    mv "$temp_file" "$file"
}

# Main function
main() {
    if [ $# -eq 0 ]; then
        echo "Usage: $0 <template1> [template2] ..." >&2
        echo "" >&2
        echo "Examples:" >&2
        echo "  $0 Node Python" >&2
        echo "  $0 Global/macOS Global/VisualStudioCode" >&2
        exit 1
    fi

    local templates=("$@")

    # Fetch all templates
    for template in "${templates[@]}"; do
        local safe_name="${template//\//_}"
        local output_file="${TEMP_DIR}/${safe_name}.gitignore"

        echo "Fetching ${template}.gitignore..." >&2
        if ! fetch_template "$template" "$output_file"; then
            exit 1
        fi
    done

    # Check for EOL conflicts
    local eol_exit_code=0
    check_eol_conflicts || eol_exit_code=$?

    # Convert all files to LF for consistent output
    for template in "${templates[@]}"; do
        local safe_name="${template//\//_}"
        local file="${TEMP_DIR}/${safe_name}.gitignore"
        convert_to_lf "$file"
    done

    # Output merged content to stdout
    # 1. Templates section (with start/end markers)
    print_templates_start
    for template in "${templates[@]}"; do
        local safe_name="${template//\//_}"
        local file="${TEMP_DIR}/${safe_name}.gitignore"

        print_source_header "$template"
        cat "$file"
        echo ""
    done
    print_templates_end

    # 2. Local files section
    print_local_files_section

    # 3. Overrides section (highest priority - last wins in gitignore)
    print_overrides_section

    # Return appropriate exit code
    exit $eol_exit_code
}

main "$@"
