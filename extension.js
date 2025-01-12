//    Power Profile Indicator
//    GNOME Shell extension
//    @fthx 2025


import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {SystemIndicator} from 'resource:///org/gnome/shell/ui/quickSettings.js';


const PowerProfileIndicator = GObject.registerClass(
class PowerProfileIndicator extends SystemIndicator {
    _init() {
        super._init();

        this._indicator = this._addIndicator();

        this._timeout = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._powerProfileToggle = Main.panel.statusArea.quickSettings._powerProfiles.quickSettingsItems[0];
            if (this._powerProfileToggle) {
                this._powerProfileToggle._proxy?.connectObject('g-properties-changed', this._setIcon.bind(this), this);
                this._setIcon();
            }

            return GLib.SOURCE_REMOVE;
        });
    }

    _setIcon() {
        this._indicator.icon_name = this._powerProfileToggle.icon_name;

        if (this._activeStyleClassName)
            this._indicator.remove_style_class_name(this._activeStyleClassName);
        this._activeStyleClassName = this._powerProfileToggle._proxy.ActiveProfile;
        if (this._activeStyleClassName)
            this._indicator.add_style_class_name(this._activeStyleClassName);
    }

    _destroy() {
        if (this._timeout) {
            GLib.Source.remove(this._timeout);
            this._timeout = null;
        }

        if (this._powerProfileToggle) {
            this._powerProfileToggle._proxy?.disconnectObject(this);
            this._powerProfileToggle = null;
        }

        this._indicator.destroy();
        this._indicator = null;

        super.destroy();
    }
});

export default class PowerProfileIndicatorExtension {
    enable() {
        this._indicator = new PowerProfileIndicator();
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }

    disable() {
        this._indicator._destroy();
        this._indicator = null;
    }
}
