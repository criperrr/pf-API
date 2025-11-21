<h1 align="center">NSAC Scraping API</h1>
 
<div align="center">
    <img src="[https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)" alt="Node.js Badge">
    <img src="[https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)" alt="TypeScript Badge">
    <img src="[https://img.shields.io/badge/Express.js-5.x-lightgrey?style=for-the-badge&logo=express](https://img.shields.io/badge/Express.js-5.x-lightgrey?style=for-the-badge&logo=express)" alt="Express.js Badge">
    <img src="[https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite](https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite)" alt="SQLite Badge">
    <img src="[https://img.shields.io/badge/Cheerio-:)-orange?style=for-the-badge&logo=cheerio](https://img.shields.io/badge/Cheerio-:)-orange?style=for-the-badge&logo=cheerio)" alt="Cheerio Badge">
</div>

# O que é esse projeto?

Este projeto consiste em uma **API RESTful** robusta, desenvolvida utilizando **TypeScript** e o framework **Express.js**.

Nosso foco é solucionar um desafio enfrentado pela comunidade acadêmica: a dificuldade de acesso e uso automatizado dos dados fornecidos pelo **NSAC Online**.

O NSAC Online é a **única** plataforma para a consulta de notas e médias finais dos alunos do Colégio Técnico Industrial (UNESP). No entanto, sua arquitetura é uma **aplicação monolítica** que **não disponibiliza** uma Interface de Programação de Aplicações (API) pública.

Nossa API atua como uma **camada de abstração** vital, transformando a complexidade de interagir com o HTML do NSAC em _endpoints_ limpos e fáceis de usar (JSON).

# ⚙️ Como Começar

## Pré-requisitos
1. NodeJS 18 ou superior.
2. NPM ou outro gerenciador de pacotes (yarn, pnpm).

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
3.  **Configure as variáveis de ambiente:** Crie um arquivo chamado `.env` na raiz do projeto contendo:
    ```bash
    PORT="3000"
    SECRETKEY="sua_chave_jwt_super_secreta"
    ENCRYPTIONKEY="chave_hexadecimal_com_32_bytes" 
    # Dica: Gere a chave HEX com: openssl rand -hex 32
    ```
4. **Execute o servidor:**
    ```bash
    npm run dev 
    ``` 

# 📚 Documentação da API

## 🔐 Autenticação (`/api/auth`)
Endpoints para criar e logar usuários **na API**.

#### 1. Registrar Usuário
`POST /api/auth/register`

Cria um novo usuário para utilizar a API.

- **Body (JSON):**
   ```jsonc
   {
     "name": "Seu Nome",
     "email": "dev@exemplo.com",
     "password": "senha_forte_da_api"
   }
   ```
- **Respostas:**
    - `201 Created`: Usuário criado com sucesso.
    - `400 Bad Request`: Campos inválidos.
    - `409 Conflict`: E-mail já existe.

#### 2. Login
`POST /api/auth/login`

Autentica e retorna um **Token JWT** (Bearer Token) necessário para gerenciar as contas do NSAC.

- **Body (JSON):**
    ```jsonc
    {
      "email": "dev@exemplo.com",
      "password": "senha_forte_da_api"
    }
    ```
- **Respostas:**
    - `200 OK`: Retorna o token no corpo e no header `Authorization`.
    - `401 Unauthorized`: Credenciais inválidas.

---

## 🏫 Contas NSAC (`/api/nsac/accounts`)
Endpoints para vincular contas do portal acadêmico ao seu usuário da API.  
⚠️ **Requer Header:** `Authorization: Bearer <SEU_TOKEN_JWT_LOGIN>`.

#### 1. Vincular Conta NSAC
`POST /api/nsac/accounts`

Realiza o login no portal NSAC, captura os cookies, criptografa-os e gera um **APIToken** que será usado para consultar notas.

- **Body (JSON):**
    ```jsonc
    {
      "email": "aluno@nsac.unesp.br",
      "password": "senha_do_portal_nsac"
    }
    ```
- **Resposta Sucesso (200 OK):**
    ```jsonc
    {
        "data": {
            "userId": 1,
            "nsacAccountId": 10,
            "apiToken": "TOK3N_GERAD0_PARA_CONSULTAR_NOTAS"
        },
        "errors": []
    }
    ```

#### 2. Listar Tokens
`GET /api/nsac/accounts`

Retorna todos os tokens de API gerados pelo seu usuário.

- **Resposta (200 OK):**
    ```jsonc
    {
        "apiTokenIds": [
            { "token": "TOK3N...", "id_NsacAccount": 10 }
        ]
    }
    ```

#### 3. Deletar Token
`DELETE /api/nsac/accounts`

Remove o vínculo de uma conta e invalida o token.

- **Body (JSON):**
    ```jsonc
    {
      "token": "SEU_APITOKEN_AQUI"
    }
    ```

---

## 📊 Notas e Boletins (`/api/nsac/grades`)
Endpoints para realizar o scraping das notas.

### ⚠️ Regras de Autenticação dos Endpoints
Devido à estrutura atual, os requisitos variam por rota:
1. O Header `x-api-token` é **obrigatório** em todas as rotas abaixo (verificação de segurança).

#### 4. Consultar Boletim Completo
`GET /api/nsac/grades`

Retorna o panorama completo: notas da turma, notas do usuário e hashes de integridade.

- **Headers Obrigatórios:**
    - `x-api-token`: `<SEU_APITOKEN>`
- **Query Params:**
    - `ano`: Número do ano letivo (ex: `3`).
- **Exemplo de URL:** `/api/nsac/grades?ano=3`
- **Resposta (200 OK):**
  ```json
  {
    "data": {
        "gradesLenght": 15,
        "userCurrentYear": 3,
        "generalGrades": [...], // Notas da turma (anonimizadas/gerais)
        "userGrades": [...],    // Notas do seu usuário
        "generalHashes": [...],
        "userHashes": [...]
    }
  }
  ```

#### 5. Consultar Apenas Notas da Turma
`GET /api/nsac/grades/class`

Retorna apenas a lista de matérias e as notas gerais da sala.

- **Headers Obrigatórios:**
    - `x-api-token`: `<SEU_APITOKEN>` (Para autenticação)
- **Query Params:**
    - `ano`: Número do ano letivo.
    - `apiToken`: `<SEU_APITOKEN>` (Para execução interna)
- **Exemplo de URL:** `/api/nsac/grades/class?ano=3&apiToken=SEU_TOKEN_AQUI`
- **Resposta (200 OK):**
  ```jsonc
  {
    "data": {
        "generalHashes": ["..."],
        "generalGrades": [
            { "name": "MATEMÁTICA", "grades": ["10", "5.0", "MB", "R"] }
        ]
    }
  }
  ```

#### 6. Consultar Apenas Notas Privadas
`GET /api/nsac/grades/private`

Retorna apenas as notas do aluno dono do token.

- **Headers Obrigatórios:**
    - `x-api-token`: `<SEU_APITOKEN>` (Para autenticação)
- **Query Params:**
    - `ano`: Número do ano letivo.
    - `apiToken`: `<SEU_APITOKEN>` (Para execução interna)
- **Exemplo de URL:** `/api/nsac/grades/private?ano=3&apiToken=SEU_TOKEN_AQUI`
- **Resposta (200 OK):**
  ```jsonc
  {
    "data": {
        "userCurrentYear": 3,
        "userHashes": ["..."],
        "userGrades": [
             { "name": "MATEMÁTICA", "grades": ["10.0", "8.5", "B", "B"] }
        ]
    }
  }
  ```