import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
    AppBar, Toolbar, IconButton, Typography,
    FormControl, InputLabel, Select, MenuItem
} from "@mui/material";

const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
    { value: 'c_cpp', label: 'C/C++' },
    { value: 'golang', label: 'Go' },
    { value: 'csharp', label: 'C#' },
    { value: 'rust', label: 'Rust' }
];

const themeOptions = [
    { value: 'github', label: 'Github' },
    { value: 'cobalt', label: 'Cobalt' },
    { value: 'dracula', label: 'Dracula' },
    { value: 'monokai', label: 'Monokai' },
    { value: 'xcode', label: 'Xcode' },
    { value: 'terminal', label: 'Terminal' },
    { value: 'tomorrow_night', label: 'Tomorrow Night' },
    { value: 'solarized_dark', label: 'Solarized Dark' },
    { value: 'vibrant_ink', label: 'Vibrant Ink' },
    { value: 'one_dark', label: 'One Dark' }
];

const fontFamilyOptions = [
    { value: 'monospace', label: 'Monospace' },
    { value: 'Ubuntu Mono', label: 'Ubuntu Mono' },
    { value: 'Fira Code', label: 'Fira Code' },
    { value: 'Roboto Mono', label: 'Roboto Mono' },
    { value: 'Cascadia Code', label: 'Cascadia Code' },
    { value: 'Consolas', label: 'Consolas' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Lucida Console', label: 'Lucida Console' },
    { value: 'Lucida Sans Typewriter', label: 'Lucida Sans Typewriter' },
    { value: 'Lucida Typewriter', label: 'Lucida Typewriter' },
];

const fontSizeOptions = [14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40];


const Settings = ({
    setTheme,
    setFontSize,
    setFontFamily,
    language,
    theme,
    fontSize,
    fontFamily,
    roomName,
    run,
    handleLangChange,
    roomid,
    running

}) => {

    return (
        <div className="editor-settings">
            <AppBar position='Static' style={{ minHeight: 70 }} >
                <Toolbar>
                    <Typography variant="h5" style={{ flexGrow: 5 }}>
                        {roomName}{'\n' + roomid}
                    </Typography>
                    <FormControl style={{ minWidth: 100, maxHeight: 40, marginRight: "16px" }}>
                        <InputLabel id="language-selector-label">Language</InputLabel>
                        <Select
                            labelId="language-selector-label"
                            id="language-selector"
                            value={language}
                            onChange={(e) => handleLangChange(e.target.value)}
                        >
                            {languageOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl style={{ minWidth: 100, maxHeight: 40 }}>
                        <InputLabel id="theme-selector-label">Theme</InputLabel>
                        <Select
                            labelId="theme-selector-label"
                            id="theme-selector"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            {themeOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl style={{ minWidth: 100, marginLeft: "16px", maxHeight: 40 }}>
                        <InputLabel id="font-family-selector-label">Font Family</InputLabel>
                        <Select
                            labelId="font-family-selector-label"
                            id="font-family-selector"
                            value={fontFamily}
                            onChange={(e) => setFontFamily(e.target.value)}
                        >
                            {fontFamilyOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl style={{ minWidth: 70, marginLeft: "16px", maxHeight: 40 }}>
                        <InputLabel id="font-size-selector-label">Font Size</InputLabel>
                        <Select
                            labelId="font-size-selector-label"
                            id="font-size-selector"
                            value={fontSize}
                            onChange={(e) => setFontSize(e.target.value)}
                        >
                            {fontSizeOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <IconButton
                        {...{ disabled: running }}
                        color="inherit" style={{ marginL: '10px', maxHeight: 40 }} onClick={run}>
                        <PlayArrowIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

        </div >
    )

}

export default Settings;