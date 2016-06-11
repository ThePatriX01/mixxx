/*
 * This mapping is still being worked on and is not finished.
 * Author: Prism with help from Be, deresh, and msweeney.
 * Mixxx Version: 1.12.0-beta1 (build 1.12 r5442)
 * System: Ubuntu 15.04
 * @see https://www.mixxx.org/forums/viewtopic.php?f=7&t=7514
 */

function AMX() {}

AMX.SEARCH_STEP = 0.05;
AMX.SEARCH_STEP_FINE = 0.01;

AMX.GAIN_STEP = 0.05;

AMX.masterVUMeters = {
    'VUMeterL': {'ch': 0xB0, 'midino': 0x3E},
    'VUMeterR': {'ch': 0xB0, 'midino': 0x3F}
};

AMX.channelVUMeters = {
    '[Channel1]': {'ch': 0xB0, 'midino': 0x40},
    '[Channel2]': {'ch': 0xB0, 'midino': 0x41}
};

AMX.playLeds = {
    '[Channel1]': {'ch': 0x90, 'midino': 0x0A},
    '[Channel2]': {'ch': 0x90, 'midino': 0x0B}
};

AMX.cueLeds = {
    '[Channel1]': {'ch': 0x90, 'midino': 0x08},
    '[Channel2]': {'ch': 0x90, 'midino': 0x09}
};

AMX.activeModes = {
    shift: false,
    search1: false,
    search2: false,
    browseMain: true
};

AMX.decks = [
    '[Channel1]',
    'Channel2]'
];

AMX.init = function() {
    //connect VUmeters
    engine.connectControl('[Master]', 'VUMeterL', 'AMX.volumeLEDs');
    engine.connectControl('[Master]', 'VUMeterR', 'AMX.volumeLEDs');
    engine.connectControl('[Channel1]', 'VUMeter', 'AMX.volumeLEDs');
    engine.connectControl('[Channel2]', 'VUMeter', 'AMX.volumeLEDs');
    engine.connectControl('[Channel1]', 'play_indicator', 'AMX.indicators');
    engine.connectControl('[Channel2]', 'play_indicator', 'AMX.indicators');
    engine.connectControl('[Channel1]', 'cue_indicator', 'AMX.indicators');
    engine.connectControl('[Channel2]', 'cue_indicator', 'AMX.indicators');

    midi.sendShortMsg(0x90,0x06,0x00); //Sync Channel 1 
    midi.sendShortMsg(0x90,0x07,0x00); //Sync Channel 2
    midi.sendShortMsg(0x90,0x0C,0x00); //PFL Channel 1
    midi.sendShortMsg(0x90,0x0D,0x00); //PFL Channel 2
    midi.sendShortMsg(0x90,0x04,0x00); //Load Track Channel 1
    midi.sendShortMsg(0x90,0x05,0x00); //Load Track Channel 2
    midi.sendShortMsg(0x90,0x08,0x00); //Cue Channel 1
    midi.sendShortMsg(0x90,0x09,0x00); //Cue Channel 2
    midi.sendShortMsg(0x90,0x0A,0x00); //Play Channel 1
    midi.sendShortMsg(0x90,0x0B,0x00); //Play Channel 2
    midi.sendShortMsg(0x90,0x19,0x00); //Touch Button
    midi.sendShortMsg(0x90,0x0C,0x00); //PFL Channel 1
    midi.sendShortMsg(0x90,0x0D,0x00); //PFL Channel 2
};

AMX.shutdown = function() {
    // clear VU meter LEDs
    var masterVU = AMX.masterVUMeters;
    var channelVU = AMX.channelVUMeters;
    var deck1 = AMX.decks[0];
    var deck2 = AMX.decks[1];

    midi.sendShortMsg(masterVU.VUMeterL.ch, masterVU.VUMeterL.midino, 0);
    midi.sendShortMsg(masterVU.VUMeterR.ch, masterVU.VUMeterR.midino, 0);
    midi.sendShortMsg(channelVU[deck1].ch, channelVU[deck1].midino, 0);
    midi.sendShortMsg(channelVU[deck2].ch, channelVU[deck2].midino, 0);

    midi.sendShortMsg(0x90,0x06,0x00); //Sync Channel 1 
    midi.sendShortMsg(0x90,0x07,0x00); //Sync Channel 2
    midi.sendShortMsg(0x90,0x0C,0x00); //PFL Channel 1
    midi.sendShortMsg(0x90,0x0D,0x00); //PFL Channel 2
    midi.sendShortMsg(0x90,0x04,0x00); //Load Track Channel 1
    midi.sendShortMsg(0x90,0x05,0x00); //Load Track Channel 2
    midi.sendShortMsg(0x90,0x08,0x00); //Cue Channel 1
    midi.sendShortMsg(0x90,0x09,0x00); //Cue Channel 2
    midi.sendShortMsg(0x90,0x0A,0x00); //Play Channel 1
    midi.sendShortMsg(0x90,0x0B,0x00); //Play Channel 2
    midi.sendShortMsg(0x90,0x01,0x00); //Pannel Button
    midi.sendShortMsg(0x90,0x19,0x00); //Touch Button
    midi.sendShortMsg(0x90,0x0C,0x00); //PFL Channel 1
    midi.sendShortMsg(0x90,0x0D,0x00); //PFL Channel 2
};

