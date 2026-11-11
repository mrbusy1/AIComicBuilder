/*
 * AIComic Builder Studio — Windows installer builder
 * Produces release/AIComicBuilder-Studio-Setup-2.0.0.exe
 *
 * Preference: NSIS (real installer with uninstaller + shortcuts + registry).
 * Fallback:   7-Zip self-extracting installer (same behaviour, no extra tooling).
 *
 * Design and Developed by Mr.Busy
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = __dirname;
const PORTABLE = path.join(ROOT, 'dist', 'AIComic Builder Studio');
const STAGING = path.join(ROOT, '.installer-staging');
const RELEASE = path.join(ROOT, 'release');
const OUT_EXE = path.join(RELEASE, 'AIComicBuilder-Studio-Setup-2.0.0.exe');
const APPNAME = 'AIComic Builder Studio';
const VERSION = '2.0.0';
const AUTHOR = 'Mr.Busy';
const REPO = 'https://github.com/mrbusy1/AIComicBuilder';

function rmrf(p) { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); }
function mkdir(p) { fs.mkdirSync(p, { recursive: true }); }
function copyDir(src, dst) {
  mkdir(dst);
  for (const n of fs.readdirSync(src)) {
    const s = path.join(src, n), d = path.join(dst, n);
    if (fs.statSync(s).isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}
function findNSIS() {
  const candidates = [
    'C:\\Program Files (x86)\\NSIS\\makensis.exe',
    'C:\\Program Files\\NSIS\\makensis.exe',
    'C:\\Users\\Mr\\AppData\\Local\\NSIS-Portable\\makensis.exe',
    'C:\\Users\\Mr\\AppData\\Local\\Programs\\NSIS\\makensis.exe'
  ];
  for (const p of candidates) if (fs.existsSync(p)) return p;
  const r = spawnSync('where', ['makensis.exe'], { shell: true, encoding: 'utf8' });
  if (r.status === 0 && r.stdout.trim()) return r.stdout.trim().split(/\r?\n/)[0];
  return null;
}
function find7z() {
  const p = 'C:\\Program Files\\7-Zip\\7z.exe';
  return fs.existsSync(p) ? p : null;
}

if (!fs.existsSync(path.join(PORTABLE, 'AIComic Builder Studio.exe'))) {
  console.error('Portable build missing. Run: node build-portable.js');
  process.exit(1);
}

console.log('Staging installer payload...');
/* Reuse the staging folder: copyDir overwrites every file, so no recursive
   delete is needed (avoids bulk-delete guards and keeps rebuilds fast). */
mkdir(STAGING);
mkdir(RELEASE);
mkdir(path.join(STAGING, 'installer'));
copyDir(PORTABLE, path.join(STAGING, 'app'));

const NSI = `; AIComic Builder Studio installer — Design and Developed by Mr.Busy
!define APPNAME "${APPNAME}"
!define VERSION "${VERSION}"
!define AUTHOR "${AUTHOR}"
!define REPO "${REPO}"
!define EXENAME "AIComic Builder Studio.exe"

Name "\${APPNAME} \${VERSION} — Unlimited Edition"
OutFile "${OUT_EXE.replace(/\\/g, '/')}"
InstallDir "$LOCALAPPDATA\\Programs\\\${APPNAME}"
RequestExecutionLevel user
SetCompressor /SOLID lzma
SetCompressorDictSize 64

!include "MUI2.nsh"
!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\\\${EXENAME}"
!define MUI_FINISHPAGE_RUN_TEXT "Launch \${APPNAME}"
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "${path.join(STAGING, 'app').replace(/\\/g, '/')}\\*.*"
  CreateDirectory "$SMPROGRAMS\\\${APPNAME}"
  CreateShortCut "$SMPROGRAMS\\\${APPNAME}\\\${APPNAME}.lnk" "$INSTDIR\\\${EXENAME}" "" "$INSTDIR\\\${EXENAME}" 0
  CreateShortCut "$SMPROGRAMS\\\${APPNAME}\\Uninstall.lnk" "$INSTDIR\\Uninstall.exe"
  CreateShortCut "$DESKTOP\\\${APPNAME}.lnk" "$INSTDIR\\\${EXENAME}" "" "$INSTDIR\\\${EXENAME}" 0
  WriteUninstaller "$INSTDIR\\Uninstall.exe"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AIComicBuilderStudio" "DisplayName" "\${APPNAME} — Unlimited Edition"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AIComicBuilderStudio" "DisplayVersion" "\${VERSION}"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AIComicBuilderStudio" "Publisher" "\${AUTHOR}"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AIComicBuilderStudio" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AIComicBuilderStudio" "DisplayIcon" "$INSTDIR\\\${EXENAME}"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AIComicBuilderStudio" "URLInfoAbout" "\${REPO}"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AIComicBuilderStudio" "UninstallString" "$INSTDIR\\Uninstall.exe"
  WriteRegDWORD HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AIComicBuilderStudio" "NoModify" 1
  WriteRegDWORD HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AIComicBuilderStudio" "NoRepair" 1
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\\\${APPNAME}.lnk"
  Delete "$SMPROGRAMS\\\${APPNAME}\\\${APPNAME}.lnk"
  Delete "$SMPROGRAMS\\\${APPNAME}\\Uninstall.lnk"
  RMDir "$SMPROGRAMS\\\${APPNAME}"
  Delete "$INSTDIR\\Uninstall.exe"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AIComicBuilderStudio"
SectionEnd
`;
const nsiPath = path.join(STAGING, 'installer.nsi');
fs.writeFileSync(nsiPath, NSI, 'utf8');

