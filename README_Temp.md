# 📸 Botão Tirar Foto - Cadastro do Aluno - SIGEDUCA

> Facilitador para capturar, editar e padronizar fotos de alunos diretamente na tela de cadastro do sistema SIGEDUCA, utilizando a webcam.

## 📖 Sobre o Script

Este script foi desenvolvido para otimizar e agilizar o processo de inserção da foto do estudante no cadastro de alunos do sistema SIGEDUCA. Ele adiciona um botão **"Tirar foto"** abaixo do botão "Selecionar foto".

Ao clicar, ele habilita a webcam e abre um **poderoso editor de imagens** em um modal expansível. Com ele, é possível capturar a foto do aluno em tempo real, remover o fundo automaticamente com Inteligência Artificial, ajustar a iluminação, trocar o fundo e **inserir um texto padronizado com o nome da escola e a data** — tudo isso **sem precisar tirar a foto em outro aplicativo, salvar no computador e fazer o upload manual**.

## 🖼️ Demonstração da Interface

Veja como o botão se integra ao sistema e as ferramentas do novo editor:

<figure>
  <img src="COLOQUE_O_LINK_DA_FOTO_DO_BOTAO_AQUI" alt="Botão Tirar Foto" width="100%">
  <figcaption align="center"><em>Figura 1: Botão "Tirar Foto" integrado à tela de cadastro do SIGEDUCA.</em></figcaption>
</figure>

<figure>
  <img src="COLOQUE_O_LINK_DA_FOTO_DO_MODAL_AQUI" alt="Modal de captura de foto" width="100%">
  <figcaption align="center"><em>Figura 2: Modal de captura com câmera ativa e visor com cantos decorativos.</em></figcaption>
</figure>

<figure>
  <img src="COLOQUE_O_LINK_DA_FOTO_DO_EDITOR_EXPANDIDO_AQUI" alt="Editor de foto expandido" width="100%">
  <figcaption align="center"><em>Figura 3: Editor completo aberto, mostrando os painéis de recorte por IA, filtros, texto e ajustes de fundo.</em></figcaption>
</figure>

<figure>
  <img src="COLOQUE_O_LINK_DA_FOTO_DO_TEXTO_E_FUNDO_AQUI" alt="Foto com fundo e texto alterados" width="100%">
  <figcaption align="center"><em>Figura 4: Exemplo de foto com o fundo removido e o texto automático (Escola + Data) inserido no canto inferior.</em></figcaption>
</figure>

## ✨ Ferramentas Disponibilizadas

O editor conta com uma interface expansível e uma barra lateral retrátil. Abaixo estão os recursos divididos por categorias:

### 1. Captura e Interface (Básico)
* **Captura em Tempo Real:** Acesso à webcam do dispositivo diretamente pelo navegador.
* **Espelhamento (Flip):** Permite inverter a foto horizontalmente clicando na imagem ou no botão "Espelhar".
* **Efeito de Flash:** Feedback visual no momento da captura, simulando o disparo de uma câmera.
* **Barra Lateral Retrátil:** Uma seta na divisória permite ocultar os painéis de edição para focar apenas na foto.

### 2. Ajustes de Recorte (Inteligência Artificial)
* **Recorte Automático:** Utiliza a tecnologia do Google (MediaPipe) para recortar o aluno do fundo original.
* **Sensibilidade:** Ajusta a agressividade do recorte (ideal para corrigir roupas muito claras ou cabelos).
* **Suavidade da Borda:** Evita que o recorte fique com bordas serrilhadas.
* **Expandir / Encolher:** Permite dilatar ou erodir a máscara de recorte para frente ou para trás.

### 3. Ajustes de Imagem (Filtros)
* **Brilho:** Corrige fotos que ficaram escuras devido à iluminação do ambiente.
* **Contraste:** Destaca as diferenças entre as áreas claras e escuras.
* **Saturação:** Aumenta ou diminui a intensidade das cores da foto do aluno.

