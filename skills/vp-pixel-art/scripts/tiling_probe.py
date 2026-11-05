#!/usr/bin/env python3
"""Exercise a controlled Wang fixture; not a validator for arbitrary artwork.

Python standard library only. Write PNG previews and a JSON evidence report to
an explicit output directory. Exit nonzero if a control behaves unexpectedly.
"""
import argparse
import copy
import json
import random
import struct
import zlib
from pathlib import Path

SIZE = 16
PALETTE = [(38, 64, 42), (53, 83, 48), (72, 105, 56), (103, 133, 65)]
# Four consecutive samples across each seam, not duplicate edge columns/rows.
PROFILES = {0: [0, 1, 2, 1], 1: [2, 1, 0, 1]}


def codes(tile_id):
    return tuple((tile_id >> shift) & 1 for shift in range(4))


def tileset():
    tiles = []
    for tile_id in range(16):
        rng = random.Random(tile_id)
        pixels = [[1 for _ in range(SIZE)] for _ in range(SIZE)]
        for _ in range(13):
            x, y = rng.randrange(3, 12), rng.randrange(4, 13)
            pixels[y][x] = 2
            pixels[y - 1][x] = 3
        top, right, bottom, left = codes(tile_id)
        for p in range(2, SIZE - 2):
            for d in range(2):
                pixels[d][p] = PROFILES[top][d + 2]
                pixels[SIZE - 2 + d][p] = PROFILES[bottom][d]
                pixels[p][d] = PROFILES[left][d + 2]
                pixels[p][SIZE - 2 + d] = PROFILES[right][d]
        tiles.append(pixels)
    return tiles


def art_errors(tiles):
    """Compare actual strips against this fixture's known source samples."""
    if len(tiles) != 16:
        return ['incomplete set']
    errors = []
    for tile_id, pixels in enumerate(tiles):
        top, right, bottom, left = codes(tile_id)
        expected = [(top, 2), (right, 0), (bottom, 0), (left, 2)]
        for edge, (code, offset) in enumerate(expected):
            for p in range(2, SIZE - 2):
                for d in range(2):
                    x, y = [(p, d), (SIZE - 2 + d, p),
                            (p, SIZE - 2 + d), (d, p)][edge]
                    if pixels[y][x] != PROFILES[code][offset + d]:
                        errors.append(f'tile {tile_id}: edge {edge}')
        for y in [0, 1, SIZE - 2, SIZE - 1]:
            for x in [0, 1, SIZE - 2, SIZE - 1]:
                if pixels[y][x] != 1:
                    errors.append(f'tile {tile_id}: corner')
    return errors


def make_map(seed, rows=12, cols=12):
    rng = random.Random(seed)
    h = [[rng.randrange(2) for _ in range(cols)] for _ in range(rows)]
    v = [[rng.randrange(2) for _ in range(cols)] for _ in range(rows)]
    return [[h[r][c] | (v[r][(c + 1) % cols] << 1)
             | (h[(r + 1) % rows][c] << 2) | (v[r][c] << 3)
             for c in range(cols)] for r in range(rows)]


def map_errors(grid):
    errors = []
    rows, cols = len(grid), len(grid[0])
    for r in range(rows):
        for c in range(cols):
            top, right, bottom, left = codes(grid[r][c])
            if right != codes(grid[r][(c + 1) % cols])[3]:
                errors.append(f'{r},{c}: right')
            if bottom != codes(grid[(r + 1) % rows][c])[0]:
                errors.append(f'{r},{c}: bottom')
    return errors


def pair_errors(tiles):
    """Enumerate all 128 legal pairs per direction, including self-pairs."""
    errors = []
    counts = [0, 0]
    for a in range(16):
        for b in range(16):
            if codes(a)[1] == codes(b)[3]:
                counts[0] += 1
                for p in range(2, SIZE - 2):
                    actual = tiles[a][p][-2:] + tiles[b][p][:2]
                    if actual != PROFILES[codes(a)[1]]:
                        errors.append(f'{a},{b}: horizontal')
            if codes(a)[2] == codes(b)[0]:
                counts[1] += 1
                for p in range(2, SIZE - 2):
                    actual = [tiles[a][-2][p], tiles[a][-1][p],
                              tiles[b][0][p], tiles[b][1][p]]
                    if actual != PROFILES[codes(a)[2]]:
                        errors.append(f'{a},{b}: vertical')
    return counts, errors


