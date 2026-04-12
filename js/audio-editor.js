// ============================================================
// CORAZÓNCÓDIGO — EDITOR PROFESIONAL DE MÚSICA (Pro Music Editor)
// Permite previsualizar, reproducir y recortar canciones
// de la biblioteca local. Las músicas solo se reproducen
// en streaming dentro de cada experiencia — sin descarga.
// ============================================================

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function initProMusicEditor() {
    const selMusic         = document.getElementById('selMusic');
    const proEditor        = document.getElementById('proMusicEditor');
    const audio            = document.getElementById('audioPreviewElement');
    const inpMusic         = document.getElementById('inpMusic');
    const editorSongName   = document.getElementById('editorSongName');
    const editorTimer      = document.getElementById('editorTimer');
    const btnPlay          = document.getElementById('btnPlayEditor');
    const btnPreviewTrim   = document.getElementById('btnPreviewTrimPro');
    const waveformBars     = document.getElementById('waveformBars');
    const selectionRange   = document.getElementById('selectionRange');
    const handleLeft       = document.getElementById('handleLeft');
    const handleRight      = document.getElementById('handleRight');
    const editorPlayhead   = document.getElementById('editorPlayhead');
    const editorProgress   = document.getElementById('editorProgress');
    const displayStart     = document.getElementById('displayStart');
    const displayDuration  = document.getElementById('displayDuration');
    const displayEnd       = document.getElementById('displayEnd');
    const musicStartInp    = document.getElementById('musicStart');
    const musicDurationInp = document.getElementById('musicDuration');

    if (!selMusic || !proEditor || !audio) return;

    // Llenar selector de canciones
    selMusic.innerHTML = '<option value="" disabled selected>-- SELECCIONA UNA CANCIÓN --</option>';
    musicLibrary.forEach(song => {
        selMusic.innerHTML += `<option value="${song.path}">${song.name}</option>`;
    });

    let isDragging       = null;
    let isTrimTesting    = false;
    let dragStartXPercent = 0;

    if (!selectionRange.style.left)  selectionRange.style.left  = "0%";
    if (!selectionRange.style.width) selectionRange.style.width = "30%";

    function generateWaveform() {
        waveformBars.innerHTML = '';
        for (let i = 0; i < 70; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = (Math.random() * 60 + 20) + '%';
            waveformBars.appendChild(bar);
        }
    }

    function updateEditorUI() {
        if (!audio.duration || isNaN(audio.duration)) return;
        const leftPos  = parseFloat(selectionRange.style.left)  || 0;
        const widthPos = parseFloat(selectionRange.style.width) || 30;
        const startSec = (leftPos  / 100) * audio.duration;
        const durSec   = (widthPos / 100) * audio.duration;
        const endSec   = startSec + durSec;

        if (musicStartInp) musicStartInp.value    = Math.floor(startSec);
        if (musicDurationInp) musicDurationInp.value = Math.floor(durSec);
        displayStart.innerText    = formatTime(startSec);
        displayDuration.innerText = Math.floor(durSec) + "s";
        displayEnd.innerText      = formatTime(endSec);
        handleLeft.querySelector('.handle-tag').innerText  = formatTime(startSec);
        handleRight.querySelector('.handle-tag').innerText = formatTime(endSec);
        dataForm.musicStart    = Math.floor(startSec);
        dataForm.musicDuration = Math.floor(durSec);
    }

    function syncAudioToRange() {
        if (!audio.duration || isNaN(audio.duration)) return;
        const startSec = (parseFloat(selectionRange.style.left) || 0) / 100 * audio.duration;
        audio.currentTime = startSec;
        updateEditorUI();
    }

    selMusic.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'custom') {
            inpMusic.style.display = 'block';
            proEditor.style.display = 'none';
            audio.pause();
        } else if (val) {
            inpMusic.style.display = 'none';
            proEditor.style.display = 'block';
            editorSongName.innerText = selMusic.options[selMusic.selectedIndex].text;
            const lastLeft  = selectionRange.style.left  || "0%";
            const lastWidth = selectionRange.style.width || "30%";
            // Solución anti-Python: Forzar carga del MP3 a la RAM (Blob) para permitir búsqueda de tiempo exacta sin headers 206
            fetch(val)
                .then(response => response.blob())
                .then(blob => {
                    audio.src = URL.createObjectURL(blob);
                    audio.load();
                    generateWaveform();
                    audio.onloadedmetadata = () => {
                        selectionRange.style.left  = lastLeft;
                        selectionRange.style.width = lastWidth;
                        syncAudioToRange();
                    };
                })
                .catch(err => {
                    // Fallback
                    audio.src = val;
                    audio.load();
                    generateWaveform();
                    audio.onloadedmetadata = () => {
                        selectionRange.style.left  = lastLeft;
                        selectionRange.style.width = lastWidth;
                        syncAudioToRange();
                    };
                });
        }
    });

    function handleDrag(e) {
        if (!isDragging) return;
        const container = document.getElementById('waveformContainer');
        const rect = container.getBoundingClientRect();
        let x = (e.type.includes('touch') ? e.touches[0].clientX : e.clientX) - rect.left;
        let percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        let currentLeft  = parseFloat(selectionRange.style.left)  || 0;
        let currentWidth = parseFloat(selectionRange.style.width) || 30;

        if (isDragging === 'left') {
            const rightEdge = currentLeft + currentWidth;
            const newLeft = Math.min(percent, rightEdge - 2);
            selectionRange.style.left  = newLeft + "%";
            selectionRange.style.width = (rightEdge - newLeft) + "%";
        } else if (isDragging === 'right') {
            selectionRange.style.width = Math.max(2, percent - currentLeft) + "%";
        } else if (isDragging === 'all') {
            let newLeft = percent - dragStartXPercent;
            newLeft = Math.max(0, Math.min(100 - currentWidth, newLeft));
            selectionRange.style.left = newLeft + "%";
        }
        updateEditorUI();
        if (audio.duration) {
            audio.currentTime = (parseFloat(selectionRange.style.left) / 100) * audio.duration;
        }
    }

    [handleLeft, handleRight].forEach(h => {
        const type = h === handleLeft ? 'left' : 'right';
        h.addEventListener('mousedown', (e) => { e.stopPropagation(); isDragging = type; });
        h.addEventListener('touchstart', (e) => { e.stopPropagation(); isDragging = type; });
    });

    selectionRange.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('handle')) return;
        isDragging = 'all';
        const rect = document.getElementById('waveformContainer').getBoundingClientRect();
        const x = e.clientX - rect.left;
        dragStartXPercent = ((x / rect.width) * 100) - (parseFloat(selectionRange.style.left) || 0);
    });

    document.getElementById('waveformContainer').addEventListener('click', (e) => {
        if (isDragging || e.target.closest('#selectionRange')) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (audio.duration) audio.currentTime = (x / rect.width) * audio.duration;
        isTrimTesting = false;
    });

    btnPlay.addEventListener('click', (e) => {
        e.preventDefault();
        if (!audio.src || audio.src === "") return;
        
        if (audio.paused) {
            const leftPercent  = parseFloat(selectionRange.style.left)  || 0;
            const startSec     = (leftPercent / 100) * audio.duration;
            const widthPercent = parseFloat(selectionRange.style.width) || 30;
            const endSec       = startSec + ((widthPercent / 100) * audio.duration);
            
            // Si estaba fuera del margen de la selección, comenzar desde el inicio cortado
            if (audio.currentTime < startSec - 0.5 || audio.currentTime > endSec + 0.5) {
                audio.currentTime = startSec;
            }
            
            isTrimTesting = false; // El modo general no frena agresivamente al final
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    btnPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
                }).catch(err => console.log('Audio catch:', err));
            }
        } else {
            audio.pause();
            btnPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });

    btnPreviewTrim.addEventListener('click', (e) => {
        e.preventDefault();
        if (!audio.duration) return;
        
        // Detener previamente para el reseteo
        audio.pause();

        const startSec = (parseFloat(selectionRange.style.left) / 100) * audio.duration;
        audio.currentTime = startSec;
        isTrimTesting = true; // El flag isTrimTesting detendrá el audio al llegar al END
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
             playPromise.then(() => { 
                 btnPlay.innerHTML = '<i class="fa-solid fa-pause"></i>'; 
             }).catch(err => console.log('Preview Play Error:', err));
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration || isNaN(audio.duration) || isDragging) return; // FIX: No saltar si arrastramos
        
        const progress = (audio.currentTime / audio.duration) * 100;
        editorPlayhead.style.left  = progress + "%";
        editorProgress.style.width = progress + "%";
        editorTimer.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        
        const startSec = (parseFloat(selectionRange.style.left)  / 100) * audio.duration;
        const endSec   = startSec + ((parseFloat(selectionRange.style.width) / 100) * audio.duration);
        
        if (isTrimTesting) {
            // Si es un test de Preview Trim, pausar exactamente al llegar al fin de la selección
            if (audio.currentTime >= endSec) {
                audio.pause();
                isTrimTesting = false;
                btnPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
                audio.currentTime = startSec;
            }
        } else if (!audio.paused) {
            // Comportamiento normal: loop dentro de la selección sin detener obligatoriamente a todo evento si fue arrastrado
            if (audio.currentTime >= endSec) {
                audio.currentTime = startSec;
            }
        }
    });

    // Modal de edición de tiempo preciso
    const timeEditModal  = document.getElementById('timeEditModal');
    const inpTimeEdit    = document.getElementById('inpTimeEdit');
    const btnTimeSave    = document.getElementById('btnTimeSave');
    const btnTimeCancel  = document.getElementById('btnTimeCancel');
    let activeDisplay    = null;

    [displayStart, displayEnd, displayDuration].forEach(display => {
        display.addEventListener('click', () => {
            activeDisplay = display;
            inpTimeEdit.value = display.innerText.replace('s', '');
            timeEditModal.classList.add('active');
            inpTimeEdit.focus();
        });
    });

    btnTimeSave.addEventListener('click', () => {
        let val = inpTimeEdit.value;
        let sec = val.includes(':')
            ? (parseInt(val.split(':')[0]) * 60 + (parseInt(val.split(':')[1]) || 0))
            : parseInt(val);
        if (isNaN(sec)) return;
        const total = audio.duration;
        let left  = parseFloat(selectionRange.style.left)  || 0;
        let width = parseFloat(selectionRange.style.width) || 30;
        if (activeDisplay === displayStart) {
            let newLeft = (sec / total) * 100;
            let currentRight = left + width;
            selectionRange.style.left  = newLeft + "%";
            selectionRange.style.width = Math.max(2, currentRight - newLeft) + "%";
        } else if (activeDisplay === displayEnd) {
            selectionRange.style.width = Math.max(2, (sec / total) * 100 - left) + "%";
        } else {
            selectionRange.style.width = Math.max(2, (sec / total) * 100) + "%";
        }
        updateEditorUI();
        syncAudioToRange();
        timeEditModal.classList.remove('active');
    });

    btnTimeCancel.addEventListener('click', () => timeEditModal.classList.remove('active'));

    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('touchmove', handleDrag);
    window.addEventListener('mouseup',   () => isDragging = null);
    window.addEventListener('touchend',  () => isDragging = null);
}
