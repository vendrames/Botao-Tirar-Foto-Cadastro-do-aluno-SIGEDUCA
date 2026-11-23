// ==UserScript==
// @name         Botão Tirar Foto - Cadastro do Aluno - SIGEDUCA
// @namespace    http://tampermonkey.net/
// @version      4.3
// @description  Insere o botão "Tirar foto" no cadastro do aluno no SIGEDUCA, com modal de captura, recorte por IA, filtros, troca de fundo, espelhamento e texto automático (escola/data).
// @author       Vitor Vendrame
// @match        *://sigeduca.seduc.mt.gov.br/ged/hwtmgedaluno.aspx?*
// @icon         https://cdn-icons-png.flaticon.com/64/4181/4181788.png
// @updateURL    https://raw.githubusercontent.com/vendrames/Botao-Tirar-Foto-Cadastro-do-aluno-SIGEDUCA/refs/heads/main/Bot%C3%A3o%20Tirar%20Foto%20-%20Cadastro%20do%20Aluno.js
// @downloadURL  https://raw.githubusercontent.com/vendrames/Botao-Tirar-Foto-Cadastro-do-aluno-SIGEDUCA/refs/heads/main/Bot%C3%A3o%20Tirar%20Foto%20-%20Cadastro%20do%20Aluno.js
// @grant        none
// ==/UserScript==

/*
 * ==============================================================================
 * BOTÃO TIRAR FOTO - CADASTRO DO ALUNO - SIGEDUCA
 * ==============================================================================
 *
 * O que este script faz?
 * Ele insere um botão "Tirar Foto" ao lado do campo de upload original no
 * cadastro do aluno do SIGEDUCA.
 *
 * Após o clique, as seguintes opções são disponibilizadas no modal:
 *
 * 1. Captura de foto via webcam em tempo real.
 * 2. Espelhamento de imagem (horizontal).
 * 3. Recorte de fundo automático com Inteligência Artificial (MediaPipe) e
 *    ajustes finos (Sensibilidade, Suavidade da Borda, Expandir/Encolher).
 * 4. Filtros de imagem nativos (Brilho, Contraste, Saturação).
 * 5. Troca de fundo por imagem (com controles de posição, escala e encaixe)
 *    ou por cor sólida (color picker).
 * 6. Inserção de texto na foto (preenchimento automático com dados da escola
 *    e data, com opções de cor, orientação e posição).
 * 7. Interface adaptável e expansível com barra lateral retrátil.
 *
 * Nota: O acesso à câmera em sites HTTP requer configurações específicas
 * no Firefox (menu about:config). O script possui um botão de ajuda "?"
 * com o passo a passo para o usuário.
 * ==============================================================================
 */