def render(tiles, grid):
    return [[PALETTE[p] for tile_id in row for p in tiles[tile_id][y]]
            for row in grid for y in range(SIZE)]


def png(path, pixels, scale=1):
    def chunk(kind, data):
        return struct.pack('!I', len(data)) + kind + data + struct.pack(
            '!I', zlib.crc32(kind + data) & 0xffffffff)
    raw = b''.join((b'\x00' + bytes(v for p in row for _ in range(scale)
                                   for v in p)) * scale for row in pixels)
    header = struct.pack('!2I5B', len(pixels[0]) * scale, len(pixels) * scale,
                         8, 2, 0, 0, 0)
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header)
                     + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b''))


def run(output):
    output.mkdir(parents=True, exist_ok=True)
    tiles = tileset()
    checks = {}
    checks['complete_set'] = not art_errors(tiles)
    counts, errors = pair_errors(tiles)
    checks['all_legal_pairs'] = counts == [128, 128] and not errors
    # A literal known-source oracle independent of the strip-construction loop.
    checks['known_seam_samples'] = (
        tiles[0][5][-2:] + tiles[0][5][:2] == [0, 1, 2, 1]
        and tiles[15][5][-2:] + tiles[15][5][:2] == [2, 1, 0, 1])
    checks['unequal_adjacent_pixels_are_valid'] = tiles[0][5][-1] != tiles[0][5][0]
    for seed in [7, 23, 101]:
        grid = make_map(seed)
        checks[f'looping_map_seed_{seed}'] = not map_errors(grid)
        png(output / f'wang-seed-{seed}.png', render(tiles, grid))
    grid = make_map(7)
    wrong = copy.deepcopy(grid)
    wrong[4][4] ^= 2
    checks['reject_wrong_edge_code'] = bool(map_errors(wrong))
    wrap = copy.deepcopy(grid)
    wrap[0][0] ^= 1
    checks['reject_wrap_mismatch'] = any(e == '11,0: bottom' for e in map_errors(wrap))
    checks['reject_missing_tile'] = bool(art_errors(tiles[:-1]))
    broken = copy.deepcopy(tiles)
    broken[0][5][-1] = 3
    checks['reject_pixel_seam_with_valid_codes'] = bool(pair_errors(broken)[1])
    corners = copy.deepcopy(tiles)
    corners[0][0][0] = 3
    checks['reject_corner_damage'] = bool(art_errors(corners))
    checks['edge_pair_check_alone_misses_corner'] = not pair_errors(corners)[1]
    repeated = [[0] * 12 for _ in range(12)]
    checks['repetition_can_pass_technical_checks'] = not map_errors(repeated)
    png(output / 'single-tile-repeat.png', render(tiles, repeated))
    png(output / 'broken-seam.png', render(broken, repeated))
    png(output / 'broken-corner.png', render(corners, repeated))
    atlas = [[r * 4 + c for c in range(4)] for r in range(4)]
    png(output / 'atlas-native.png', render(tiles, atlas))
    # Left: repeated, middle: Wang, right: deliberately damaged seam. Nearest-neighbor.
    panels = [render(tiles, repeated), render(tiles, grid), render(broken, repeated)]
    board = [sum((panel[y] + [(240, 240, 230)] * 4 for panel in panels), [])
             for y in range(12 * SIZE)]
    png(output / 'comparison-3x.png', board, 3)
    report = {'fixture': 'synthetic 16x16 four-color complete binary edge Wang set',
              'legal_pair_counts': counts, 'checks': checks,
              'passed': sum(checks.values()), 'total': len(checks),
              'limits': ['Known-source fixture only; no arbitrary-art seam metric.',
                         'No engine, hardware, human acceptance, or blind agent trial.',
                         'Constant corner patches are fixture-specific, not a general art rule.']}
    (output / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    if not all(checks.values()):
        raise SystemExit(1)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    run(parser.parse_args().output)
