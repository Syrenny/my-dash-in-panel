import Gio from 'gi://Gio';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class PowerProfilePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'Dash in Panel extension',
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);


        const groupGlobal = new Adw.PreferencesGroup();
        page.add(groupGlobal);

        const showOverview = new Adw.SwitchRow({
            title: 'Show overview at start-up',
        });
        groupGlobal.add(showOverview);
        window._settings.bind('show-overview', showOverview, 'active', Gio.SettingsBindFlags.DEFAULT);

        const showDash = new Adw.SwitchRow({
            title: 'Show dash in overview',
            subtitle: 'Disable Ubuntu Dock / Dash to Dock for the hiding to work',
        });
        groupGlobal.add(showDash);
        window._settings.bind('show-dash', showDash, 'active', Gio.SettingsBindFlags.DEFAULT);

        const showActivities = new Adw.SwitchRow({
            title: 'Show activities indicator',
        });
        groupGlobal.add(showActivities);
        window._settings.bind('show-activities', showActivities, 'active', Gio.SettingsBindFlags.DEFAULT);

        const moveDate = new Adw.SwitchRow({
            title: 'Move date to the right',
        });
        groupGlobal.add(moveDate);
        window._settings.bind('move-date', moveDate, 'active', Gio.SettingsBindFlags.DEFAULT);

        const centerDash = new Adw.SwitchRow({
            title: 'Move dash to the center',
            subtitle: 'Dash is by default located at the left',
        });
        groupGlobal.add(centerDash);
        window._settings.bind('center-dash', centerDash, 'active', Gio.SettingsBindFlags.DEFAULT);


        const groupPanel = new Adw.PreferencesGroup();
        page.add(groupPanel);

        const showRunning = new Adw.SwitchRow({
            title: 'Show only running apps',
        });
        groupPanel.add(showRunning);
        window._settings.bind('show-running', showRunning, 'active', Gio.SettingsBindFlags.DEFAULT);

        const dimDot = new Adw.SwitchRow({
            title: 'Dim running app indicator opacity when not on active workspace',
        });
        groupPanel.add(dimDot);
        window._settings.bind('dim-dot', dimDot, 'active', Gio.SettingsBindFlags.DEFAULT);

        const showApps = new Adw.SwitchRow({
            title: 'Show app grid button',
        });
        groupPanel.add(showApps);
        window._settings.bind('show-apps', showApps, 'active', Gio.SettingsBindFlags.DEFAULT);

        const showLabel = new Adw.SwitchRow({
            title: 'Show app label on hover',
        });
        groupPanel.add(showLabel);
        window._settings.bind('show-label', showLabel, 'active', Gio.SettingsBindFlags.DEFAULT);

        const scrollPanel = new Adw.SwitchRow({
            title: 'Scroll on panel to change workspace',
        });
        groupPanel.add(scrollPanel);
        window._settings.bind('scroll-panel', scrollPanel, 'active', Gio.SettingsBindFlags.DEFAULT);

        const clickChanged = new Adw.SwitchRow({
            title: 'Modified click behavior',
            subtitle: 'Minimize focus app on click\nThis is disabled in original dash',
        });
        groupPanel.add(clickChanged);
        window._settings.bind('click-changed', clickChanged, 'active', Gio.SettingsBindFlags.DEFAULT);

        const cycleWindows = new Adw.SwitchRow({
            title: 'Cycle through windows',
            subtitle: 'Modified click behavior needs to be activated\nCycle if app has many windows in current workspace',
        });
        groupPanel.add(cycleWindows);
        window._settings.bind('cycle-windows', cycleWindows, 'active', Gio.SettingsBindFlags.DEFAULT);


        const groupStyle = new Adw.PreferencesGroup();
        page.add(groupStyle);

        const adjustmentButtonMargin = new Gtk.Adjustment({
            lower: 0,
            upper: 20,
            step_increment: 1,
        });

        const buttonMargin = new Adw.SpinRow({
            title: 'App button horizontal margin',
            subtitle: 'Default: 2px',
            adjustment: adjustmentButtonMargin
        });
        groupStyle.add(buttonMargin);
        window._settings.bind('button-margin', buttonMargin, 'value', Gio.SettingsBindFlags.DEFAULT);

        const adjustmentPanelHeight = new Gtk.Adjustment({
            lower: 16,
            upper: 64,
            step_increment: 1,
        });

        const panelHeight = new Adw.SpinRow({
            title: 'Top panel height',
            subtitle: 'Default: 32px',
            adjustment: adjustmentPanelHeight
        });
        groupStyle.add(panelHeight);
        window._settings.bind('panel-height', panelHeight, 'value', Gio.SettingsBindFlags.DEFAULT);

        const adjustmentIconSize = new Gtk.Adjustment({
            lower: 12,
            upper: 56,
            step_increment: 1,
        });

        const iconSize = new Adw.SpinRow({
            title: 'Icon size',
            subtitle: 'Default: 20px',
            adjustment: adjustmentIconSize
        });
        groupStyle.add(iconSize);
        window._settings.bind('icon-size', iconSize, 'value', Gio.SettingsBindFlags.DEFAULT);

        const indicatorColor = new Adw.ActionRow({
            title: 'Running indicator color',
            subtitle: 'Default: Ubuntu Orange',
        });
        const colorButton = new Gtk.ColorButton({
            valign: Gtk.Align.CENTER,
        });
        const rgba = new Gdk.RGBA();
        rgba.parse(window._settings.get_string('indicator-color'));
        colorButton.set_rgba(rgba);
        colorButton.connect('color-set', () => {
            window._settings.set_string('indicator-color', colorButton.get_rgba().to_string());
        });
        indicatorColor.add_suffix(colorButton);
        indicatorColor.activatable_widget = colorButton;
        groupStyle.add(indicatorColor);
    }
}