(function () {
    'use strict';

    const SVG = {
        camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
        x:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        check:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        redo:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.99"/></svg>`,
        question: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        image:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
        chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
        flip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h14"/><path d="M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H3"/></svg>`,
    };

    const style = document.createElement('style');
    style.textContent = `
        #UPLOADIFYFOTOContainer { margin: 0 !important; padding: 0 !important; height: auto !important; }
        .sg-botoes-wrapper { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 4px; }
        #sg-trigger-btn { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(180deg, #f0a020 0%, #c87800 100%); color: #fff; border: 1px solid #a06000; border-radius: 3px; padding: 5px 14px; font-family: Verdana, Arial, sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
        #sg-trigger-btn:hover { opacity: .88; }
        #sg-trigger-btn svg { width: 14px; height: 14px; stroke: #fff; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
        #sg-help-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; border: 1px solid #bbb; background: #f5f5f5; cursor: help; color: #555; padding: 0; transition: background .15s, border-color .15s; }
        #sg-help-btn:hover { background: #e0e8f5; border-color: #1e6fd9; color: #1e6fd9; }
        #sg-help-btn svg { width: 13px; height: 13px; }

        @keyframes sg-fadein  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sg-modal-in { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes sg-spin { to { transform: rotate(360deg); } }
        @keyframes sg-flash { 0% { opacity: .85; } 100% { opacity: 0; } }
        @keyframes sg-pulse { 0%,100% { opacity: 1; } 50% { opacity: .28; } }

        #sg-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 999998; background: rgba(0,0,0,.75); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); animation: sg-fadein .22s ease forwards; display: none; align-items: center; justify-content: center; }

        #sg-modal { position: relative; width: 440px; max-width: 95vw; height: auto; max-height: 90vh; display: flex; flex-direction: column; border-radius: 16px; background: linear-gradient(145deg, #1e2a3a 0%, #0f1923 100%); box-shadow: 0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.06); font-family: Arial, sans-serif; animation: sg-modal-in .28s cubic-bezier(.34,1.48,.64,1) forwards; transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1); margin: auto; overflow: visible; }
        #sg-modal.expanded { width: 880px; }

        #sg-modal *, #sg-modal *::before, #sg-modal *::after { box-sizing: border-box; }

        #sg-modal .sg-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,.08); background: linear-gradient(90deg, rgba(30,80,160,.35) 0%, rgba(20,40,80,.2) 100%); border-radius: 16px 16px 0 0; flex-shrink: 0; }
        #sg-modal .sg-header-left { display: flex; align-items: center; gap: 12px; }
        #sg-modal .sg-icon-badge { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e6fd9 0%, #1353a8 100%); box-shadow: 0 4px 12px rgba(30,111,217,.4); }
        #sg-modal .sg-icon-badge svg { width: 16px; height: 16px; }
        #sg-modal .sg-title-wrap { display: flex; align-items: center; gap: 8px; }
        #sg-modal .sg-title { color: #fff; font-size: 15px; font-weight: 700; margin: 0; line-height: 1.3; }
        #sg-modal .sg-version { color: rgba(255,255,255,.6); font-size: 10px; background: rgba(255,255,255,.1); padding: 2px 6px; border-radius: 4px; font-weight: normal;}
        #sg-modal .sg-subtitle { color: rgba(255,255,255,.4); font-size: 11px; margin: 2px 0 0; line-height: 1.4; }

        #sg-modal .sg-close { width: 30px; height: 30px; padding: 0; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08); color: rgba(255,255,255,.5); cursor: pointer; transition: background .15s, color .15s; }
        #sg-modal .sg-close:hover { background: rgba(220,50,50,.25); color: #ff6b6b; }
        #sg-modal .sg-close svg { width: 14px; height: 14px; display: block; }

        .sg-editor-body { display: flex; flex: 1; overflow: hidden; border-radius: 0 0 16px 16px; position: relative; }

        .sg-editor-left { width: 440px; flex-shrink: 0; display: flex; flex-direction: column; padding: 20px; background: transparent; position: relative; }
        #sg-modal.expanded .sg-editor-left { border-right: 1px solid rgba(255,255,255,.08); }

        .sg-toggle-sidebar { position: absolute; left: 440px; top: 50%; transform: translate(-50%, -50%); width: 28px; height: 54px; border-radius: 8px; background: #1e2a3a; border: 1px solid rgba(255,255,255,.2); color: rgba(255,255,255,.8); display: none; align-items: center; justify-content: center; cursor: pointer; z-index: 20; transition: background 0.15s, color 0.15s; box-shadow: 2px 0 8px rgba(0,0,0,0.5); }
        .sg-toggle-sidebar:hover { background: #2a3a50; color: #fff; }
        .sg-toggle-sidebar svg { width: 16px; height: 16px; transition: transform 0.3s; }

        #sg-modal.expanded .sg-toggle-sidebar svg { transform: rotate(0deg); }
        #sg-modal:not(.expanded) .sg-toggle-sidebar svg { transform: rotate(180deg); }

        #sg-modal .sg-video-wrap { display: flex; flex-direction: column; align-items: center; }
        #sg-modal .sg-viewport { position: relative; width: 340px; height: 255px; border-radius: 10px; overflow: hidden; background: #000; box-shadow: 0 0 0 2px rgba(30,111,217,.3), 0 8px 32px rgba(0,0,0,.5); }
        #sg-modal .sg-corner { position: absolute; width: 16px; height: 16px; z-index: 2; border-color: rgba(30,111,217,.7); border-style: solid; pointer-events: none; }
        #sg-modal .sg-corner-tl { top:0; left:0; border-width:2px 0 0 2px; border-radius:4px 0 0 0; }
        #sg-modal .sg-corner-tr { top:0; right:0; border-width:2px 2px 0 0; border-radius:0 4px 0 0; }
        #sg-modal .sg-corner-bl { bottom:0; left:0; border-width:0 0 2px 2px; border-radius:0 0 0 4px; }
        #sg-modal .sg-corner-br { bottom:0; right:0; border-width:0 2px 2px 0; border-radius:0 0 4px 0; }

        #sg-modal #sg-video, #sg-modal #sg-snapshot { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        #sg-modal #sg-video { transform: scaleX(-1); display: block; }

        #sg-modal #sg-snapshot { display: none; cursor: pointer; transition: opacity 0.2s; }
        #sg-modal #sg-snapshot:hover { opacity: 0.9; }

        #sg-modal .sg-overlay { position: absolute; inset: 0; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 5;}
        #sg-modal .sg-spinner { width: 32px; height: 32px; margin-bottom: 10px; border: 2px solid transparent; border-top-color: #1e6fd9; border-radius: 50%; animation: sg-spin .75s linear infinite; }
        #sg-modal .sg-overlay p { color: rgba(255,255,255,.4); font-size: 12px; margin: 0; }
        #sg-modal .sg-flash { position: absolute; inset: 0; background: #fff; pointer-events: none; animation: sg-flash .4s ease forwards; z-index: 10;}

        #sg-modal .sg-status { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 14px; min-height: 18px; }
        #sg-modal .sg-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; flex-shrink: 0; animation: sg-pulse 1.4s ease-in-out infinite; }
        #sg-modal .sg-status span { color: rgba(255,255,255,.5); font-size: 12px; }
        #sg-modal .sg-status svg { width: 13px; height: 13px; flex-shrink: 0; stroke: #22c55e; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
        #sg-modal .sg-status-error span { color: rgba(239,68,68,.7); }

        .sg-editor-right { width: 440px; flex-shrink: 0; display: flex; flex-direction: column; background: rgba(0,0,0,.15); opacity: 0; visibility: hidden; transition: opacity 0.3s ease; }
        #sg-modal.expanded .sg-editor-right { opacity: 1; visibility: visible; }

        #sg-modal .sg-advanced { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; }
        #sg-modal .sg-advanced::-webkit-scrollbar { width: 6px; }
        #sg-modal .sg-advanced::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 3px; }

        #sg-modal .sg-panel { margin-bottom: 12px; background: rgba(255,255,255,.04); border-radius: 10px; border: 1px solid rgba(255,255,255,.07); overflow: hidden; flex-shrink: 0; }
        #sg-modal .sg-panel summary { padding: 12px 16px; cursor: pointer; color: rgba(255,255,255,.85); font-size: 13px; font-weight: 600; user-select: none; list-style: none; display: flex; align-items: center; }
        #sg-modal .sg-panel summary::-webkit-details-marker { display: none; }
        #sg-modal .sg-panel summary::before { content: '▸'; display: inline-block; transition: transform .2s; margin-right: 8px; color: rgba(255,255,255,.4); font-size: 14px;}
        #sg-modal .sg-panel[open] summary::before { transform: rotate(90deg); }
        #sg-modal .sg-panel summary:hover { color: #fff; background: rgba(255,255,255,.02); }
        #sg-modal .sg-panel[open] summary { border-bottom: 1px solid rgba(255,255,255,.06); }
        #sg-modal .sg-panel-content { padding: 12px 16px 16px; }

        #sg-modal .sg-control { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        #sg-modal .sg-control:last-child { margin-bottom: 0; }
        #sg-modal .sg-control label { font-size: 12px; color: rgba(255,255,255,.6); flex-shrink: 0; min-width: 100px; }
        #sg-modal .sg-control input[type="range"] { flex: 1; height: 4px; -webkit-appearance: none; appearance: none; background: rgba(255,255,255,.15); border-radius: 2px; outline: none; cursor: pointer; }
        #sg-modal .sg-control input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #1e6fd9; cursor: pointer; box-shadow: 0 0 0 3px rgba(30,111,217,.2); transition: transform .1s; }
        #sg-modal .sg-control input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }
        #sg-modal .sg-control input[type="range"]::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #1e6fd9; cursor: pointer; border: none; box-shadow: 0 0 0 3px rgba(30,111,217,.2); }
        #sg-modal .sg-control input[type="range"]:disabled { opacity: .35; cursor: not-allowed; }
        #sg-modal .sg-control .sg-val { font-size: 12px; color: rgba(255,255,255,.8); min-width: 48px; text-align: right; font-family: 'Courier New', monospace; background: rgba(0,0,0,.3); padding: 2px 6px; border-radius: 4px;}

        #sg-modal .sg-control select, .sg-input-text { flex: 1; background: rgba(255,255,255,.08); color: #fff; border: 1px solid rgba(255,255,255,.15); border-radius: 6px; padding: 6px 10px; font-size: 12px; cursor: pointer; outline: none; }
        #sg-modal .sg-control select option { background: #1e2a3a; color: #fff; }
        #sg-modal .sg-input-text { cursor: text; }

        .sg-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; color: rgba(255,255,255,.8); font-size: 13px; font-weight: 600;}
        .sg-checkbox-label input { width: 16px; height: 16px; cursor: pointer; accent-color: #1e6fd9; }

        #sg-modal .sg-bg-controls { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        #sg-modal .sg-bg-btn { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2); color: #fff; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; transition: background .15s; font-weight: 600;}
        #sg-modal .sg-bg-btn:hover { background: rgba(255,255,255,.2); }
        #sg-modal .sg-bg-btn svg { width: 14px; height: 14px; stroke: currentColor; }
        #sg-modal .sg-color-btn { position: relative; overflow: hidden; }
        #sg-modal .sg-color-btn input[type="color"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; border: none; padding: 0; }
        #sg-modal .sg-color-swatch { display: inline-block; width: 16px; height: 16px; border-radius: 4px; border: 1px solid rgba(255,255,255,.4); flex-shrink: 0; background: #000; }

        #sg-modal .sg-footer { display: flex; gap: 8px; margin-top: auto; padding-top: 20px; }
        #sg-modal .sg-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; height: 44px; border-radius: 8px; border-style: solid; border-width: 1px; font-size: 13px; font-weight: 700; letter-spacing: .2px; cursor: pointer; transition: background .15s, box-shadow .15s, border-color .15s; white-space: nowrap;}
        #sg-modal .sg-btn:disabled { opacity: .45; cursor: not-allowed; }
        #sg-modal .sg-btn svg { width: 16px; height: 16px; flex-shrink: 0; stroke: currentColor; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
        #sg-modal .sg-btn-cancel { background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.3); color: #f87171; }
        #sg-modal .sg-btn-cancel:hover:not(:disabled) { background: rgba(239,68,68,.22); border-color: rgba(239,68,68,.5); }
        #sg-modal .sg-btn-capture { background: linear-gradient(135deg,#16a34a 0%,#15803d 100%); border-color: rgba(34,197,94,.3); color: #fff; box-shadow: 0 4px 16px rgba(22,163,74,.35); }
        #sg-modal .sg-btn-capture:hover:not(:disabled) { background: linear-gradient(135deg,#15803d 0%,#166534 100%); box-shadow: 0 6px 20px rgba(22,163,74,.45); }
        #sg-modal .sg-btn-retake { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.1); color: rgba(255,255,255,.65); flex: 0.6; padding: 0 10px; font-size: 12px;}
        #sg-modal .sg-btn-retake:hover { background: rgba(255,255,255,.11); }

        #sg-modal .sg-btn-flip { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.1); color: rgba(255,255,255,.65); flex: 0.6; padding: 0 10px; font-size: 12px;}
        #sg-modal .sg-btn-flip:hover { background: rgba(255,255,255,.11); }

        #sg-modal .sg-btn-confirm { background: linear-gradient(135deg,#1e6fd9 0%,#1353a8 100%); border-color: rgba(30,111,217,.4); color: #fff; box-shadow: 0 4px 16px rgba(30,111,217,.4); }
        #sg-modal .sg-btn-confirm:hover { background: linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%); box-shadow: 0 6px 20px rgba(30,111,217,.5); }

        #sg-canvas { display: none; }

        @media (max-width: 900px) {
            #sg-modal, #sg-modal.expanded { width: 95vw; height: 95vh; flex-direction: column; overflow: hidden; border-radius: 16px; }
            .sg-editor-body { flex-direction: column; overflow-y: auto; border-radius: 0 0 16px 16px; }
            .sg-editor-left { width: 100%; border-right: none; border-bottom: 1px solid rgba(255,255,255,.08); padding-bottom: 20px; }
            .sg-editor-right { width: 100%; height: auto; overflow: visible; }
            .sg-toggle-sidebar { display: none !important; }
        }
    `;
    document.head.appendChild(style);

    // ─── Canvas & Modal ───────────────────────────────────────────────────────

    const canvas = document.createElement('canvas');
    canvas.id = 'sg-canvas';
    canvas.width = 320; canvas.height = 240;
    document.body.appendChild(canvas);

    const backdrop = document.createElement('div');
    backdrop.id = 'sg-backdrop';
    document.body.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.id = 'sg-modal';
    modal.innerHTML = `
        <div class="sg-header">
            <div class="sg-header-left">
                <div class="sg-icon-badge">${SVG.camera}</div>
                <div>
                    <div class="sg-title-wrap">
                        <p class="sg-title">Captura de Foto</p>
                        <span class="sg-version">v4.3</span>
                    </div>
                    <p class="sg-subtitle" id="sg-subtitle">Posicione o rosto do aluno no quadro</p>
                </div>
            </div>

            <div class="sg-header-actions">
                <button class="sg-close" id="sg-close" title="Fechar">${SVG.x}</button>
            </div>
        </div>

        <div class="sg-editor-body">
            <div class="sg-editor-left">
                <div class="sg-video-wrap">
                    <div class="sg-viewport">
                        <div class="sg-corner sg-corner-tl"></div>
                        <div class="sg-corner sg-corner-tr"></div>
                        <div class="sg-corner sg-corner-bl"></div>
                        <div class="sg-corner sg-corner-br"></div>

                        <video id="sg-video" autoplay playsinline muted></video>
                        <img id="sg-snapshot" alt="Foto capturada" title="Clique na imagem para espelhar" />

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

                <div class="sg-footer">
                    <button class="sg-btn sg-btn-cancel"  id="sg-btn-cancel">${SVG.x} Cancelar</button>
                    <button class="sg-btn sg-btn-capture" id="sg-btn-capture" disabled>${SVG.camera} Capturar</button>
                    <button class="sg-btn sg-btn-retake"  id="sg-btn-retake"  style="display:none;">${SVG.redo} Refazer</button>
                    <button class="sg-btn sg-btn-flip"    id="sg-btn-flip"    style="display:none;">${SVG.flip} Espelhar</button>
                    <button class="sg-btn sg-btn-confirm" id="sg-btn-confirm" style="display:none;">${SVG.check} Usar</button>
                </div>
            </div>

            <div class="sg-editor-right" id="sg-editor-right">
                <div class="sg-advanced" id="sg-advanced">

                    <details class="sg-panel" id="sg-ai-panel">
                        <summary>⚙️ Ajustes de Recorte (IA)</summary>
                        <div class="sg-panel-content">
                            <div class="sg-control">
                                <label>Sensibilidade</label>
                                <input type="range" id="sg-ai-threshold" min="5" max="95" value="50" step="1">
                                <span class="sg-val" id="sg-ai-threshold-val">50</span>
                            </div>
                            <div class="sg-control">
                                <label>Suavidade borda</label>
                                <input type="range" id="sg-ai-feather" min="0" max="30" value="5" step="1">
                                <span class="sg-val" id="sg-ai-feather-val">5</span>
                            </div>
                            <div class="sg-control">
                                <label>Expandir</label>
                                <input type="range" id="sg-ai-expand" min="-10" max="10" value="0" step="1">
                                <span class="sg-val" id="sg-ai-expand-val">0</span>
                            </div>
                        </div>
                    </details>

                    <details class="sg-panel" id="sg-image-panel" open>
                        <summary>✨ Ajustes de Imagem</summary>
                        <div class="sg-panel-content">
                            <div class="sg-control">
                                <label>Brilho</label>
                                <input type="range" id="sg-filter-brightness" min="50" max="150" value="100" step="1">
                                <span class="sg-val" id="sg-filter-brightness-val">100%</span>
                            </div>
                            <div class="sg-control">
                                <label>Contraste</label>
                                <input type="range" id="sg-filter-contrast" min="50" max="150" value="100" step="1">
                                <span class="sg-val" id="sg-filter-contrast-val">100%</span>
                            </div>
                            <div class="sg-control">
                                <label>Saturação</label>
                                <input type="range" id="sg-filter-saturate" min="0" max="200" value="100" step="1">
                                <span class="sg-val" id="sg-filter-saturate-val">100%</span>
                            </div>
                        </div>
                    </details>

                    <details class="sg-panel" id="sg-text-panel">
                        <summary>📝 Texto na Foto</summary>
                        <div class="sg-panel-content">
                            <div class="sg-control" style="margin-bottom: 12px;">
                                <label class="sg-checkbox-label">
                                    <input type="checkbox" id="sg-text-enable"> Incluir texto na foto
                                </label>
                            </div>

                            <div class="sg-control" id="sg-text-controls" style="display: none; flex-direction: column; align-items: stretch; gap: 10px;">
                                <div class="sg-control" style="margin:0;">
                                    <label style="min-width: 30px;">Texto</label>
                                    <input type="text" id="sg-text-content" class="sg-input-text">
                                </div>
                                <div class="sg-control" style="margin:0;">
                                    <label style="min-width: 30px;">Cor</label>
                                    <select id="sg-text-color">
                                        <option value="#FFFFFF">Branco</option>
                                        <option value="#000000">Preto</option>
                                    </select>
                                </div>
                                <div class="sg-control" style="margin:0;">
                                    <label style="min-width: 30px;">Orientação</label>
                                    <select id="sg-text-orientation">
                                        <option value="horizontal">Horizontal</option>
                                        <option value="vertical">Vertical</option>
                                    </select>
                                </div>
                                <div class="sg-control" style="margin:0;">
                                    <label style="min-width: 30px;">Posição</label>
                                    <select id="sg-text-position">
                                        <option value="bottom-right">Inferior Direito</option>
                                        <option value="bottom-left">Inferior Esquerdo</option>
                                        <option value="top-right">Superior Direito</option>
                                        <option value="top-left">Superior Esquerdo</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </details>

                    <details class="sg-panel" id="sg-bg-panel">
                        <summary>🖼️ Ajustes do Fundo</summary>
                        <div class="sg-panel-content">
                            <div class="sg-bg-controls" id="sg-bg-controls">
                                <input type="file" id="sg-bg-upload" accept="image/*" style="display:none;" />
                                <button class="sg-bg-btn" id="sg-btn-upload-bg">${SVG.image} Fundo</button>
                                <label class="sg-bg-btn sg-color-btn" title="Escolher cor de fundo">
                                    <span class="sg-color-swatch" id="sg-color-swatch"></span>
                                    <span>Cor</span>
                                    <input type="color" id="sg-bg-color" value="#000000">
                                </label>
                                <button class="sg-bg-btn" id="sg-btn-remove-bg" style="display:none;">${SVG.x} Limpar</button>
                            </div>

                            <div class="sg-control">
                                <label>Encaixe</label>
                                <select id="sg-bg-fit">
                                    <option value="cover">Preencher (cover)</option>
                                    <option value="contain">Conter (contain)</option>
                                    <option value="stretch">Esticar (stretch)</option>
                                </select>
                            </div>
                            <div class="sg-control">
                                <label>Escala</label>
                                <input type="range" id="sg-bg-scale" min="50" max="300" value="100" step="5">
                                <span class="sg-val" id="sg-bg-scale-val">100%</span>
                            </div>
                            <div class="sg-control">
                                <label>Posição X</label>
                                <input type="range" id="sg-bg-x" min="-100" max="100" value="0" step="1">
                                <span class="sg-val" id="sg-bg-x-val">0%</span>
                            </div>
                            <div class="sg-control">
                                <label>Posição Y</label>
                                <input type="range" id="sg-bg-y" min="-100" max="100" value="0" step="1">
                                <span class="sg-val" id="sg-bg-y-val">0%</span>
                            </div>
                        </div>
                    </details>

                </div>
            </div>
        </div>

        <button class="sg-toggle-sidebar" id="sg-toggle-sidebar" title="Mostrar/Ocultar Ajustes">
            ${SVG.chevronLeft}
        </button>
    `;

    backdrop.appendChild(modal);

    // ─── Estado ───────────────────────────────────────────────────────────────

    let currentStream        = null;
    let rawCapturedDataUrl   = null;
    let capturedDataUrl      = null;
    let bgImageObj           = null;
    let cachedSegResults     = null;
    let selfieSegmentation   = null;
    let isMediaPipeLoaded    = false;
    let isMediaPipeLoading   = false;
    let pendingBgApply       = false;
    let renderScheduled      = false;
    let isProcessing         = false;
    let isFlipped            = false;
    let schoolInfoText       = ''; // Armazena o texto da escola

    const bgSettings   = { fitMode: 'cover', scale: 1, offsetX: 0, offsetY: 0, color: '#000000' };
    const maskSettings = { threshold: 0.50, feather: 0.05, expand: 0 };
    const filterSettings = { brightness: 1, contrast: 1, saturate: 1 };
    const textSettings = { enabled: false, content: '', color: '#FFFFFF', orientation: 'horizontal', position: 'bottom-right' };

    // ─── Funções Auxiliares (Texto) ───────────────────────────────────────────

    async function fetchSchoolInfoText() {
        // Se já buscou, retorna o valor em cache
        if (schoolInfoText) return schoolInfoText;

        try {
            // Busca a página de consulta do aluno em segundo plano
            const response = await fetch('http://sigeduca.seduc.mt.gov.br/ged/hwmconaluno.aspx');
            const html = await response.text();

            // Cria um DOM virtual para analisar o HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Procura o span com a lotação
            const lotacaoSpan = doc.querySelector('[id$="MPW0010TLOTACAO"]');

            if (lotacaoSpan) {
                const escola = lotacaoSpan.textContent.replace(/\s+/g, ' ').trim();
                const data = new Date().toLocaleDateString('pt-BR');
                schoolInfoText = `${escola} - ${data}`;
                return schoolInfoText;
            }
        } catch (error) {
            console.warn('Erro ao buscar dados da escola:', error);
        }

        // Fallback: se não conseguir buscar, usa "SIGEDUCA" + data
        const data = new Date().toLocaleDateString('pt-BR');
        schoolInfoText = `SIGEDUCA - ${data}`;
        return schoolInfoText;
    }

    // ─── MediaPipe ────────────────────────────────────────────────────────────

    function loadMediaPipe() {
        if (isMediaPipeLoaded || isMediaPipeLoading) return;
        isMediaPipeLoading = true;

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';
        script.crossOrigin = 'anonymous';

        script.onload = () => {
            if (typeof SelfieSegmentation !== 'undefined') {
                selfieSegmentation = new SelfieSegmentation({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
                });
                selfieSegmentation.setOptions({ modelSelection: 1 });
                selfieSegmentation.onResults(onSegmentationResults);
                isMediaPipeLoaded  = true;
                isMediaPipeLoading = false;

                if (pendingBgApply && rawCapturedDataUrl) {
                    pendingBgApply = false;
                    applyBackgroundToPhoto();
                }
            } else {
                isMediaPipeLoading = false;
            }
        };

        script.onerror = () => {
            isMediaPipeLoading = false;
            pendingBgApply = false;
            alert('Aviso: A Inteligência Artificial não pôde ser carregada (rede bloqueou?). A troca de fundo não funcionará.');
        };

        document.head.appendChild(script);
    }

    function onSegmentationResults(results) {
        isProcessing = false;
        cachedSegResults = {
            image: results.image,
            mask:  results.segmentationMask
        };
        renderComposite();
        setStatus('captured');
    }

    // ─── Renderização ─────────────────────────────────────────────────────────

    function scheduleRender() {
        if (!rawCapturedDataUrl) return;
        if (!cachedSegResults) {
            ensureSegmentation();
            return;
        }
        if (renderScheduled) return;
        renderScheduled = true;
        requestAnimationFrame(() => {
            renderScheduled = false;
            if (cachedSegResults) renderComposite();
        });
    }

    function renderComposite() {
        if (!cachedSegResults) return;

        const outCanvas = document.getElementById('sg-canvas');
        const ctx = outCanvas.getContext('2d');

        ctx.clearRect(0, 0, 320, 240);
        ctx.fillStyle = bgSettings.color;
        ctx.fillRect(0, 0, 320, 240);
        if (bgImageObj) {
            drawBackground(ctx, bgImageObj, bgSettings);
        }

        const personCanvas = document.createElement('canvas');
        personCanvas.width = 320; personCanvas.height = 240;
        const pCtx = personCanvas.getContext('2d');

        pCtx.filter = `brightness(${filterSettings.brightness}) contrast(${filterSettings.contrast}) saturate(${filterSettings.saturate})`;
        pCtx.drawImage(cachedSegResults.image, 0, 0, 320, 240);
        pCtx.filter = 'none';

        const maskCanvas = buildMaskCanvas(cachedSegResults.mask, maskSettings);
        pCtx.globalCompositeOperation = 'destination-in';
        pCtx.drawImage(maskCanvas, 0, 0, 320, 240);

        ctx.save();
        if (isFlipped) {
            ctx.translate(320, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(personCanvas, 0, 0);
        ctx.restore();

        // Desenha o texto DEPOIS de tudo (para não ser espelhado e ficar sempre legível)
        drawTextOverlay(ctx);

        capturedDataUrl = outCanvas.toDataURL('image/jpeg', 0.92);
        document.getElementById('sg-snapshot').src = capturedDataUrl;
    }

    function drawTextOverlay(ctx) {
        if (!textSettings.enabled || !textSettings.content.trim()) return;

        const text = textSettings.content.trim();
        const fontSize = 12;
        const margin = 10;

        ctx.save();
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.textBaseline = 'middle';

        const strokeColor = textSettings.color === '#FFFFFF' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)';

        if (textSettings.orientation === 'vertical') {
            if (textSettings.position === 'bottom-right') {
                ctx.translate(320 - margin, 240 - margin);
                ctx.rotate(-Math.PI / 2);
                ctx.textAlign = 'left';
                ctx.fillStyle = textSettings.color;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 3;
                ctx.strokeText(text, 0, 0);
                ctx.fillText(text, 0, 0);
            } else if (textSettings.position === 'bottom-left') {
                ctx.translate(margin, 240 - margin);
                ctx.rotate(-Math.PI / 2);
                ctx.textAlign = 'left';
                ctx.fillStyle = textSettings.color;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 3;
                ctx.strokeText(text, 0, 0);
                ctx.fillText(text, 0, 0);
            } else if (textSettings.position === 'top-right') {
                ctx.translate(320 - margin, margin);
                ctx.rotate(-Math.PI / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = textSettings.color;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 3;
                ctx.strokeText(text, 0, 0);
                ctx.fillText(text, 0, 0);
            } else if (textSettings.position === 'top-left') {
                ctx.translate(margin, margin);
                ctx.rotate(-Math.PI / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = textSettings.color;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 3;
                ctx.strokeText(text, 0, 0);
                ctx.fillText(text, 0, 0);
            }
        } else {
            ctx.textAlign = textSettings.position.includes('left') ? 'left' : 'right';
            const x = textSettings.position.includes('left') ? margin : 320 - margin;
            const y = textSettings.position.includes('top') ? margin + (fontSize / 2) : 240 - margin - (fontSize / 2);

            ctx.fillStyle = textSettings.color;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 3;
            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
        }

        ctx.restore();
    }

    function drawBackground(ctx, img, s) {
        const cw = 320, ch = 240;
        if (s.fitMode === 'stretch') {
            ctx.drawImage(img, 0, 0, cw, ch);
            return;
        }
        const baseScale = s.fitMode === 'cover'
            ? Math.max(cw / img.width, ch / img.height)
            : Math.min(cw / img.width, ch / img.height);

        const finalScale = baseScale * s.scale;
        const dw = img.width  * finalScale;
        const dh = img.height * finalScale;
        const dx = (cw - dw) / 2 + s.offsetX * cw;
        const dy = (ch - dh) / 2 + s.offsetY * ch;

        ctx.drawImage(img, dx, dy, dw, dh);
    }

    // ─── Máscara ──────────────────────────────────────────────────────────────

    function buildMaskCanvas(maskImage, settings) {
        const w = 320, h = 240;
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = w; maskCanvas.height = h;
        const mCtx = maskCanvas.getContext('2d');
        mCtx.drawImage(maskImage, 0, 0, w, h);

        const imgData = mCtx.getImageData(0, 0, w, h);
        const data = imgData.data;

        let alphaArr = new Float32Array(w * h);
        for (let i = 0, j = 0; i < data.length; i += 4, j++) {
            alphaArr[j] = Math.min(data[i], data[i + 3]) / 255;
        }

        const r = Math.round(settings.expand);
        if (r !== 0) alphaArr = dilateErode(alphaArr, w, h, r);

        const thr = settings.threshold;
        const fea = Math.max(0.001, settings.feather);
        const low = thr - fea / 2;
        for (let i = 0; i < alphaArr.length; i++) {
            let v = (alphaArr[i] - low) / fea;
            alphaArr[i] = v < 0 ? 0 : v > 1 ? 1 : v;
        }

        for (let i = 0, j = 0; i < data.length; i += 4, j++) {
            data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
            data[i + 3] = Math.round(alphaArr[j] * 255);
        }

        mCtx.putImageData(imgData, 0, 0);
        return maskCanvas;
    }

    function dilateErode(arr, w, h, radius) {
        const rad = Math.abs(radius);
        const isDilate = radius > 0;
        const tmp = new Float32Array(w * h);
        const out = new Float32Array(w * h);

        for (let y = 0; y < h; y++) {
            const rowBase = y * w;
            for (let x = 0; x < w; x++) {
                let v = isDilate ? 0 : 1;
                const x0 = Math.max(0, x - rad);
                const x1 = Math.min(w - 1, x + rad);
                for (let nx = x0; nx <= x1; nx++) {
                    const cur = arr[rowBase + nx];
                    v = isDilate ? (cur > v ? cur : v) : (cur < v ? cur : v);
                }
                tmp[rowBase + x] = v;
            }
        }

        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                let v = isDilate ? 0 : 1;
                const y0 = Math.max(0, y - rad);
                const y1 = Math.min(h - 1, y + rad);
                for (let ny = y0; ny <= y1; ny++) {
                    const cur = tmp[ny * w + x];
                    v = isDilate ? (cur > v ? cur : v) : (cur < v ? cur : v);
                }
                out[y * w + x] = v;
            }
        }
        return out;
    }

    // ─── Segmentação ──────────────────────────────────────────────────────────

    function ensureSegmentation() {
        if (cachedSegResults) {
            scheduleRender();
            return;
        }
        if (isProcessing) return;
        if (!rawCapturedDataUrl) return;

        if (isMediaPipeLoaded) {
            applyBackgroundToPhoto();
        } else {
            pendingBgApply = true;
            setStatus('pending');
            if (!isMediaPipeLoading) loadMediaPipe();
        }
    }

    function applyBackgroundToPhoto() {
        if (!rawCapturedDataUrl || isProcessing) return;
        isProcessing = true;
        setStatus('processing');

        const img = new Image();
        img.onload = () => {
            if (!selfieSegmentation) {
                isProcessing = false;
                setStatus('captured');
                return;
            }
            selfieSegmentation.send({ image: img });
        };
        img.onerror = () => {
            isProcessing = false;
            setStatus('captured');
        };
        img.src = rawCapturedDataUrl;
    }

    // ─── Câmera ───────────────────────────────────────────────────────────────

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

    function startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            document.getElementById('sg-overlay-loading').style.display = 'none';
            document.getElementById('sg-overlay-error').style.display   = 'flex';
            document.getElementById('sg-error-msg').textContent = 'O navegador bloqueou a câmera por este site não ser seguro (HTTP). Feche este modal e clique no ícone (?) para ver as instruções.';
            setStatus('error');
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: false })
        .then((s) => {
            currentStream = s;
            const video = document.getElementById('sg-video');
            video.srcObject = s;
            video.onloadedmetadata = () => {
                document.getElementById('sg-overlay-loading').style.display = 'none';
                document.getElementById('sg-btn-capture').disabled = false;
                setStatus('active');
            };
        })
        .catch((err) => {
            document.getElementById('sg-overlay-loading').style.display = 'none';
            document.getElementById('sg-overlay-error').style.display   = 'flex';
            document.getElementById('sg-error-msg').textContent = 'Não foi possível acessar a câmera: ' + err.message;
            setStatus('error');
        });
    }

    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(t => t.stop());
            currentStream = null;
        }
    }

    // ─── Abertura / Reset ─────────────────────────────────────────────────────

    async function openModal() {
        resetToPreview();
        modal.style.animation = 'none';
        void modal.offsetHeight;
        modal.style.animation = '';
        backdrop.style.display = 'flex';
        modal.style.display    = 'flex';
        startCamera();
        loadMediaPipe();

        // Busca o texto da escola de forma assíncrona e preenche o campo
        const info = await fetchSchoolInfoText();
        textSettings.content = info;
        document.getElementById('sg-text-content').value = info;
    }

    function closeModal() {
        stopCamera();
        backdrop.style.display = 'none';
        modal.style.display    = 'none';
    }

    function resetToPreview() {
        rawCapturedDataUrl = null;
        capturedDataUrl    = null;
        bgImageObj         = null;
        cachedSegResults   = null;
        pendingBgApply     = false;
        isProcessing       = false;
        isFlipped          = false;

        modal.classList.remove('expanded');
        document.getElementById('sg-toggle-sidebar').style.display = 'none';

        bgSettings.color = '#000000';
        document.getElementById('sg-bg-upload').value = '';
        document.getElementById('sg-bg-color').value  = '#000000';
        document.getElementById('sg-color-swatch').style.background = '#000000';

        filterSettings.brightness = 1;
        filterSettings.contrast = 1;
        filterSettings.saturate = 1;
        document.getElementById('sg-filter-brightness').value = 100;
        document.getElementById('sg-filter-contrast').value = 100;
        document.getElementById('sg-filter-saturate').value = 100;
        document.getElementById('sg-filter-brightness-val').textContent = '100%';
        document.getElementById('sg-filter-contrast-val').textContent = '100%';
        document.getElementById('sg-filter-saturate-val').textContent = '100%';

        // Reseta textos
        textSettings.enabled = false;
        document.getElementById('sg-text-enable').checked = false;
        document.getElementById('sg-text-controls').style.display = 'none';

        document.getElementById('sg-video').style.display             = 'block';
        document.getElementById('sg-snapshot').style.display          = 'none';
        document.getElementById('sg-snapshot').src                    = '';
        document.getElementById('sg-overlay-loading').style.display   = 'flex';
        document.getElementById('sg-overlay-error').style.display     = 'none';
        document.getElementById('sg-subtitle').textContent            = 'Posicione o rosto do aluno no quadro';

        document.getElementById('sg-btn-cancel').style.display  = 'flex';
        document.getElementById('sg-btn-capture').style.display = 'flex';
        document.getElementById('sg-btn-capture').disabled      = true;
        document.getElementById('sg-btn-retake').style.display  = 'none';
        document.getElementById('sg-btn-flip').style.display    = 'none';
        document.getElementById('sg-btn-confirm').style.display = 'none';

        document.getElementById('sg-btn-remove-bg').style.display = 'none';
        document.getElementById('sg-btn-upload-bg').innerHTML     = SVG.image + ' Fundo';

        setStatus('active');
    }

    // ─── Captura ──────────────────────────────────────────────────────────────

    function capturePhoto() {
        const video    = document.getElementById('sg-video');
        const viewport = document.querySelector('.sg-viewport');

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 320; tempCanvas.height = 240;
        const tCtx = tempCanvas.getContext('2d');

        tCtx.drawImage(video, 0, 0, 320, 240);

        rawCapturedDataUrl = tempCanvas.toDataURL('image/jpeg', 0.92);
        capturedDataUrl    = rawCapturedDataUrl;

        const snapshot = document.getElementById('sg-snapshot');
        stopCamera();

        const flash = document.createElement('div');
        flash.className = 'sg-flash';
        viewport.appendChild(flash);
        flash.addEventListener('animationend', () => flash.remove());

        snapshot.src           = rawCapturedDataUrl;
        snapshot.style.display = 'block';
        video.style.display    = 'none';
        document.getElementById('sg-subtitle').textContent = 'Edite sua foto';

        document.getElementById('sg-btn-cancel').style.display  = 'none';
        document.getElementById('sg-btn-capture').style.display = 'none';
        document.getElementById('sg-btn-retake').style.display  = 'flex';
        document.getElementById('sg-btn-flip').style.display    = 'flex';
        document.getElementById('sg-btn-confirm').style.display = 'flex';

        modal.classList.add('expanded');
        document.getElementById('sg-toggle-sidebar').style.display = 'flex';

        setStatus('captured');
    }

    function retakePhoto() {
        resetToPreview();
        startCamera();
    }

    function confirmPhoto() {
        if (capturedDataUrl) {
            const imgAluno = document.querySelector('img[id*="FOTOALUNO"]');
            if (imgAluno) imgAluno.src = capturedDataUrl;
        }
        closeModal();
    }

    // ─── Fundo ────────────────────────────────────────────────────────────────

    function refreshBgUI() {
        const hasImage       = !!bgImageObj;
        const hasCustomColor = bgSettings.color.toLowerCase() !== '#000000';

        document.getElementById('sg-btn-remove-bg').style.display = (hasImage || hasCustomColor) ? 'flex' : 'none';
        document.getElementById('sg-btn-upload-bg').innerHTML   = hasImage
            ? SVG.image + ' Trocar'
            : SVG.image + ' Fundo';
    }

    function handleBgUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            bgImageObj = new Image();
            bgImageObj.onload = () => {
                refreshBgUI();
                ensureSegmentation();
            };
            bgImageObj.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function removeBg() {
        bgImageObj       = null;
        bgSettings.color = '#000000';
        document.getElementById('sg-bg-upload').value = '';
        document.getElementById('sg-bg-color').value  = '#000000';
        document.getElementById('sg-color-swatch').style.background = '#000000';

        if (rawCapturedDataUrl) {
            capturedDataUrl = rawCapturedDataUrl;
            document.getElementById('sg-snapshot').src = rawCapturedDataUrl;
        }
        refreshBgUI();
        setStatus('captured');
    }

    // ─── Status ───────────────────────────────────────────────────────────────

    function setStatus(state) {
        const el = document.getElementById('sg-status');
        el.className = 'sg-status';
        if (state === 'active') {
            el.innerHTML = '<div class="sg-dot"></div><span>Câmera ativa</span>';
        } else if (state === 'processing') {
            el.innerHTML = '<div class="sg-spinner" style="width:14px;height:14px;border-width:2px;margin:0;"></div><span>Processando IA…</span>';
        } else if (state === 'pending') {
            el.innerHTML = '<div class="sg-spinner" style="width:14px;height:14px;border-width:2px;margin:0;"></div><span>Aguardando IA…</span>';
        } else if (state === 'captured') {
            el.innerHTML = SVG.check + '<span>Foto pronta</span>';
        } else if (state === 'error') {
            el.className = 'sg-status sg-status-error';
            el.innerHTML = '<span>Erro de câmera</span>';
        }
    }

    // ─── Sliders e Eventos ────────────────────────────────────────────────────

    function bindSlider(id, valId, onChange, formatter) {
        const el    = document.getElementById(id);
        const valEl = document.getElementById(valId);
        el.addEventListener('input', () => {
            const v = parseFloat(el.value);
            valEl.textContent = formatter(v);
            onChange(v);
            scheduleRender();
        });
    }

    bindSlider('sg-ai-threshold', 'sg-ai-threshold-val', v => { maskSettings.threshold = v / 100; }, v => String(v));
    bindSlider('sg-ai-feather', 'sg-ai-feather-val', v => { maskSettings.feather = v / 100; }, v => String(v));
    bindSlider('sg-ai-expand', 'sg-ai-expand-val', v => { maskSettings.expand = v; }, v => (v > 0 ? '+' + v : String(v)));

    bindSlider('sg-filter-brightness', 'sg-filter-brightness-val', v => { filterSettings.brightness = v / 100; }, v => v + '%');
    bindSlider('sg-filter-contrast', 'sg-filter-contrast-val', v => { filterSettings.contrast = v / 100; }, v => v + '%');
    bindSlider('sg-filter-saturate', 'sg-filter-saturate-val', v => { filterSettings.saturate = v / 100; }, v => v + '%');

    bindSlider('sg-bg-scale', 'sg-bg-scale-val', v => { bgSettings.scale = v / 100; }, v => v + '%');
    bindSlider('sg-bg-x', 'sg-bg-x-val', v => { bgSettings.offsetX = v / 100; }, v => v + '%');
    bindSlider('sg-bg-y', 'sg-bg-y-val', v => { bgSettings.offsetY = v / 100; }, v => v + '%');

    document.getElementById('sg-bg-fit').addEventListener('change', (e) => {
        bgSettings.fitMode = e.target.value;
        const scaleEl = document.getElementById('sg-bg-scale');
        scaleEl.disabled = bgSettings.fitMode === 'stretch';
        scheduleRender();
    });

    document.getElementById('sg-bg-color').addEventListener('input', (e) => {
        const newColor = e.target.value;
        bgSettings.color = newColor;
        document.getElementById('sg-color-swatch').style.background = newColor;
        refreshBgUI();

        const hasImage = !!bgImageObj;
        if (hasImage || newColor.toLowerCase() !== '#000000') {
            ensureSegmentation();
        } else if (cachedSegResults && rawCapturedDataUrl) {
            capturedDataUrl = rawCapturedDataUrl;
            document.getElementById('sg-snapshot').src = rawCapturedDataUrl;
        }
    });

    function toggleFlip() {
        if (!rawCapturedDataUrl) return;
        isFlipped = !isFlipped;

        if (cachedSegResults) {
            scheduleRender();
        } else {
            const img = new Image();
            img.onload = () => {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = 320; tempCanvas.height = 240;
                const tCtx = tempCanvas.getContext('2d');
                tCtx.save();
                if (isFlipped) {
                    tCtx.translate(320, 0);
                    tCtx.scale(-1, 1);
                }
                tCtx.drawImage(img, 0, 0, 320, 240);
                tCtx.restore();
                capturedDataUrl = tempCanvas.toDataURL('image/jpeg', 0.92);
                document.getElementById('sg-snapshot').src = capturedDataUrl;
            };
            img.src = rawCapturedDataUrl;
        }
    }

    // Eventos de Texto
    document.getElementById('sg-text-enable').addEventListener('change', (e) => {
        textSettings.enabled = e.target.checked;
        document.getElementById('sg-text-controls').style.display = e.target.checked ? 'flex' : 'none';
        scheduleRender();
    });

    document.getElementById('sg-text-content').addEventListener('input', (e) => {
        textSettings.content = e.target.value;
        scheduleRender();
    });

    document.getElementById('sg-text-color').addEventListener('change', (e) => {
        textSettings.color = e.target.value;
        scheduleRender();
    });

    document.getElementById('sg-text-orientation').addEventListener('change', (e) => {
        textSettings.orientation = e.target.value;
        scheduleRender();
    });

    document.getElementById('sg-text-position').addEventListener('change', (e) => {
        textSettings.position = e.target.value;
        scheduleRender();
    });

    // Eventos gerais
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
    });
    document.getElementById('sg-close').addEventListener('click', closeModal);
    document.getElementById('sg-btn-cancel').addEventListener('click', closeModal);
    document.getElementById('sg-btn-capture').addEventListener('click', capturePhoto);
    document.getElementById('sg-btn-retake').addEventListener('click', retakePhoto);
    document.getElementById('sg-btn-confirm').addEventListener('click', confirmPhoto);

    document.getElementById('sg-btn-flip').addEventListener('click', toggleFlip);
    document.getElementById('sg-snapshot').addEventListener('click', toggleFlip);

    document.getElementById('sg-toggle-sidebar').addEventListener('click', () => {
        modal.classList.toggle('expanded');
    });

    document.getElementById('sg-btn-upload-bg').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('sg-bg-upload').click();
    });
    document.getElementById('sg-bg-upload').addEventListener('change', handleBgUpload);
    document.getElementById('sg-btn-remove-bg').addEventListener('click', removeBg);

    // ─── Injeção do botão ─────────────────────────────────────────────────────

    function inserirElementos() {
        const containerOriginal = document.getElementById('UPLOADIFYFOTOContainer');
        if (containerOriginal && !document.getElementById('sg-trigger-btn')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'sg-botoes-wrapper';

            const btnTirar = document.createElement('button');
            btnTirar.id        = 'sg-trigger-btn';
            btnTirar.type      = 'button';
            btnTirar.innerHTML = SVG.camera + ' Tirar foto';
            btnTirar.addEventListener('click', (e) => { e.preventDefault(); openModal(); });

            const btnAjuda = document.createElement('button');
            btnAjuda.id        = 'sg-help-btn';
            btnAjuda.type      = 'button';
            btnAjuda.title     = 'Instrução para permissão da câmera no Firefox';
            btnAjuda.innerHTML = SVG.question;
            btnAjuda.addEventListener('click', (e) => { e.preventDefault(); mostrarAjuda(); });

            wrapper.appendChild(btnTirar);
            wrapper.appendChild(btnAjuda);
            containerOriginal.insertAdjacentElement('afterend', wrapper);
        }
    }

    setInterval(() => {
        if (document.getElementById('UPLOADIFYFOTOContainer')) inserirElementos();
    }, 1000);

})();
