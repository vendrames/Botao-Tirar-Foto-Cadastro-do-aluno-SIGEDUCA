// ==UserScript==
// @name         Botão Tirar Foto - Cadastro do Aluno
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Insere o Botão "Tirar foto" com modal elegante de captura por webcam no cadastro de aluno do SIGEDUCA e fornece instruções de ajuda para o Firefox.
// @author       Vitor Vendrame
// @match        *://sigeduca.seduc.mt.gov.br/ged/hwtmgedaluno.aspx?*
// @icon         https://cdn-icons-png.flaticon.com/64/4181/4181788.png
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ─── SVG ICONS ──────────────────────────────────────────────────────────────

    const SVG = {
        camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
        x:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        check:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        redo:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.99"/></svg>`,
        question: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    };

    // ─── CSS ────────────────────────────────────────────────────────────────────

    const style = document.createElement('style');
    style.textContent = `
        /* === Reset do container original === */
        #UPLOADIFYFOTOContainer { margin: 0 !important; padding: 0 !important; height: auto !important; }

        /* === Wrapper dos botões abaixo do container === */
        .sg-botoes-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-top: 4px;
        }

        /* === Botão "Tirar foto" (trigger) === */
        #sg-trigger-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: linear-gradient(180deg, #f0a020 0%, #c87800 100%);
            color: #fff;
            border: 1px solid #a06000;
            border-radius: 3px;
            padding: 5px 14px;
            font-family: Verdana, Arial, sans-serif;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: opacity .15s;
        }
        #sg-trigger-btn:hover { opacity: .88; }
        #sg-trigger-btn svg {
            width: 14px; height: 14px;
            stroke: #fff; stroke-width: 2; fill: none;
            stroke-linecap: round; stroke-linejoin: round;
        }

        /* === Botão de ajuda (?) === */
        #sg-help-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px; height: 24px;
            border-radius: 50%;
            border: 1px solid #bbb;
            background: #f5f5f5;
            cursor: help;
            color: #555;
            padding: 0;
            transition: background .15s, border-color .15s;
        }
        #sg-help-btn:hover { background: #e0e8f5; border-color: #1e6fd9; color: #1e6fd9; }
        #sg-help-btn svg { width: 13px; height: 13px; }

        /* === Animações === */
        @keyframes sg-fadein  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sg-modal-in {
            from { opacity: 0; transform: translate(-50%, calc(-50% - 16px)) scale(.93); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes sg-spin    { to { transform: rotate(360deg); } }
        @keyframes sg-flash   { 0% { opacity: .85; } 100% { opacity: 0; } }
        @keyframes sg-pulse   { 0%,100% { opacity: 1; } 50% { opacity: .28; } }

        /* === Backdrop === */
        #sg-backdrop {
            position: fixed; inset: 0; z-index: 999998;
            background: rgba(0,0,0,.65);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            animation: sg-fadein .22s ease forwards;
        }

        /* === Modal === */
        #sg-modal {
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            z-index: 999999;
            width: 380px;
            border-radius: 16px;
            overflow: hidden;
            background: linear-gradient(145deg, #1e2a3a 0%, #0f1923 100%);
            box-shadow: 0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.06);
            font-family: Arial, sans-serif;
            animation: sg-modal-in .28s cubic-bezier(.34,1.48,.64,1) forwards;
        }

        /* Header */
        #sg-modal .sg-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 20px;
            border-bottom: 1px solid rgba(255,255,255,.08);
            background: linear-gradient(90deg, rgba(30,80,160,.35) 0%, rgba(20,40,80,.2) 100%);
        }
        #sg-modal .sg-header-left { display: flex; align-items: center; gap: 12px; }
        #sg-modal .sg-icon-badge {
            width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, #1e6fd9 0%, #1353a8 100%);
            box-shadow: 0 4px 12px rgba(30,111,217,.4);
        }
        #sg-modal .sg-icon-badge svg { width: 16px; height: 16px; }
        #sg-modal .sg-title {
            color: #fff; font-size: 15px; font-weight: 700;
            margin: 0; line-height: 1.3;
        }
        #sg-modal .sg-subtitle {
            color: rgba(255,255,255,.4); font-size: 11px;
            margin: 2px 0 0; line-height: 1.4;
        }
        #sg-modal .sg-close {
            width: 30px; height: 30px; padding: 0; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            border-radius: 8px;
            background: rgba(255,255,255,.06);
            border: 1px solid rgba(255,255,255,.08);
            color: rgba(255,255,255,.5);
            cursor: pointer;
            transition: background .15s, color .15s;
        }
        #sg-modal .sg-close:hover { background: rgba(220,50,50,.25); color: #ff6b6b; }
        #sg-modal .sg-close svg { width: 14px; height: 14px; display: block; }

        /* Viewport */
        #sg-modal .sg-video-wrap {
            display: flex; flex-direction: column; align-items: center;
            padding: 20px 20px 8px;
        }
        #sg-modal .sg-viewport {
            position: relative; width: 320px; height: 240px;
            border-radius: 10px; overflow: hidden; background: #000;
            box-shadow: 0 0 0 2px rgba(30,111,217,.3), 0 8px 32px rgba(0,0,0,.5);
        }

        /* Corner accents */
        #sg-modal .sg-corner {
            position: absolute; width: 16px; height: 16px;
            z-index: 2; border-color: rgba(30,111,217,.7); border-style: solid;
        }
        #sg-modal .sg-corner-tl { top:0; left:0;   border-width:2px 0 0 2px; border-radius:4px 0 0 0; }
        #sg-modal .sg-corner-tr { top:0; right:0;  border-width:2px 2px 0 0; border-radius:0 4px 0 0; }
        #sg-modal .sg-corner-bl { bottom:0; left:0;  border-width:0 0 2px 2px; border-radius:0 0 0 4px; }
        #sg-modal .sg-corner-br { bottom:0; right:0; border-width:0 2px 2px 0; border-radius:0 0 4px 0; }

        /* Mídia */
        #sg-modal #sg-video, #sg-modal #sg-snapshot {
            position: absolute; inset: 0;
            width: 100%; height: 100%; object-fit: cover;
        }
        #sg-modal #sg-video    { transform: scaleX(-1); display: block; }
        #sg-modal #sg-snapshot { display: none; }

        /* Overlays */
        #sg-modal .sg-overlay {
            position: absolute; inset: 0; background: #000;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
        }
        #sg-modal .sg-spinner {
            width: 32px; height: 32px; margin-bottom: 10px;
            border: 2px solid transparent; border-top-color: #1e6fd9;
            border-radius: 50%;
            animation: sg-spin .75s linear infinite;
        }
        #sg-modal .sg-overlay p { color: rgba(255,255,255,.4); font-size: 12px; margin: 0; }
        #sg-modal .sg-overlay-error p { color: rgba(255,255,255,.55); }

        #sg-modal .sg-flash {
            position: absolute; inset: 0; background: #fff; pointer-events: none;
            animation: sg-flash .4s ease forwards;
        }

        /* Barra de status */
        #sg-modal .sg-status {
            display: flex; align-items: center; gap: 6px;
            margin-top: 10px; min-height: 18px;
        }
        #sg-modal .sg-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: #22c55e; flex-shrink: 0;
            animation: sg-pulse 1.4s ease-in-out infinite;
        }
        #sg-modal .sg-status span { color: rgba(255,255,255,.35); font-size: 11px; }
        #sg-modal .sg-status svg {
            width: 13px; height: 13px; flex-shrink: 0;
            stroke: #22c55e; stroke-width: 2; fill: none;
            stroke-linecap: round; stroke-linejoin: round;
        }
        #sg-modal .sg-status-error span { color: rgba(239,68,68,.7); }

        /* Divisor */
        #sg-modal .sg-divider { height: 1px; background: rgba(255,255,255,.06); margin: 0 20px; }

        /* Footer / botões */
        #sg-modal .sg-footer { display: flex; gap: 12px; padding: 18px 20px; }
        #sg-modal .sg-btn {
            flex: 1; display: flex; align-items: center;
            justify-content: center; gap: 7px;
            height: 44px; border-radius: 10px; border-style: solid; border-width: 1px;
            font-size: 14px; font-weight: 700; letter-spacing: .2px;
            cursor: pointer;
            transition: background .15s, box-shadow .15s, border-color .15s;
        }
        #sg-modal .sg-btn:disabled { opacity: .45; cursor: not-allowed; }
        #sg-modal .sg-btn svg {
            width: 15px; height: 15px; flex-shrink: 0;
            stroke: currentColor; stroke-width: 2; fill: none;
            stroke-linecap: round; stroke-linejoin: round;
        }
        #sg-modal .sg-btn-cancel {
            background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.3); color: #f87171;
        }
        #sg-modal .sg-btn-cancel:hover:not(:disabled) {
            background: rgba(239,68,68,.22); border-color: rgba(239,68,68,.5);
        }
        #sg-modal .sg-btn-capture {
            background: linear-gradient(135deg,#16a34a 0%,#15803d 100%);
            border-color: rgba(34,197,94,.3); color: #fff;
            box-shadow: 0 4px 16px rgba(22,163,74,.35);
        }
        #sg-modal .sg-btn-capture:hover:not(:disabled) {
            background: linear-gradient(135deg,#15803d 0%,#166534 100%);
            box-shadow: 0 6px 20px rgba(22,163,74,.45);
        }
        #sg-modal .sg-btn-retake {
            background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.1);
            color: rgba(255,255,255,.65);
        }
        #sg-modal .sg-btn-retake:hover { background: rgba(255,255,255,.11); }
        #sg-modal .sg-btn-confirm {
            background: linear-gradient(135deg,#1e6fd9 0%,#1353a8 100%);
            border-color: rgba(30,111,217,.4); color: #fff;
            box-shadow: 0 4px 16px rgba(30,111,217,.4);
        }
        #sg-modal .sg-btn-confirm:hover {
            background: linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);
            box-shadow: 0 6px 20px rgba(30,111,217,.5);
        }

        #sg-canvas { display: none; }
    `;
    document.head.appendChild(style);

    // ─── HTML DO MODAL ───────────────────────────────────────────────────────────

    // Canvas oculto para captura
    const canvas = document.createElement('canvas');
    canvas.id = 'sg-canvas';
    canvas.width = 320; canvas.height = 240;
    document.body.appendChild(canvas);

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'sg-backdrop';
    backdrop.style.display = 'none';
    document.body.appendChild(backdrop);

    // Modal
    const modal = document.createElement('div');
    modal.id = 'sg-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="sg-header">
            <div class="sg-header-left">
                <div class="sg-icon-badge">${SVG.camera}</div>
                <div>
                    <p class="sg-title">Capturar Foto</p>
                    <p class="sg-subtitle" id="sg-subtitle">Posicione o rosto do aluno no quadro</p>
                </div>
            </div>
            <button class="sg-close" id="sg-close" title="Fechar">${SVG.x}</button>
        </div>

        <div class="sg-video-wrap">
            <div class="sg-viewport">
                <div class="sg-corner sg-corner-tl"></div>
                <div class="sg-corner sg-corner-tr"></div>
                <div class="sg-corner sg-corner-bl"></div>
                <div class="sg-corner sg-corner-br"></div>

                <video id="sg-video" autoplay playsinline muted></video>
                <img   id="sg-snapshot" alt="Foto capturada" />

                <div class="sg-overlay" id="sg-overlay-loading">
                    <div class="sg-spinner"></div>
                    <p>Iniciando câmera…</p>
                </div>

                <div class="sg-overlay sg-overlay-error" id="sg-overlay-error" style="display:none;">
                    <p style="font-size:28px;margin:0 0 8px;">📷</p>
                    <p id="sg-error-msg" style="text-align:center;padding:0 16px;line-height:1.5;font-size:12px;"></p>
                </div>
            </div>

            <div class="sg-status" id="sg-status">
                <div class="sg-dot"></div>
                <span>Câmera ativa</span>
            </div>
        </div>

        <div class="sg-divider"></div>

        <div class="sg-footer">
            <button class="sg-btn sg-btn-cancel"  id="sg-btn-cancel">${SVG.x} Cancelar</button>
            <button class="sg-btn sg-btn-capture" id="sg-btn-capture" disabled>${SVG.camera} Capturar</button>
            <button class="sg-btn sg-btn-retake"  id="sg-btn-retake"  style="display:none;">${SVG.redo} Tirar novamente</button>
            <button class="sg-btn sg-btn-confirm" id="sg-btn-confirm" style="display:none;">${SVG.check} Usar foto</button>
        </div>
    `;
    document.body.appendChild(modal);

    // ─── ESTADO ──────────────────────────────────────────────────────────────────

    let currentStream   = null;
    let capturedDataUrl = null;

    // ─── AJUDA FIREFOX ───────────────────────────────────────────────────────────

    function mostrarAjuda() {
        alert(
            'Passo a Passo no Firefox:\n\n' +
            '1. Digite about:config na barra de endereços e aperte Enter.\n' +
            '2. Clique no botão "Aceitar o risco e continuar".\n' +
            '3. Na barra de pesquisa, cole: media.devices.insecure.enabled\n' +
            '4. Altere o valor para true clicando no botão de alternar.\n' +
            '5. Agora, procure por: media.getusermedia.insecure.enabled\n' +
            '6. Mude também para true.\n' +
            '7. Reinicie o Firefox e tente clicar no botão "Tirar foto" novamente.'
        );
    }

    // ─── CÂMERA ──────────────────────────────────────────────────────────────────

    function startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            document.getElementById('sg-overlay-loading').style.display = 'none';
            document.getElementById('sg-overlay-error').style.display   = 'flex';
            document.getElementById('sg-error-msg').textContent =
                'O navegador bloqueou a câmera por este site não ser seguro (HTTP). ' +
                'Feche este modal e clique no ícone (?) para ver as instruções do Firefox.';
            setStatus('error');
            return;
        }

        navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, facingMode: 'user' },
            audio: false
        })
        .then(function (s) {
            currentStream = s;
            const video = document.getElementById('sg-video');
            video.srcObject = s;
            video.onloadedmetadata = function () {
                document.getElementById('sg-overlay-loading').style.display = 'none';
                document.getElementById('sg-btn-capture').disabled = false;
                setStatus('active');
            };
        })
        .catch(function (err) {
            document.getElementById('sg-overlay-loading').style.display = 'none';
            document.getElementById('sg-overlay-error').style.display   = 'flex';
            document.getElementById('sg-error-msg').textContent =
                'Não foi possível acessar a câmera: ' + err.message;
            setStatus('error');
        });
    }

    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(function (t) { t.stop(); });
            currentStream = null;
        }
    }

    // ─── CICLO DO MODAL ──────────────────────────────────────────────────────────

    function openModal() {
        resetToPreview();

        // Re-dispara animação ao reabrir
        modal.style.animation = 'none';
        modal.offsetHeight; // force reflow
        modal.style.animation = '';

        backdrop.style.display = 'block';
        modal.style.display    = 'block';

        startCamera();
    }

    function closeModal() {
        stopCamera();
        backdrop.style.display = 'none';
        modal.style.display    = 'none';
    }

    function resetToPreview() {
        capturedDataUrl = null;

        document.getElementById('sg-video').style.display            = 'block';
        document.getElementById('sg-snapshot').style.display         = 'none';
        document.getElementById('sg-snapshot').src                   = '';
        document.getElementById('sg-overlay-loading').style.display  = 'flex';
        document.getElementById('sg-overlay-error').style.display    = 'none';
        document.getElementById('sg-subtitle').textContent           = 'Posicione o rosto do aluno no quadro';

        document.getElementById('sg-btn-cancel').style.display  = 'flex';
        document.getElementById('sg-btn-capture').style.display = 'flex';
        document.getElementById('sg-btn-capture').disabled      = true;
        document.getElementById('sg-btn-retake').style.display  = 'none';
        document.getElementById('sg-btn-confirm').style.display = 'none';

        setStatus('active');
    }

    // ─── FLUXO DE CAPTURA ────────────────────────────────────────────────────────

    function capturePhoto() {
        const video    = document.getElementById('sg-video');
        const snapshot = document.getElementById('sg-snapshot');
        const canvas   = document.getElementById('sg-canvas');
        const viewport = document.querySelector('.sg-viewport');

        canvas.width  = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        // Desfaz o espelhamento do vídeo para salvar a imagem correta
        ctx.translate(320, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, 320, 240);
        capturedDataUrl = canvas.toDataURL('image/jpeg', 0.92);

        stopCamera();

        // Efeito flash
        const flash = document.createElement('div');
        flash.className = 'sg-flash';
        viewport.appendChild(flash);
        flash.addEventListener('animationend', function () { flash.remove(); });

        // Muda para visualização do snapshot
        snapshot.src           = capturedDataUrl;
        snapshot.style.display = 'block';
        video.style.display    = 'none';
        document.getElementById('sg-subtitle').textContent = 'Confirme a foto capturada';

        document.getElementById('sg-btn-cancel').style.display  = 'none';
        document.getElementById('sg-btn-capture').style.display = 'none';
        document.getElementById('sg-btn-retake').style.display  = 'flex';
        document.getElementById('sg-btn-confirm').style.display = 'flex';

        setStatus('captured');
    }

    function retakePhoto() {
        resetToPreview();
        startCamera();
    }

    function confirmPhoto() {
        if (capturedDataUrl) {
            // ── Integração com o SIGEDUCA ────────────────────────────────────────
            // Substitui o <img> da foto do aluno diretamente, igual ao v2.2.
            const imgAluno = document.querySelector('img[id*="FOTOALUNO"]');
            if (imgAluno) {
                imgAluno.src = capturedDataUrl;
            }
        }
        closeModal();
    }

    // ─── HELPER STATUS ────────────────────────────────────────────────────────────

    function setStatus(state) {
        const el = document.getElementById('sg-status');
        el.className = 'sg-status';

        if (state === 'active') {
            el.innerHTML = '<div class="sg-dot"></div><span>Câmera ativa</span>';
        } else if (state === 'captured') {
            el.innerHTML = `${SVG.check}<span>Foto capturada</span>`;
        } else if (state === 'error') {
            el.className = 'sg-status sg-status-error';
            el.innerHTML = '<span>Erro de câmera</span>';
        }
    }

    // ─── WIRE EVENTOS DO MODAL ────────────────────────────────────────────────────

    backdrop.addEventListener('click', closeModal);
    document.getElementById('sg-close').addEventListener('click', closeModal);
    document.getElementById('sg-btn-cancel').addEventListener('click', closeModal);
    document.getElementById('sg-btn-capture').addEventListener('click', capturePhoto);
    document.getElementById('sg-btn-retake').addEventListener('click', retakePhoto);
    document.getElementById('sg-btn-confirm').addEventListener('click', confirmPhoto);

    // ─── INSERÇÃO DOS BOTÕES (polling, idêntico ao v2.2) ─────────────────────────

    function inserirElementos() {
        const containerOriginal = document.getElementById('UPLOADIFYFOTOContainer');
        if (containerOriginal && !document.getElementById('sg-trigger-btn')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'sg-botoes-wrapper';

            // Botão principal "Tirar foto"
            const btnTirar = document.createElement('button');
            btnTirar.id        = 'sg-trigger-btn';
            btnTirar.type      = 'button';
            btnTirar.innerHTML = SVG.camera + ' Tirar foto';
            btnTirar.addEventListener('click', function (e) { e.preventDefault(); openModal(); });

            // Ícone de ajuda (?) para instruções do Firefox
            const btnAjuda = document.createElement('button');
            btnAjuda.id        = 'sg-help-btn';
            btnAjuda.type      = 'button';
            btnAjuda.title     = 'Instrução para permissão da câmera no Firefox';
            btnAjuda.innerHTML = SVG.question;
            btnAjuda.addEventListener('click', function (e) { e.preventDefault(); mostrarAjuda(); });

            wrapper.appendChild(btnTirar);
            wrapper.appendChild(btnAjuda);
            containerOriginal.insertAdjacentElement('afterend', wrapper);
        }
    }

    setInterval(function () {
        if (document.getElementById('UPLOADIFYFOTOContainer')) inserirElementos();
    }, 1000);

})();
