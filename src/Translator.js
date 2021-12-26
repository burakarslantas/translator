import {useEffect, useState} from "react";
import './Translator.scss';
import axios from "axios";
import './App.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();
mic.continuous = true;
mic.interimResults = true;
mic.lang = 'en-US';

export default function Translator() {
    const [turkishText, setTurkishText] = useState('');
    const [englishText, setEnglishText] = useState('');
    const [history, setHistory] = useState([]);

    const [isListening, setIsListening] = useState(false);
    const [showHistory, setShowHistory] = useState(false);


    useEffect(() => {
        handleListen();
    }, [isListening]);

    const handleListen = () => {
        if (isListening) {
            mic.start()
            mic.onend = () => {
                console.log('continue..')
                mic.start()
            }
        } else {
            mic.stop()
            mic.onend = () => {
                console.log('Stopped Mic on Click')
            }
        }
        mic.onstart = () => {
            console.log('Mic on')
        }

        mic.onresult = event => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setEnglishText(transcript);
            mic.onerror = event => {
                console.log(event.error)
            }
        }
    }

    function getTranslatedText(){
        axios({
            method: 'post',
            url: 'https://libretranslate.de/translate',
            params : {},
            data : {
                q: englishText,
                source: "en",
                target: "tr",
                format: "text"
            },
            headers: { "Content-Type": "application/json" }
        }).then(function (response) {
            if(englishText?.length>0)
                setTurkishText(response.data.translatedText);
            else
                setTurkishText('');
            addHistory(englishText?.length>0 ? response.data.translatedText : '');
            console.log(englishText);
        }).catch((error) => {
            if(error.response.data.error)
                window.alert(error.response.data.error);
            else
                window.alert("Request doesnt work!");
        });

    }

    function addHistory(turkishResponse){
         const historyArr = Object.assign([],history);
         historyArr.push({englishText:englishText,turkishText:turkishResponse});
         setHistory(historyArr);
    }

    function onChangeEnglishText(e){
        setEnglishText(e.target.value);
        if(e.target.value?.length===0)
            setTurkishText("");
    }


    return(
        <div>
            <div className="content">
                <textarea className="" rows="10" cols="100" value={englishText}
                          onChange={(e) => onChangeEnglishText(e)}></textarea>
                <div className="btnGroup"> {!isListening ? <span className="mic">🎙️</span> : <span>🛑</span>}
                    <button className="btn btnStartStop" onClick={() => setIsListening(!isListening)}>
                        {!isListening ? 'Start Mic' : 'Stop'}
                    </button>
                    <button className="btn btnTranslate" onClick={getTranslatedText}>
                        Translate
                    </button>
                    <button className="btn btnTranslate" onClick={() => setShowHistory(!showHistory)}>
                        History
                    </button>
                </div>
                <textarea className="" rows="10" cols="100" value={turkishText} disabled={true}></textarea>
            </div>
            {showHistory &&<div className="history">
                <h1>SEARCH HISTORY</h1>
                <span className=""> English -> Turkish </span>
                {history.length > 0 && history.map((value, key) => {
                    return <div key={key + 1} >
                        <div className="historyItems">
                            <span className="item">{key + 1} - {value.englishText} -></span>
                            <span className="item"> {value.turkishText}</span>
                        </div>
                    </div>
                })}
            </div>}
        </div>
    );
}