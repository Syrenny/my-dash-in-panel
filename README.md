# Dash in Panel Adaptive

A personal GNOME Shell extension that moves the app dash into the top panel, with adaptive sizing, wide click targets, running indicators, and a configurable indicator color.

![Dash in Panel Adaptive](assets/screenshot.png)

## Install

GNOME Shell 46-50 is supported.

```bash
curl -fsSL https://github.com/Syrenny/my-dash-in-panel/releases/latest/download/install.sh | bash
```

Restart GNOME Shell after installation. On X11, press `Alt+F2`, enter `r`, and press Enter. On Wayland, log out and back in.

## Update

Run the installation command again. It downloads and installs the latest GitHub release.

Open the extension settings with:

```bash
gnome-extensions prefs dash-in-panel@syrenny
```

Based on [fthx/dash-in-panel](https://github.com/fthx/dash-in-panel).
