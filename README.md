<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/criperrr/pf-API/refs/heads/main/assets/cti-preto.svg" style="border-top-left-radius: 15px; border-top-right-radius: 15px;">
  <img alt="Descrição do Banner SVG" src="https://raw.githubusercontent.com/criperrr/pf-API/refs/heads/main/assets/cti-branko.svg" style="border-top-left-radius: 20px; border-top-right-radius: 20px;">
</picture>

<h1 align="center">NSAC Scraping API</h1>
 
<div align="center">
    <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js Badge">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript Badge">
    <img src="https://img.shields.io/badge/Express.js-5.x-lightgrey?style=for-the-badge&logo=express" alt="Express.js Badge">
    <img src="https://img.shields.io/badge/Supabase--3ecf8e?style=for-the-badge&logo=supabase" alt="SupaBase Badge">
    <img src="https://img.shields.io/badge/Cheerio--orange?style=for-the-badge&logo=cheerio" alt="Cheerio Badge">
    <img src="https://img.shields.io/badge/Postgresql-17.x-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL Badge">
    <img src="https://img.shields.io/badge/Netlify--32e6e2?style=for-the-badge&logo=netlify" alt="Netlify">
</div>

---

## 🧐 O que é e Por que foi feito?

Nós desenvolvemos esse projeto para expandir os horizontes em relação ao **NSAC Online**.

O **NSAC** é o sistema onde nós, do **Colégio Técnico Industrial (UNESP, Bauru)**, vemos nossas notas, mas ele é antigo e **monolítico** e **não possui uma API publicamente consumível**. Isso significa que se quisermos criar um Bot no Discord, um App mobile ou um site que mostre nossas notas, não conseguimos pegar esses dados facilmente. O sistema retorna apenas páginas HTML pesadas.

**A Solução:**
Esta API funciona como uma "ponte" (ou Middleware). Ela vai até o NSAC, faz o login por você, lê o HTML das notas (usando uma técnica chamada *Web Scraping* com **Cheerio**), limpa tudo e te entrega um **JSON** lindo, fofo, cheiroso e fácil de usar em qualquer linguagem de programação.

## ✨ Features 

1.  **🔍 Filtros Poderosos (Query Params):**
    Diferente do NSAC original, aqui você pode filtrar notas igual SQL. Quer ver só as notas de *Matemática* do *2º Bimestre* que sejam *maiores que 6*? Dá pra fazer! (Veja a doc abaixo).
    
2.  **🔐 Segurança Nível Bancário (quase):**
    Nós **não** salvamos sua senha do NSAC em texto puro. Utilizamos criptografia **AES-256-CBC**. Seus cookies de sessão são criptografados antes de entrar no banco de dados e só são descriptografados na memória RAM na hora da requisição.

3.  **⚡ Cache de Sessão Inteligente:**
    O sistema reutiliza os cookies de sessão do PHP do NSAC. Se o cookie expirar, a API percebe, faz login novamente de forma automática e atualiza o banco sem você perceber.

4.  **🔑 Autenticação Dupla:**
    Sistema completo com login JWT para gerenciar a API e tokens específicos para consultar o NSAC.

---

## 🛠️ Tecnologias

