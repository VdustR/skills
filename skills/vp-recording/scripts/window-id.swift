#!/usr/bin/env swift
// Print on-screen window ids for screencapture -l<id>.
//
//   ./scripts/window-id.swift            # every on-screen window
//   ./scripts/window-id.swift Claude     # only windows owned by "Claude"
//
// Run it as `swift scripts/window-id.swift` if the executable bit is missing.
// Output is one tab-separated row per window: id, owner, title, width x height.
// Exits 1 when nothing matches. Needs Swift from Xcode or the Command Line
// Tools, and nothing else.

import CoreGraphics
import Foundation

let wanted = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : ""

guard
  let windows = CGWindowListCopyWindowInfo(
    [.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]]
else {
  FileHandle.standardError.write(Data("cannot read the window list\n".utf8))
  exit(2)
}

var rows: [String] = []

for window in windows {
  // Layer 0 skips menu bar items, shadows, and other chrome.
  guard (window[kCGWindowLayer as String] as? Int) == 0 else { continue }

  let owner = window[kCGWindowOwnerName as String] as? String ?? ""
  if !wanted.isEmpty, owner != wanted { continue }

  let id = window[kCGWindowNumber as String] as? Int ?? 0
  let title = window[kCGWindowName as String] as? String ?? ""
  let bounds = window[kCGWindowBounds as String] as? [String: Any] ?? [:]
  let width = bounds["Width"] as? Int ?? 0
  let height = bounds["Height"] as? Int ?? 0

  rows.append("\(id)\t\(owner)\t\(title)\t\(width)x\(height)")
}

guard !rows.isEmpty else {
  let scope = wanted.isEmpty ? "any application" : "\"\(wanted)\""
  FileHandle.standardError.write(Data("no on-screen window found for \(scope)\n".utf8))
  exit(1)
}

print(rows.joined(separator: "\n"))