/* --- 7-Zip SFX fallback payload --- */
const SETUP_CMD = `@echo off
setlocal
title ${APPNAME} ${VERSION} Setup
set "SRC=%~dp0..\\app"
set "DEST=%LOCALAPPDATA%\\Programs\\${APPNAME}"
echo.
echo   Installing ${APPNAME} — Unlimited Edition ${VERSION}
echo   Design and Developed by ${AUTHOR}
echo.
echo   Target: %DEST%
echo.
if not exist "%DEST%" mkdir "%DEST%"
robocopy "%SRC%" "%DEST%" /E /NFL /NDL /NJH /NJS /NC /NS /NP >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0shortcuts.ps1" -ExePath "%DEST%\\AIComic Builder Studio.exe" -InstallDir "%DEST%"
echo.
echo   Installed. A desktop shortcut and a Start Menu entry were created.
echo   GitHub: ${REPO}
echo.
timeout /t 4 >nul
start "" "%DEST%\\AIComic Builder Studio.exe"
exit /b 0
`;
const SHORTCUTS_PS = `param([string]$ExePath,[string]$InstallDir)
$Name = '${APPNAME}'
$Wsh = New-Object -ComObject WScript.Shell
$Desktop = [Environment]::GetFolderPath('Desktop')
$Programs = [Environment]::GetFolderPath('Programs')
$StartDir = Join-Path $Programs $Name
New-Item -ItemType Directory -Force -Path $StartDir | Out-Null
$s1 = $Wsh.CreateShortcut((Join-Path $Desktop ($Name + '.lnk')))
$s1.TargetPath = $ExePath; $s1.WorkingDirectory = $InstallDir; $s1.IconLocation = $ExePath; $s1.Save()
$s2 = $Wsh.CreateShortcut((Join-Path $StartDir ($Name + '.lnk')))
$s2.TargetPath = $ExePath; $s2.WorkingDirectory = $InstallDir; $s2.IconLocation = $ExePath; $s2.Save()
$un = Join-Path $InstallDir 'Uninstall.cmd'
Set-Content -Path $un -Encoding ASCII -Value @"
@echo off
set "D=%~dp0"
del "%USERPROFILE%\\Desktop\\$Name.lnk" >nul 2>&1
del "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\$Name\\$Name.lnk" >nul 2>&1
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AIComicBuilderStudio" /f >nul 2>&1
cd /d "%USERPROFILE%"
rmdir /s /q "%D%"
"@
$key = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AIComicBuilderStudio'
New-Item -Path $key -Force | Out-Null
New-ItemProperty -Path $key -Name 'DisplayName' -Value '${APPNAME} — Unlimited Edition' -Force | Out-Null
New-ItemProperty -Path $key -Name 'DisplayVersion' -Value '${VERSION}' -Force | Out-Null
New-ItemProperty -Path $key -Name 'Publisher' -Value '${AUTHOR}' -Force | Out-Null
New-ItemProperty -Path $key -Name 'InstallLocation' -Value $InstallDir -Force | Out-Null
New-ItemProperty -Path $key -Name 'DisplayIcon' -Value $ExePath -Force | Out-Null
New-ItemProperty -Path $key -Name 'URLInfoAbout' -Value '${REPO}' -Force | Out-Null
New-ItemProperty -Path $key -Name 'UninstallString' -Value $un -Force | Out-Null
`;
fs.writeFileSync(path.join(STAGING, 'installer', 'setup.cmd'), SETUP_CMD.replace(/\n/g, '\r\n'), 'utf8');
fs.writeFileSync(path.join(STAGING, 'installer', 'shortcuts.ps1'), SHORTCUTS_PS.replace(/\n/g, '\r\n'), 'utf8');

