<h1 align="center">NSAC Scraping API</h1>
 
<div align="center">
    <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js Badge">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript Badge">
    <img src="https://img.shields.io/badge/Express.js-4.x-lightgrey?style=for-the-badge&logo=express" alt="Express.js Badge">
    <img src="https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite" alt="SQLite Badge">
    <img src="https://img.shields.io/badge/Cheerio-:)-orange?style=for-the-badge&logo=cheerio" alt="Cheerio Badge">
</div>

# O que é esse projeto?

Este projeto consiste em uma **API RESTful** robusta, desenvolvida utilizando **TypeScript** e o framework **Express.js**.

Nosso foco é solucionar um desafio enfrentado pela comunidade acadêmica: a dificuldade de acesso e uso automatizado dos dados fornecidos pelo **NSAC Online**.

O NSAC Online é a **única** plataforma para a consulta de notas e médias finais dos alunos do Colégio Técnico Industrial (UNESP). No entanto, sua arquitetura é uma **aplicação monolítica** (provavelmente em PHP/Laravel) que **não disponibiliza** uma Interface de Programação de Aplicações (API) pública. Todas as interações resultam no retorno de páginas em **HTML puro**.

Nossa API atua como uma **camada de abstração** vital, transformando a complexidade de interagir com o HTML do NSAC em _endpoints_ limpos e fáceis de usar. Isso permite que qualquer aplicação externa — seja um bot no Discord, um serviço de notificação no WhatsApp ou um aplicativo móvel — possa consumir esses dados de forma moderna e eficiente, utilizando o formato **JSON**.

## Antes de tudo, o que é _Web Scraping_? 🕵️
Para viabilizar essa abstração, o projeto emprega a técnica de **Web Scraping** (ou Raspagem de Dados).

Scraping é uma técnica utilizada para **coletar informações estruturadas** de sites que não fornecem um canal de acesso direto (como uma API nativa exposta publicamente).

#### Como Funciona:

1.  **Simulação:** Em vez de o usuário acessar o site manualmente, nossa API simula a interação de um navegador real.
2.  **Captura:** O usuário envia seu login e senha para nossa API. Nós autenticamos no NSAC, capturamos os cookies de sessão e geramos um **APIToken** exclusivo para o usuário.
3.  **Extração:** Quando você solicita suas notas, a API usa esse token para acessar as páginas internas do NSAC, baixar o HTML e "ler" os dados relevantes (notas, faltas, matérias).
4.  **Transformação:** Os dados extraídos são limpos e convertidos de tabelas HTML complexas para um formato **JSON** estruturado.
5.  **Entrega:** A API entrega esse JSON pronto para uso ao desenvolvedor.
6.  **Sua vez**: Você apresenta esses dados para o usuário final na plataforma que preferir.

## Tecnologias utilizadas:

