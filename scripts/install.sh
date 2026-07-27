#!/usr/bin/env bash
set -euo pipefail

REPO="Syrenny/my-dash-in-panel"
UUID="dash-in-panel@syrenny"
OLD_UUID="dash-in-panel@fthx"
ZIP_NAME="${UUID}.shell-extension.zip"
DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/${ZIP_NAME}"

die() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

need_command() {
  command -v "$1" >/dev/null 2>&1 || die "required command not found: $1"
}

download() {
  local url="$1"
  local output="$2"

  if command -v curl >/dev/null 2>&1; then
    curl -fL --retry 3 --connect-timeout 15 -o "$output" "$url"
  elif command -v wget >/dev/null 2>&1; then
    wget -O "$output" "$url"
  else
    die "curl or wget is required"
  fi
}

need_command gnome-extensions

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

zip_path="${tmpdir}/${ZIP_NAME}"

printf 'Downloading %s\n' "$DOWNLOAD_URL"
download "$DOWNLOAD_URL" "$zip_path"

if gnome-extensions info "$OLD_UUID" >/dev/null 2>&1; then
  printf 'Disabling upstream extension %s\n' "$OLD_UUID"
  gnome-extensions disable "$OLD_UUID" >/dev/null 2>&1 || true
fi

printf 'Installing %s\n' "$UUID"
gnome-extensions install --force "$zip_path"

printf 'Enabling %s\n' "$UUID"
gnome-extensions enable "$UUID"

cat <<EOF
Installed ${UUID}.

If changes are not visible immediately, restart GNOME Shell or log out and log back in.
On X11, press Alt+F2, type r, and press Enter. On Wayland, log out and log back in.
EOF
