# 📸 Botão Tirar Foto - Cadastro do Aluno (SIGEDUCA)

> Facilitador para capturar fotos de alunos diretamente na tela de cadastro do sistema SIGEDUCA, utilizando a webcam.

## 📖 Sobre o Script

Este script foi desenvolvido para otimizar e agilizar o processo de inserção da foto do estudante no cadastro de alunos do sistema SIGEDUCA. Ele adiciona um botão **"Tirar foto"** abaixo do botão "Selecionar foto", habilitando a webcam e capturando a foto do aluno em tempo real — sem precisar tirar a foto em outro aplicativo, salvar no computador e depois fazer o upload manual no sistema.

## ✨ Funcionalidades

* **Captura em Tempo Real:** Acesso à webcam do dispositivo diretamente pelo navegador.
* **Modal Elegante:** Interface moderna com fundo escuro, animações suaves e cantos decorativos no visor da câmera.
* **Preview antes de confirmar:** Após capturar, é possível visualizar a foto e escolher entre **"Usar foto"** ou **"Tirar novamente"** antes de aplicar ao cadastro.
* **Efeito de flash:** Feedback visual no momento da captura, simulando o disparo de uma câmera.
* **Correção de espelhamento:** O visor exibe a imagem espelhada (como um espelho), mas a foto salva é corrigida automaticamente para a orientação correta.
* **Barra de status:** Indicador em tempo real do estado da câmera — ativa, foto capturada ou erro.
* **Integração Fluida:** O botão se integra visualmente à página de cadastro do SIGEDUCA e a foto é aplicada automaticamente ao campo do aluno ao confirmar.
* **Economia de Tempo:** Elimina as etapas de salvamento e upload de arquivo, facilitando o trabalho da secretaria escolar.
* **Suporte a Firefox:** Botão de ajuda (❔) com instruções passo a passo para habilitar a câmera no Mozilla Firefox em conexões HTTP.

## 🖼️ Demonstração da Interface

Veja como o botão se integra ao sistema e seu funcionamento:

<figure>
  <img src="https://github.com/user-attachments/assets/9f2af901-a459-4a7d-a094-a73e2135377a" alt="Botão Tirar Foto" width="100%">
  <figcaption align="center"><em>Figura 1: Botão "Tirar Foto" integrado à tela de cadastro do SIGEDUCA.</em></figcaption>
</figure>

<figure>
  <img src="https://github.com/user-attachments/assets/9df550c7-3e3e-4140-94eb-1dfd9a764413" alt="Modal de captura de foto" width="100%">
  <figcaption align="center"><em>Figura 2: Modal de captura com câmera ativa e visor com cantos decorativos.</em></figcaption>
</figure>

<figure>
  <img src="https://github.com/user-attachments/assets/2ebc357a-5d63-4960-b7a6-b08c841075be" alt="Preview da foto capturada" width="100%">
  <figcaption align="center"><em>Figura 3: Tela de preview — confirme ou tire novamente antes de salvar.</em></figcaption>
</figure>

<figure>
  <img src="https://github.com/user-attachments/assets/771c3880-3152-4520-a44c-fe1e241d4576" alt="Foto aplicada ao cadastro" width="100%">
  <figcaption align="center"><em>Figura 4: Foto aplicada diretamente ao campo de imagem do aluno no sistema.</em></figcaption>
</figure>

## 🚀 Como Instalar e Usar

Siga os passos abaixo para adicionar a funcionalidade ao seu navegador:

### Pré-requisitos
* Navegador de internet atualizado (Google Chrome, Mozilla Firefox, Edge, etc).
* Extensão de gerenciamento de scripts [Tampermonkey](https://www.tampermonkey.net/) instalada no navegador.

### Passo a Passo
1. Faça o download do arquivo deste repositório clicando em **Code > Download ZIP**, ou clone através do terminal com o comando:
   ```
   git clone https://github.com/vendrames/Botao-Tirar-Foto-Cadastro-do-aluno-SIGEDUCA.git
   ```
2. Abra o Tampermonkey, clique em **Criar novo script**, cole o conteúdo do arquivo `.user.js` e salve.
   <img width="13832" height="480" alt="Design sem nome(3)" src="https://github.com/user-attachments/assets/08383e5f-91a4-4dee-a9cd-63a8d5bae17a" />
3. Acesse o sistema SIGEDUCA e navegue até a tela de **Cadastro de Aluno**.
4. O botão **"Tirar Foto"** já estará disponível abaixo do botão "Selecionar foto".
5. Clique no botão para abrir o modal, posicione o rosto do aluno no visor e clique em **Capturar**.
6. Visualize a foto na tela de preview e confirme clicando em **"Usar foto"** — ou clique em **"Tirar novamente"** caso queira refazer.

> **⚠️ Configuração específica para Mozilla Firefox:**
>
> O Firefox bloqueia o acesso à câmera em sites sem HTTPS por padrão. Clique no ícone ❔ ao lado do botão "Tirar foto" para ver as instruções, ou siga o passo a passo abaixo:
>
> **1.** Na barra de endereços, digite `about:config` e aperte Enter.<br>
> **2.** Clique em **"Aceitar o risco e continuar"**.<br>
> **3.** Pesquise por `media.devices.insecure.enabled` e altere para `true`.<br>
> **4.** Pesquise por `media.getusermedia.insecure.enabled` e altere para `true`.<br>
> **5.** Reinicie o Firefox. O botão estará funcionando normalmente.

## 🛠️ Tecnologias Utilizadas

* **JavaScript:** Lógica de captura, manipulação da interface e integração com o SIGEDUCA.
* **HTML/CSS:** Estruturação e estilização do modal e dos botões.
* **WebRTC / MediaDevices API:** Comunicação nativa com a webcam do dispositivo.
* **Canvas API:** Captura e correção de espelhamento da imagem antes de aplicar ao cadastro.

## 📜 Licença

Este script é de código aberto e livre para uso e modificação no contexto escolar/administrativo.

---
Desenvolvido por [vendrames](https://github.com/vendrames)
