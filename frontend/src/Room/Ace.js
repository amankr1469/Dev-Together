import { useState, useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import axios from 'axios';
import Settings from './EditorSettings.js';
import { diff_match_patch } from 'diff-match-patch';
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-csharp';
import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/mode-rust.js';


import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-cobalt';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/theme-terminal';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-vibrant_ink';
import 'ace-builds/src-noconflict/theme-one_dark'
import 'ace-builds/src-noconflict/ext-language_tools';


const Ace = ({
    updateRoom,
    code,
    setCode,
    language,
    setLanguage,
    roomName,
    roomid,
    EditorRef,
    input,
    setInput,
    output,
    IOEMIT,
    running,
    run
}) => {
    const dmp = new diff_match_patch();
    const [theme, setTheme] = useState('monokai');
    const [fontSize, setFontSize] = useState(18);
    const [fontFamily, setFontFamily] = useState('monospace');
    const sent = useRef(true);


    useEffect(() => {
        if (!sent.current) return;

        sent.current = false;
        const sendData = setTimeout(() => {
            axios({
                method: 'patch',
                url: process.env.REACT_APP_BACKEND_URL + 'rooms/update',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('user')}`
                },
                data: {
                    'room': {
                        roomid,
                        code,
                        language
                    },
                }
            })
                .then((res) => {
                    // console.log("patched successfully", res)
                })
                .catch((err) => {
                    // console.log("error from axios", err)
                })
            sent.current = true;
        }, 2000)



    }, [code])

    useEffect(() => {
        document.querySelector("#change-theme").addEventListener('click', () => {
            if (document.querySelector("#root").classList.contains("dark")) {
                setTheme('monokai')
            } else {
                setTheme('github')
            }
        })
    }, [])


    function handleChange(newValue, event) {

        const patch = dmp.patch_make(code, newValue);
        code = newValue;
        updateRoom(patch);
        setCode(newValue)
        // console.log(code, newValue);
    }

    const handleIOChange = (newValue) => {
        setInput(newValue)
        IOEMIT(newValue, output, language)
    }

    function handleLangChange(e) {
        // save this code in localsotrage in roomid
        setLanguage(e)
        IOEMIT(input, output, e)
    }

    return (
        <div id="editor">
            <Settings
                setLanguage={setLanguage}
                setTheme={setTheme}
                setFontSize={setFontSize}
                setFontFamily={setFontFamily}
                language={language}
                theme={theme}
                fontSize={fontSize}
                fontFamily={fontFamily}
                roomName={roomName}
                updateRoom={updateRoom}
                run={run}
                handleLangChange={handleLangChange}
                roomid={roomid}
                running={running}
            />
            <div id='workspace' >
                <AceEditor
                    setOptions={{
                        useWorker: false,
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        fontFamily,
                        fontSize,
                    }}
                    onChange={handleChange}
                    mode={language}
                    theme={theme}
                    name="ACE_EDITOR"
                    value={code}
                    fontSize={18}
                    height=''
                    width=''
                    setAutoScrollEditorIntoView
                    defaultValue=''
                    ref={EditorRef}
                    editorProps={{ $blockScrolling: true }}
                />
                <div id='io'>
                    <div className="input">
                        <h5>Input</h5>
                        <AceEditor
                            theme={theme}
                            language={''}
                            value={input}
                            width=""
                            height=""
                            onChange={handleIOChange}
                            fontSize={fontSize}
                        />
                    </div>
                    <div className="output">
                        <h5>Output</h5>
                        <AceEditor
                            theme={theme}
                            language={''}
                            value={output}
                            width=""
                            height=""
                            readOnly={true}
                            fontSize={fontSize}
                        />
                    </div>
                </div>
            </div>
        </div >
    )
};

export default Ace;
