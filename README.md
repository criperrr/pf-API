<h1 align="center">NSAC Scraping API</h1>
 
<div align="center">
    <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js Badge">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript Badge">
    <img src="https://img.shields.io/badge/Express.js-5.x-lightgrey?style=for-the-badge&logo=express" alt="Express.js Badge">
    <img src="https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite" alt="SQLite Badge">
    <img src="https://img.shields.io/badge/Cheerio-:)-orange?style=for-the-badge&logo=cheerio" alt="Cheerio Badge">
</div>

# O que é esse projeto?

Este projeto consiste em uma **API RESTful** robusta (espero eu), desenvolvida utilizando **TypeScript** e o framework **Express.js**.

Nosso foco é solucionar um desafio enfrentado pela comunidade acadêmica: a dificuldade de acesso e uso automatizado dos dados fornecidos pelo **NSAC Online**.

O NSAC Online é a **única** plataforma para a consulta de notas e médias finais dos alunos do Colégio Técnico Industrial (UNESP). No entanto, sua arquitetura é uma **aplicação monolítica** que **não disponibiliza** uma Interface de Programação de Aplicações (API) pública. Todas as interações resultam no retorno de páginas em **HTML puro**.

Nossa API atua como uma **camada de abstração** vital, transformando a complexidade de interagir com o HTML do NSAC em _endpoints_ limpos e fáceis de usar. Isso permite que qualquer aplicação externa — seja um bot no Discord, um serviço de notificação no WhatsApp ou um aplicativo móvel — possa consumir esses dados de forma moderna e eficiente, utilizando o formato **JSON**.

## Tecnologias utilizadas:

![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js) <br>
O [NodeJS](https://nodejs.org/en) é o ambiente de execução assíncrono que hospeda a API.

![TypeScript 5.x](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)<br>
O [TypeScript](https://www.typescriptlang.org/) garante tipagem estática, resultando em um código mais robusto e seguro.

![Express.js 5.x](https://img.shields.io/badge/Express.js-5.x-lightgrey?style=for-the-badge&logo=express)<br>
O [Express.js](https://expressjs.com/) (versão 5) estrutura a **API RESTful**, gerenciando rotas, middlewares e as respostas HTTP/JSON.

![Cheerio](https://img.shields.io/badge/Cheerio-:D-orange?style=for-the-badge&logo=cheerio)<br>
O [Cheerio](https://cheerio.js.org/) é a "alma" do _Scraping_. Ele analisa o HTML retornado pelo NSAC para localizar e extrair notas e médias.

![SQLite 3](https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite)<br>
O [SQLite3](https://sqlite.org/) é utilizado para armazenar usuários, contas vinculadas e tokens de sessão localmente.

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
3.  **Configure as variáveis de ambiente:** Crie um arquivo chamado `.env` na raiz do projeto e adicione:
    
    ```bash
    # Porta em que o servidor irá rodar
    PORT="3000"
    
    # Chave para assinar os tokens JWT (Login na API)
    SECRETKEY="sua_chave_jwt_super_secreta"

    # Chave para criptografar os cookies do NSAC no banco de dados (AES-256)
    # Dica: Gere uma chave válida com: openssl rand -hex 32
    ENCRYPTIONKEY="chave_hexadecimal_com_32_bytes" 
    
    # URI de conexão (obrigatório para inicialização)
    MONGODBURI="sua_connection_string_mongo"
    ```
 4. **Execute o servidor em modo de desenvolvimento:**
    ```bash
    npm run dev 
    ``` 
  O servidor estará rodando em `http://localhost:3000`.

# 📚 Documentação da API

**Formato padrão de resposta:**
Todas as requisições bem-sucedidas retornam um objeto JSON no seguinte formato:
```json
{
  "success": true,
  "data": { ... }
}
```
Em caso de erro:
```json
{
  "success": false,
  "errors": [ { "message": "...", "code": "..." } ]
}
```

---

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
    - `201 Created`: Usuário criado.
    - `400 Bad Request`: Campos inválidos ou faltando.
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
    - `200 OK`: O token é retornado no header `Authorization` (`Bearer <token>`). O corpo contém:
      ```json
      {
        "success": true,
        "data": {
            "message": "Logged succesfully",
            "userId": 1
        }
      }
      ```
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
        "success": true,
        "data": {
            "message": "Token created successfully",
            "userId": 1,
            "nsacAccountId": 10,
            "apiToken": "TOK3N_GERAD0_PARA_CONSULTAR_NOTAS"
        }
    }
    ```

#### 2. Listar Tokens
`GET /api/nsac/accounts`

Retorna todos os tokens de API gerados pelo seu usuário.

- **Resposta (200 OK):**
    ```jsonc
    {
        "success": true,
        "data": [
            { "token": "TOK3N...", "id_NsacAccount": 10 },
            { "token": "OUTR0...", "id_NsacAccount": 12 }
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
- **Resposta (200 OK):**
    ```jsonc
    {
        "success": true,
        "data": {
            "message": "Success! Token unlinked from your account and deleted from DB."
        }
    }
    ```

---

## 📊 Notas e Boletins (`/api/nsac/grades`)
Endpoints para realizar o scraping das notas.

### ⚠️ Regras de Autenticação dos Endpoints
1. O Header `x-api-token` é **obrigatório** em todas as rotas abaixo. Este é o token gerado na rota de vincular conta (item 1 da seção anterior), **não** é o JWT de login.

#### 4. Consultar Boletim Completo
`GET /api/nsac/grades`

Retorna o panorama completo: notas da turma, notas do usuário e hashes de integridade.

- **Headers Obrigatórios:**
    - `x-api-token`: `<SEU_APITOKEN>`
- **Query Params:**
    - `year`: Número do ano letivo (ex: `3`).
- **Exemplo de URL:** `/api/nsac/grades?year=3`
- **Resposta (200 OK):**
  ```json
  {
    "success": true,
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

Retorna apenas a lista de matérias e as notas gerais da sala (raspagem anônima).

- **Headers Obrigatórios:**
    - `x-api-token`: `<SEU_APITOKEN>`
- **Query Params:**
    - `year`: Número do ano letivo.
- **Exemplo de URL:** `/api/nsac/grades/class?year=3`
- **Resposta (200 OK):**
  ```jsonc
  {
    "success": true,
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
    - `x-api-token`: `<SEU_APITOKEN>`
- **Query Params:**
    - `year`: Número do ano letivo.
- **Exemplo de URL:** `/api/nsac/grades/private?year=3`
- **Resposta (200 OK):**
  ```jsonc
  {
    "success": true,
    "data": {
        "userCurrentYear": 3,
        "userHashes": ["..."],
        "userGrades": [
             { "name": "MATEMÁTICA", "grades": ["10.0", "8.5", "B", "B"] }
        ]
    }
  }
  ```

#### 7. Verificar Status do Token
`GET /api/nsac/accounts/token-status`

Verifica se um API Token é válido sem realizar scraping.

- **Headers Obrigatórios:**
    - `x-api-token`: `<SEU_APITOKEN>`
- **Respostas:**
    - `200 OK`: Token válido.
    - `401 Unauthorized`: Token inválido ou não fornecido.