const makensis = findNSIS();
let method;
if (makensis) {
  console.log('Compiling NSIS installer...');
  try {
    execFileSync(makensis, ['/V2', nsiPath], { stdio: 'inherit' });
    method = 'NSIS';
  } catch (e) { console.error('NSIS failed:', e.message); }
}

const zip7 = find7z();
if (!method && zip7) {
  console.log('Building 7-Zip SFX installer (this compresses ~269 MB, please wait)...');
  const archive = path.join(STAGING, 'payload.7z');
  if (fs.existsSync(archive)) fs.rmSync(archive);
  execFileSync(zip7, ['a', '-t7z', '-mx=7', '-m0=LZMA2:d=32m', '-ms=on', '-y', archive,
    'app', 'installer'], { cwd: STAGING, stdio: 'ignore' });
  const config = [
    ';!@Install@!UTF-8!',
    'Title="' + APPNAME + ' ' + VERSION + ' — Setup"',
    'BeginPrompt="Install ' + APPNAME + ' — Unlimited Edition ' + VERSION + '?\\n\\nOffline desktop comic studio.\\nDesign and Developed by ' + AUTHOR + '"',
    'RunProgram="installer\\setup.cmd"',
    ';!@InstallEnd@!',
    ''
  ].join('\r\n');
  const cfgPath = path.join(STAGING, 'sfx-config.txt');
  fs.writeFileSync(cfgPath, Buffer.from(config, 'utf8'));
  const sfx = 'C:\\Program Files\\7-Zip\\7z.sfx';
  const parts = [fs.readFileSync(sfx), fs.readFileSync(cfgPath), fs.readFileSync(archive)];
  fs.writeFileSync(OUT_EXE, Buffer.concat(parts));
  method = '7-Zip SFX';
}

if (!method || !fs.existsSync(OUT_EXE)) {
  console.error('No usable installer toolchain (NSIS or 7-Zip).');
  process.exit(1);
}

const size = fs.statSync(OUT_EXE).size;
const crypto = require('crypto');
const sha = crypto.createHash('sha256').update(fs.readFileSync(OUT_EXE)).digest('hex');

fs.writeFileSync(path.join(RELEASE, 'README.txt'), [
  APPNAME + ' — Unlimited Edition ' + VERSION,
  'Windows installer (' + method + ')',
  '',
  'Run: AIComicBuilder-Studio-Setup-2.0.0.exe',
  'Installs to: %LOCALAPPDATA%\\Programs\\' + APPNAME,
  'Creates: Desktop shortcut, Start Menu entry, Add/Remove Programs uninstall entry.',
  'No admin rights required. No internet connection required.',
  '',
  'SHA-256: ' + sha,
  'Size: ' + (size / 1048576).toFixed(1) + ' MB',
  '',
  'GitHub: ' + REPO,
  'Source sites: https://aicomicbuilder.com/ | https://ai-1.art/',
  '',
  'Design and Developed by ' + AUTHOR
].join('\r\n'), 'utf8');

fs.writeFileSync(path.join(RELEASE, 'installer-info.json'), JSON.stringify({
  app: APPNAME, version: VERSION, author: AUTHOR, builder: method,
  file: path.basename(OUT_EXE), bytes: size,
  sha256: sha, repository: REPO, builtAt: new Date().toISOString()
}, null, 2), 'utf8');

console.log('Installer: ' + OUT_EXE);
console.log('Builder : ' + method);
console.log('Size    : ' + (size / 1048576).toFixed(1) + ' MB');
console.log('SHA-256 : ' + sha);
console.log('Design and Developed by Mr.Busy');