AMX.toggleMode = function(mode) {
    AMX.activeModes[mode] = !AMX.activeModes[mode];
    print(mode + ' mode: ' + AMX.activeModes[mode]);
};

AMX.volumeLEDs = function(value, group, control) {
    value *= 85;
    var ch, midino;

    if (group === '[Master]') {
        ch = AMX.masterVUMeters[control].ch;
        midino = AMX.masterVUMeters[control].midino;
    } else {
        ch = AMX.channelVUMeters[group].ch;
        midino = AMX.channelVUMeters[group].midino;
    }
    midi.sendShortMsg(ch, midino, value);
};

AMX.indicators = function(value, group, control) {
    if (control === 'play_indicator') {
        midi.sendShortMsg(AMX.playLeds[group].ch, AMX.playLeds[group].midino, value);
    }
    if (control === 'cue_indicator') {
        midi.sendShortMsg(AMX.cueLeds[group].ch, AMX.cueLeds[group].midino, value);
    }
};

AMX.browseTracks = function(group, selectPrevious) {
    var action = (selectPrevious) ? 'SelectPrevTrack' : 'SelectNextTrack';
    engine.setValue(group, action, 1);
};      
  
AMX.browseSidebar = function(group, selectPrevious) {
    var action = (selectPrevious) ? 'SelectPrevPlaylist' : 'SelectNextPlaylist';
    engine.setValue(group, action, 1);
};

AMX.toggleSelectedDirectory = function() {
    engine.setValue('[Playlist]', 'ToggleSelectedSidebarItem', 1);
};

AMX.stepPlayPosition = function(group, isSmallStep, decreasing) {
    var step = (isSmallStep) ? AMX.SEARCH_STEP_FINE : AMX.SEARCH_STEP;
    if (decreasing) step = -step;
    var position = engine.getValue(group, 'playposition') + step;
    if (position < 0) position = 0;
    if (position > 1) position = 1;

    engine.setValue(group, 'playposition', position);
};

AMX.stepGain = function(group, decreasing) {
    var step = (decreasing) ? -AMX.GAIN_STEP : AMX.GAIN_STEP;
    var gain = engine.getValue(group, 'pregain') + step;
    engine.setValue(group, 'pregain', gain);
};

AMX.stepRate = function(group, decreasing) {
    var action = (decreasing) ? 'rate_down_small' : 'rate_up_small';
    engine.setValue(group, action, 1);
};

// Event handlers (prefixed with "on") are mapped from `Akai-AMX.midi.xml`.

AMX.onXFaderCurveTwist = function(channel, control, value) {
    script.crossfaderCurve(value, 0, 127);
};

AMX.onGainTwist = function(channel, control, value, status, group) {
    // The `value` can vary slightly depending on knob twist speed;
    // but it always above 100 if going backward (usually 127).
    var isLeftTwist = (value > 100);

    // Use gain knob for pitch control when shift is pressed.
    if (!AMX.activeModes.shift) {
        AMX.stepGain(group, isLeftTwist);
    } else {
        AMX.stepRate(group, isLeftTwist);
    }
};

AMX.onBrowseTwist = function(channel, control, value, status, group) {
    // Search on scroll if either search button is pressed. 
    var search1 = AMX.activeModes.search1;
    var search2 = AMX.activeModes.search2;
    var goLeft = (value === 127);

    // Search current track if either search button is pressed.
    if (search1 || search2) {
        var shift = (AMX.activeModes.shift);
        search1 && AMX.stepPlayPosition(AMX.decks[0], shift, goLeft);
        search2 && AMX.stepPlayPosition(AMX.decks[1], shift, goLeft);
    // Browse through tracks and directories.
    } else if (AMX.activeModes.browseMain) {
        AMX.browseTracks(group, goLeft);
    } else {
        AMX.browseSidebar(group, goLeft);
    }
};

AMX.onBrowsePress = function(channel, control, value, status, group) {
    if (AMX.activeModes.shift) {
        AMX.toggleSelectedDirectory();
    } else {
        AMX.toggleMode('browseMain');
        if (AMX.activeModes.browseMain) {
            AMX.browseTracks(group);
        } else {
            AMX.browseSidebar(group);
        }
    }
};

AMX.onShiftPress = function() {
    AMX.toggleMode('shift');
};

AMX.onSearchPress = function(channel, control, value) {
    var button = (control === 2) ? 'search1' : 'search2';
    AMX.toggleMode(button);
};

