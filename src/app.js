import React, { useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true, corePath: '/lib/ffmpeg-core.js' });

const App = () => {
    const [videoSrc, setVideoSrc] = useState('');
    const [imgSrc, setImageSrc] = useState();
    const [fileInfo, setFileInfo] = useState();
    const [message, setMessage] = useState();

    const handleFileChange = async e => {
        const file = e.target.files[0];
        const { name } = file;
        setFileInfo(file);

        setMessage('load ffmpeg');
        await ffmpeg.load();
        ffmpeg.FS('writeFile', name, await fetchFile(file));
        setMessage('load file');
        await ffmpeg.run('-i', name, 'test.mp4');
        const data = ffmpeg.FS('readFile', 'test.mp4');

        setMessage('decode video');
        const videoData = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        setVideoSrc(videoData);
        setMessage('');
    }

    const handleCapture = async _ => {
        let commandArr = ["-ss","00:00:01","-t","00:00:02","-i",fileInfo.name,"-frames:v","1","-pix_fmt","yuvj422p","-f","image2","capture.jpg","-y"]
        await ffmpeg.run(...commandArr);
        const data = ffmpeg.FS('readFile', 'capture.jpg');

        const imageData = URL.createObjectURL(new Blob([data.buffer], { type: 'image/jpeg' }));
        setImageSrc(imageData);
    }

    return <div>
        <input type='file' onChange={handleFileChange} />
        <div>
            {message}
        </div>
        <div>
            <video src={videoSrc} controls />
        </div>
        
        {videoSrc && <div>
            <input type='button' value='capture' onClick={handleCapture} />
            <div>
                <img style={{width: '20vw'}} src={imgSrc} />
            </div>
        </div>}

        <div></div>
    </div>
}

export default App;