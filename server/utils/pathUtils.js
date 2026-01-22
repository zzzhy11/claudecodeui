import path from 'path';

const isWindows = process.platform === 'win32';

function stripWindowsLongPathPrefix(inputPath) {
  if (!isWindows || typeof inputPath !== 'string') {
    return inputPath;
  }

  // \\?\UNC\server\share\path -> \\server\share\path
  if (inputPath.startsWith('\\\\?\\UNC\\')) {
    return `\\\\${inputPath.slice('\\\\?\\UNC\\'.length)}`;
  }

  // \\?\C:\path -> C:\path
  if (inputPath.startsWith('\\\\?\\')) {
    return inputPath.slice('\\\\?\\'.length);
  }

  return inputPath;
}

export function normalizeFsPathForCompare(inputPath) {
  if (typeof inputPath !== 'string' || !inputPath.trim()) {
    return '';
  }

  let normalized = stripWindowsLongPathPrefix(inputPath.trim());

  // Normalize separators before path.normalize so cross-platform inputs behave.
  normalized = isWindows ? normalized.replaceAll('/', '\\') : normalized.replaceAll('\\', '/');

  try {
    normalized = path.resolve(path.normalize(normalized));
  } catch {
    // If resolve/normalize fails, fall back to the original string.
  }

  // Trim trailing separators (but keep root intact).
  try {
    const root = path.parse(normalized).root;
    while (normalized.length > root.length && normalized.endsWith(path.sep)) {
      normalized = normalized.slice(0, -1);
    }
  } catch {
    // Ignore.
  }

  if (isWindows) {
    normalized = normalized.toLowerCase();
  }

  return normalized;
}

export function isPathSameOrInside(parentPath, candidatePath) {
  const parent = normalizeFsPathForCompare(parentPath);
  const candidate = normalizeFsPathForCompare(candidatePath);

  if (!parent || !candidate) {
    return false;
  }

  const relative = path.relative(parent, candidate);

  // Same directory
  if (!relative) {
    return true;
  }

  // Different drive on Windows yields an absolute path here.
  if (path.isAbsolute(relative)) {
    return false;
  }

  return !relative.startsWith('..') && !relative.startsWith(`..${path.sep}`);
}

export function pathsBelongToSameProject(projectPath, sessionCwd) {
  return isPathSameOrInside(projectPath, sessionCwd) || isPathSameOrInside(sessionCwd, projectPath);
}