### 4. Texto na Foto
* **Preenchimento Automático:** O script busca em segundo plano os dados da página de Consulta do Aluno e insere automaticamente o código e nome da escola junto com a data atual (ex: *15873 - EE 13 DE MAIO - 23/11/2026*).
* **Personalização:** Permite editar o texto livremente, escolher a cor (branco ou preto com contorno de segurança), a orientação (horizontal ou vertical) e a posição (os 4 cantos da foto).

### 5. Troca de Fundo
* **Fundo por Imagem:** Permite carregar uma imagem (ex: brasão, quadro negro, fundo desfocado) e ajustar sua **escala**, **posição (X/Y)** e o modo de **encaixe** (Preencher, Conter ou Esticar).
* **Fundo por Cor Sólida:** Seletor de cores nativo para aplicar fundos lisos (ex: branco oficial, azul, cinza).

---

## 🚀 Como Instalar e Usar

Siga os passos abaixo para adicionar a funcionalidade ao seu navegador:

### Pré-requisitos
* Navegador de internet atualizado (Google Chrome, Mozilla Firefox, Edge, etc).
* Extensão de gerenciamento de scripts [Tampermonkey](https://www.tampermonkey.net/) instalada no navegador.

### Passo a Passo
1. Faça o download do arquivo deste repositório clicando em **Code > Download ZIP**, ou clone através do terminal com o comando:

<pre><code>git clone https://github.com/vendrames/Botao-Tirar-Foto-Cadastro-do-aluno-SIGEDUCA.git</code></pre>

2. Abra o Tampermonkey, clique em **Criar novo script**, cole o conteúdo do arquivo `.user.js` e salve.
   <img src="COLOQUE_O_LINK_DA_FOTO_DO_TAMPERMONKEY_AQUI" width="100%" />
3. Acesse o sistema SIGEDUCA e navegue até a tela de **Cadastro de Aluno**.
4. O botão **"Tirar Foto"** já estará disponível abaixo do botão "Selecionar foto".
5. Clique no botão, posicione o rosto do aluno e clique em **Capturar**.
6. A tela expandirá. Use as opções laterais para tratar a imagem (remover fundo, ajustar brilho, incluir texto, etc).
7. Confirme clicando em **"Usar foto"** — a imagem final será aplicada automaticamente ao cadastro.

> **⚠️ Configuração específica para Mozilla Firefox:**
>
> O Firefox bloqueia o acesso à câmera em sites sem HTTPS por padrão. Clique no ícone ❔ ao lado do botão "Tirar foto" para ver as instruções, ou siga o passo a passo abaixo:
>
> **1.** Na barra de endereços, digite `about:config` e aperte Enter.<br>
> **2.** Clique em **"Aceitar o risco e continuar"**.<br>
> **3.** Pesquise por `media.devices.insecure.enabled` e altere para `true`.<br>
> **4.** Pesquise por `media.getusermedia.insecure.enabled` e altere para `true`.<br>
> **5.** Reinicie o Firefox. O botão estará funcionando normalmente.

---

## 🛠️ Tecnologias Utilizadas

* **JavaScript (Vanilla):** Lógica de captura, manipulação da interface e integração com o SIGEDUCA.
* **HTML/CSS:** Estruturação do modal expansível e estilização dos painéis.
* **WebRTC / MediaDevices API:** Comunicação nativa com a webcam do dispositivo.
* **Canvas API:** Utilizada para aplicar os filtros (Brilho, Contraste, Saturação), compor as camadas da imagem e desenhar o texto final.
* **Fetch API & DOMParser:** Utilizados para buscar os dados da escola na página de consulta em segundo plano.
* **[MediaPipe Selfie Segmentation](https://google.github.io/mediapipe/solutions/selfie_segmentation.html):** Rede neural do Google responsável pela remoção inteligente do fundo.

## 📜 Licença

Este script é de código aberto e livre para uso e modificação no contexto escolar/administrativo.

---
Desenvolvido por [vendrames](https://github.com/vendrames)