![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js) <br>
O [NodeJS](https://nodejs.org/en) é o ambiente de execução assíncrono que hospeda a API. Escolhemos a versão **18+** para aproveitar melhorias de performance e recursos recentes.

![TypeScript 5.x](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)<br>
O [TypeScript](https://www.typescriptlang.org/) garante tipagem estática, resultando em um código mais robusto e seguro, essencial para a manipulação precisa dos dados extraídos.

![Express.js 4.x](https://img.shields.io/badge/Express.js-4.x-lightgrey?style=for-the-badge&logo=express)<br>
O [Express.js](https://expressjs.com/) estrutura a **API RESTful**, gerenciando rotas, middlewares e as respostas HTTP/JSON.

![Cheerio](https://img.shields.io/badge/Cheerio-:D-orange?style=for-the-badge&logo=cheerio)<br>
O [Cheerio](https://cheerio.js.org/) é a "alma" do _Scraping_. Ele analisa o HTML retornado pelo NSAC com uma sintaxe similar ao jQuery, permitindo localizar e extrair notas e médias rapidamente.

![SQLite 3](https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite)<br>
O [SQLite3](https://sqlite.org/) é utilizado para armazenar usuários, contas vinculadas e tokens de sessão de forma leve e local, sem necessidade de configurar um servidor de banco de dados complexo.

# ⚙️ Como Começar
## Pré-requisitos
1. NodeJS 18 ou superior.
2. NPM ou outro gerenciador de pacotes (yarn, pnpm).
3. Um cérebro funcional.

## **Instalação**
1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as variáveis de ambiente:** Crie um arquivo chamado `.env` na raiz do projeto e adicione:
    
    ```bash
    # Porta em que o servidor irá rodar
    PORT="3000"
    
    # Chave para assinar os tokens JWT (Login na API)
    SECRETKEY="sua_chave_jwt_super_secreta"

    # Chave para criptografar os cookies do NSAC no banco de dados (AES-256)
    ENCRYPTIONKEY="chave_hexadecimal_com_32_bytes" 
    # Dica: Gere uma chave válida com: openssl rand -hex 32
    ```
 4. **Execute o servidor em modo de desenvolvimento:** O servidor irá reiniciar automaticamente a cada alteração no código.
    ```bash
    npm run dev 
    ``` 
  O servidor estará rodando em `http://localhost:3000`.

# 📚 Documentação da API

## 🔐 Autenticação (`/api/auth`)
Endpoints para criar e logar usuários **na API** (não no NSAC).

#### 1. Registrar Usuário
`POST /api/auth/register`

Cria um novo usuário para utilizar a API.

- **Body:**
   ```jsonc
   {
     "name": "Seu Nome",
     "email": "dev@exemplo.com",
     "password": "senha_forte_da_api"
   }
   ```
- **Respostas:**
    - `201 Created`: Usuário criado com sucesso.
    - `400 Bad Request`: Campos faltando ou e-mail inválido.
    - `409 Conflict`: E-mail já cadastrado.

#### 2. Login
`POST /api/auth/login`

Autentica e retorna um **Token JWT** (Bearer Token) necessário para usar as rotas do NSAC.

- **Body:**
    ```jsonc
    {
      "email": "dev@exemplo.com",
      "password": "senha_forte_da_api"
    }
    ```
- **Respostas:**
    - `200 OK`: Login bem-sucedido. O JWT vem no header `Authorization` e no corpo.
    - `401 Unauthorized`: Credenciais inválidas.

---

## 🏫 NSAC (`/api/nsac`)
Endpoints para interagir com o portal acadêmico.  
⚠️ **Requer Header:** `Authorization: Bearer <SEU_TOKEN_JWT>`

#### 1. Vincular Conta NSAC
`POST /api/nsac/accounts`

Realiza o login no portal NSAC, captura os cookies, criptografa-os e gera um **APIToken**.

- **Body:**
    ```jsonc
    {
      "email": "aluno@nsac.unesp.br",
      "password": "senha_do_portal_nsac"
    }
    ```
- **Respostas:**
    - `200 OK`: Conta vinculada. Retorna o `APIToken`.
    - `401 Unauthorized`: Login no NSAC falhou.

#### 2. Listar Contas Vinculadas
`GET /api/nsac/accounts`

Retorna os tokens de API associados ao seu usuário.

- **Respostas:**
    - `200 OK`: Lista de tokens (`apiTokenIds`).

#### 3. Desvincular Conta
`DELETE /api/nsac/accounts`

Remove o vínculo de uma conta NSAC.

- **Body:**
    ```jsonc
    {
      "token": "SEU_APITOKEN_AQUI"
    }
    ```
- **Respostas:**
    - `200 OK`: Sucesso.
    - `404 Not Found`: Token não encontrado.

---

### 📊 Boletins e Notas
Abaixo estão as rotas para consulta de notas.
> **Nota Técnica:** Estes endpoints utilizam o método `GET`, mas esperam os parâmetros `APIToken` e `ano` dentro do **Body (JSON)** da requisição. Certifique-se de que seu cliente HTTP suporta o envio de corpo em requisições GET.

**Parâmetros do Body (para todas as rotas abaixo):**
```jsonc
{
  "APIToken": "SEU_APITOKEN_AQUI",
  "ano": 3
}
```
* `ano`: O ano letivo a ser consultado (ex: `3` para o 3º ano).

#### 4. Consultar Boletim Completo
`GET /api/nsac/grades`

Retorna **todos** os dados disponíveis (notas gerais da turma, notas do aluno e hashes de validação). Útil para ter uma visão geral completa.

- **Resposta (200 OK):**
  ```jsonc
  {
    "data": {
        "gradesLenght": 15,
        "userCurrentYear": 3,
        "generalGrades": [...], // Notas da turma
        "userGrades": [...],    // Notas do aluno
        "generalHashes": [...], // Hashes gerados a partir da media da turma para verificar rapidamente qual nota foi modificada (se foi atualizada)
        "userHashes": [...] // Idem
    }
  }
  ```

#### 5. Consultar Apenas Notas da Turma
`GET /api/nsac/grades/class`

Retorna apenas as notas gerais (médias da sala).

- **Resposta (200 OK):**
  ```jsonc
  {
    "data": {
        "generalHashes": ["hash1", "hash2"...],
        "grades": [
            { 
                "name": "MATEMÁTICA", 
                "grades": ["10", "5.0", "7.0", "10", "0"] 
            },
            { 
                "name": "PORTUGUÊS", 
                "grades": ["8.0", "9.0", "8.5", "10", "2"] 
            }
        ]
    }
  }
  ```

#### 6. Consultar Apenas Notas Privadas
`GET /api/nsac/grades/private`

Retorna apenas as notas específicas do aluno logado.

- **Resposta (200 OK):**
  ```jsonc
  {
    "data": {
        "userCurrentYear": 3,
        "userHashes": ["hash1", "hash2"...],
        "grades": [
             { 
                "name": "MATEMÁTICA", 
                "grades": ["10.0", "8.5", "9.0", "10.0", "0"] 
             },
             // ...
        ]
    }
  }
  ```