* ![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js) <br>O [NodeJS](https://nodejs.org/en) é o ambiente de execução assíncrono que hospeda a API.

* ![TypeScript 5.x](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)<br>O [TypeScript](https://www.typescriptlang.org/) garante tipagem estática, resultando em um código mais robusto e seguro.

* ![Express.js 5.x](https://img.shields.io/badge/Express.js-5.x-lightgrey?style=for-the-badge&logo=express)<br>O [Express.js](https://expressjs.com/) (versão 5) estrutura a **API RESTful**, gerenciando rotas, middlewares e as respostas HTTP/JSON.

* ![Cheerio](https://img.shields.io/badge/Cheerio-:D-orange?style=for-the-badge&logo=cheerio)<br>O [Cheerio](https://cheerio.js.org/) é a "alma" do _Scraping_. Ele analisa o HTML retornado pelo NSAC para localizar e extrair notas e médias.

* <img src="https://img.shields.io/badge/Postgresql-17.x-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL Badge"> <img src="https://img.shields.io/badge/Supabase--3ecf8e?style=for-the-badge&logo=supabase" alt="SupaBase Badge">
  
  [Supabase](https://supabase.com) é uma plataforma de desenvolvimento [PostgreSQL](https://www.postgresql.org/) que utiliza os AWS para a fácil manutenção de bancos de dados PostgreSQL. Nós utilizamos essa plataforma para armazenar gratuitamente os dados da API.
* <img src="https://img.shields.io/badge/Netlify--32e6e2?style=for-the-badge&logo=netlify" alt="Netlify">
  
  [Netlify](https://www.netlify.com/) é um serviço de hospedagens gratuito que oferece o [Netlify Functions](https://www.netlify.com/platform/core/functions/), baseado em AWS Lambda. O projeto foi originalmente feito somente com o Express, entretanto, dps de expandir ele, decidimos usar o [serverless-http](https://github.com/dougmoscrop/serverless-http) pra adaptar para o modelo serverless e usar o netlify functions.

---

## 🚀 Guia de Instalação

Se você nunca rodou um projeto Node backend, segue o passo a passo:

### 1. Pré-requisitos
*   **Node.js:** Baixe e instale a versão LTS [aqui](https://nodejs.org/).
*   **Git:** Baixe e instale [aqui](https://git-scm.com/).
*   **VS Code** (Opcional, mas recomendado).
##### Se você usa linux, apenas rode:
```bash
# distros debian-based
sudo apt update && sudo apt upgrade
sudo apt install nodejs npm git
``` 
```bash
# distros arch-based
sudo pacman -Syu && sudo pacman -S nodejs npm git
```
de resto, pode fazer exatamente igual.
### 2. Baixando e Instalando
Abra o **PowerShell/seu shell** ou o Terminal do VS Code e digite:

```bash
# 1. Clone o repositório
git clone https://github.com/criperrr/pf-API.git

# 2. Entre na pasta
cd pf-API

# 3. Instale as dependências (libs que o projeto usa)
npm install
```

### 3. Configurando o Ambiente (.env)
Você precisa criar um arquivo para guardar as senhas secretas. 
1. Crie um arquivo chamado `.env` na raiz do projeto (fora da pasta `src`).
2. Cole o seguinte conteúdo nele:

```ini
# A porta onde o servidor vai rodar
PORT="3000"

# Chave secreta para assinar os Logins da API (Invente uma senha difícil)
SECRETKEY="batatinha_frita_123"
# Chave para criptografar os dados do NSAC (AES-256).
# ATENÇÃO: Precisa ser uma chave Hexadecimal de 32 bytes (64 caracteres).
# Dica: Abra o node no terminal e rode: require('node:crypto').randomBytes(32).toString('hex')
ENCRYPTIONKEY="hex_extremamente_secreto_de_32_bytes.(n_use_isso_como_senha.gere_uma)"

# Link de conexão com o banco de dados (Supabase ou Postgres Local)
# Exemplo: postgresql://postgres:senha@db.supabase.co:5432/postgres
DBSTRING="SUA_STRING_DE_CONEXAO_AQUI"
# se rodar pela primeira vez, descomente as linhas 3 à 6 no src/app.ts, roda, dps comenta dnv
```

### 4. Rodando
```bash
npm run dev
```
Se aparecer `RUNNING at 3000`, parabéns! 🎉 A API está viva.
---

# 📚 Documentação da API

**URL Base:** `http://localhost:3000/api`

## 🔐 1. Autenticação (Sua conta na API)
### Registrar Usuário
`POST /auth/register`
Cria um usuário para usar a API. 
Esse endpoint precisa de uma atualização pra ser anti-bot, ele é feito pra ser usado com um front-end, que será implementado posteriormente.
*   **Body (JSON):**
    ```jsonc
    {
      "name": "Seu Nome",
      "email": "dev@exemplo.com",
      "password": "senha_forte_da_api"
    }
    ```

### Login
`POST /auth/login`
Retorna um **Token JWT** (Bearer Token) necessário para criar chaves do NSAC.

*   **Body (JSON):**
    ```jsonc
    {
      "email": "dev@exemplo.com",
      "password": "senha_forte_da_api"
    }
    ```
*   **Resposta:** O token vem no Header `Authorization`.

### Criar Token Mestre (Dev)
`POST /auth/tokens`
Gera um token permanente para o usuário (Master Token), útil para scripts que não querem ficar fazendo login toda hora.
*   **Header Obrigatório:** `Authorization: Bearer <SEU_JWT>`

---

## 🏫 2. Contas NSAC (`/nsac/accounts`)
Endpoints para vincular sua conta do portal acadêmico à API.

### Vincular Conta NSAC e Gerar Token
`POST /nsac/accounts`
Realiza o login no portal NSAC, criptografa os cookies e retorna um **`apiToken`**. Esse token é o que você usará para ver as notas.

*   **Header Obrigatório:** `Authorization: Bearer <SEU_JWT>` **OU** `x-master-token: <MASTER_TOKEN>`
*   **Body (JSON):**
    ```jsonc
    {
      "email": "aluno@nsac.unesp.br",
      "password": "senha_do_nsac"
    }
    ```
*   **Resposta (200 OK):**
    ```jsonc
    {
        "success": true,
        "data": {
            "apiToken": "TOK3N_GERAD0_PARA_CONSULTAR_NOTAS..."
        }
    }
    ```

### Listar Seus Tokens
`GET /nsac/accounts`
*   **Header Obrigatório:** `Authorization: Bearer <SEU_JWT>`

### Deletar/Desvincular Token
`DELETE /nsac/accounts`
*   **Header Obrigatório:** `Authorization: Bearer <SEU_JWT>`
*   **Body (JSON):** `{ "token": "API_TOKEN_PARA_DELETAR" }`

### Verificar Status do Token
`GET /nsac/accounts/token-status`
Verifica se um `apiToken` existe e é válido no banco de dados.
*   **Header Obrigatório:** `x-api-token: <SEU_API_TOKEN_NSAC>`

---

## 📊 3. Notas e Boletins (`/nsac/grades`)
O endpoint principal para extrair os dados.

### Consultar Notas (Com Filtros)
`GET /nsac/grades`

Este endpoint retorna as notas do usuário e médias da turma. Ele aceita filtros avançados via URL (Query Params).

*   **Header Obrigatório:** `x-api-token: <SEU_API_TOKEN_NSAC>`
*   **Exemplo de Resposta:**
    ```jsonc
    {
      "success": true,
      "data": {
        "warning": false,
        "userCurrentYear": 2,
        "filteredGrades": {
           "data": [ "..." ] // Lista de matérias e notas; você pode entender essa estrutura de dados lendo src/types/models/nsac.ts
        }
      }
    }
    ```

### 🧠 Como usar os Filtros
Você pode filtrar o JSON de retorno direto na URL. 

**Campos disponíveis (por enquanto):**
*   `schoolYear`: Ano letivo (1, 2 ou 3).
*   `targetBimester`: Bimestre (1, 2, 3 ou 4).
*   `subjectName`: Nome da matéria.

**Operadores disponíveis:**
*   `eq`: Igual a (string, booleans e numeros)
*   `neq`: Diferente de (booleans e numeros)
*   `gt`: Maior que
*   `gte`: Maior ou igual a
*   `lt`: Menor que
*   `lte`: Menor ou igual a
*   `contains`: Contém texto (para strings)
*   `startsWith`: Começa com (para strings)

**Exemplos de URL:**

1.  **Pegar tudo do 2º Ano:**
    `/api/nsac/grades?schoolYear=2`

2.  **Pegar apenas notas do 3º Bimestre:**
    `/api/nsac/grades?targetBimester=3`

3.  **Pegar matérias de "Matemática" (contém "Mat"):**
    `/api/nsac/grades?subjectName[contains]=Mat`

4.  **Pegar notas do 2º bimestre MAIORES que 2:**
    `/api/nsac/grades?targetBimester[gt]=2`

5. **Pegar as notas entre os bimestres 1 e 3, do 1° ano, de matérias que contenham "Mat" ou "Fund" OU "Hist":** `/api/nsac/grades?targetBimester[gt]=1&targetBimester[lt]=3&schoolYear=1&subjectName[contains]=Mat,Fund,Hist`

---
<div align="center">
Desenvolvido com por alunos do CTI, UNESP.
</div>
<img src="https://mir-s3-cdn-cf.behance.net/project_modules/fs/0427a253368969.5a8662bdf14d0.jpg" style="border-bottom-left-radius: 15px;border-bottom-right-radius: 15px;">