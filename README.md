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

#### 4.1 Serverless
Se quiser testar, você também pode testar o serverless com netlify.
Entretanto, certifique-se de ter o netlify-cli instalado e totalmente configurado com sua conta e um projeto.
Com tudo configurado, simplesmente execute:
```bash
npm run dev-serverless
``` 
---

# 📚 Documentação da API

**URL Base:** `http://localhost:3000/api`
**URL Pública base:** `https://api-nsac.netlify.app/api` _(Não posso garantir que ela está funcionando quando vc estiver vendo isso)_
**URL base (serverless):** `http://localhost:8888/api`

A API utiliza uma arquitetura de **dois níveis de autenticação**:
1.  **Tokens de Gerenciamento:** (JWT ou Master Token) para vincular e desvincular contas.
2.  **Tokens de Consulta:** (`x-api-token`) para realizar o scraping das notas.

---

## 🔐 1. Autenticação (Conta da API)

### Registrar Usuário
`POST /auth/register`
*   **Body:** `{ "name": "...", "email": "...", "password": "..." }`
*   **Resposta (201):**
    ```json
    {
      "success": true,
      "data": { "message": "Users created successfully!", "userId": 1 }
    }
    ```

### Login
`POST /auth/login`
*   **Body:** `{ "email": "...", "password": "..." }`
*   **Header de Resposta:** `Authorization: Bearer <JWT_TOKEN>`

### Gerar Master Token (Permanente)
`POST /auth/tokens`
*   **Auth:** `Bearer <JWT_TOKEN>`
*   **Descrição:** Gera um token que não expira para automações.
*   **Resposta:**
    ```json
    {
      "success": true,
      "data": { "message": "Token created successfully", "masterToken": "BEB7..." }
    }
    ```

---

## 🏫 2. Contas NSAC (`/nsac/accounts`)

### Vincular Conta e Gerar `apiToken`
`POST /nsac/accounts`
*   **Auth:** `Bearer <JWT>` ou `x-master-token: <TOKEN>`
*   **Body:** `{ "email": "aluno@unesp.br", "password": "..." }`
*   **Resposta:**
    ```json
    {
      "success": true,
      "data": {
        "message": "Token created successfully",
        "apiToken": "TOK3N_GERAD0_..."
      }
    }
    ```

---

## 📊 3. Notas e Boletim (`/nsac/grades`)

### Consultar Boletim
`GET /nsac/grades`
*   **Header:** `x-api-token: <SEU_API_TOKEN_NSAC>`
*   **Query Params:** Veja a seção de filtros abaixo.

#### Exemplo de Resposta (Sucesso):
```json
{
    "success": true,
    "data": {
        "warning": false,
        "userCurrentYear": 3,
        "filteredGrades": {
            "warning": false,
            "userCurrentYear": 3,
            "data": [
                {
                    "title": "INI1",
                    "year": 2024,
                    "status": "Aprovado",
                    "grades": [
                        {
                            "subjectName": "Fundamentos de Informática",
                            "results": { "grade": 8.1, "totalAbsences": 2 },
                            "bimesters": [
                                {
                                    "bimester": 4,
                                    "personal": {
                                        "grade": 6,
                                        "recovery": true,
                                        "absences": 0,
                                        "recovered": true,
                                        "recoveryCode": "SAT",
                                        "recoveryMessage": "Satisfatório"
                                    },
                                    "class": { "averageGrade": 7.5 }
                                }
                            ]
                        }
                    ],
                    "bimestersMetrics": [
                        { "userAverage": 7.87, "classAverage": 7.81, "totalAbsences": 12 }
                    ]
                }
            ]
        }
    }
}
```
query usada:
```http
GET https://url_base/nsac/grades?isRecovery=true
```
# 🧠 Guia Completo de Filtragem (NSAC Service)

A API do NSAC permite que você realize consultas altamente granulares diretamente via Query Parameters. O motor de filtragem processa o JSON de retorno e remove dinamicamente os objetos que não correspondem aos critérios definidos, mantendo a integridade da estrutura de dados.

---

## 🛠️ Campos Disponíveis para Filtro

| Parâmetro        | Tipo      | Descrição                                                              |
| :--------------- | :-------- | :--------------------------------------------------------------------- |
| `schoolYear`     | `Number`  | Filtra pelo índice do ano letivo (1, 2 ou 3).                          |
| `targetBimester` | `Number`  | Filtra bimestres específicos (1 a 4) dentro de cada matéria e métrica. |
| `subjectName`    | `String`  | Filtra pelo nome da disciplina/matéria.                                |
| `grade`          | `Number`  | Filtra pela nota individual do aluno em cada bimestre.                 |
| `classAverage`   | `Number`  | Filtra com base na média da sala/classe.                               |
| `isRecovery`     | `Boolean` | Filtra se o aluno está em recuperação (`true`/`false`).                |
| `recoveryCode`   | `String`  | Filtra pelo código de recuperação. Possíveis códigos são: **"NAC"** (Não AConteceu); **"NCP"** (Não ComPareceu); **"INS"** (INSatisfatório); **"SAT"** (SATisfatório)|

---

## 🔢 Operadores Suportados

Dependendo do tipo do campo, você pode utilizar operadores para refinar a busca usando a sintaxe `campo[operador]=valor`.

### Para Números (`grade`, `schoolYear`, `targetBimester`, `classAverage`)
* `eq`: Igual a
* `neq`: Diferente de
* `gt`: Maior que ($>$)
* `gte`: Maior ou igual a ($\geq$)
* `lt`: Menor que ($<$)
* `lte`: Menor ou igual a ($\leq$)

### Para Strings (`subjectName`, `recoveryCode`)
* `eq`: Correspondência exata.
* `contains`: Verifica se o texto contém a sub-string informada.
* `startsWith`: Verifica se o texto inicia com o termo.

### Para Booleanos (`isRecovery`)
* `eq`: Igual a (`true` ou `false`).
* `neq`: Diferente de.

---

## 💡 Exemplos de Uso

### 1. Filtros Básicos e Posicionais
* **Apenas dados do 2º Ano:**
    `GET /api/nsac/grades?schoolYear=2`
* **Apenas notas do 4º Bimestre:**
    `GET /api/nsac/grades?targetBimester=4`

### 2. Filtros de Performance Acadêmica
* **Matérias onde a nota foi menor que 5.0:**
    `GET /api/nsac/grades?grade[lt]=5`
* **Matérias com nota entre 7 e 9:**
    `GET /api/nsac/grades?grade[gte]=7&grade[lte]=9`
* **Onde a média da classe foi maior que 8.0:**
    `GET /api/nsac/grades?classAverage[gt]=8`

### 3. Recuperação e Status
* **Listar apenas bimestres onde o aluno está em recuperação:**
    `GET /api/nsac/grades?isRecovery=true`
* **Filtrar por código de recuperação específico (no exemplo, pega qualquer caso diferente de NAC):**
    `GET /api/nsac/grades?recoveryCode=INS,SAT,NCP`
* **Disciplinas sem código de recuperação (Status Não AConteceu):**
    `GET /api/nsac/grades?recoveryCode[eq]=NAC`

### 4. Busca Textual Avançada
* **Disciplinas de Exatas (Matemática, Física, etc):**
    `GET /api/nsac/grades?subjectName[contains]=Mat,Fis`
* **Disciplinas que começam com "Língua":**
    `GET /api/nsac/grades?subjectName[startsWith]=Lingua`

---

## 🚀 Consultas Combinadas (Complexas)

Você pode empilhar filtros para gerar relatórios específicos. O motor aplica a lógica `AND` entre diferentes campos.

**Cenário: Aluno quer ver notas de "Matemática" ou "Física", apenas do 3º ano, onde ele ficou com nota abaixo de 6 no 1º ou 2º bimestre:**

```http
GET /api/nsac/grades?schoolYear=3&subjectName[contains]=Mat,Fis&grade[lt]=6&targetBimester[lte]=2
```

# ⚠️ OBS ⚠️

Toda e qualquer string perde os acentos (ã,é, etc) e vai para lowercase. Isso é feito para facilitar o acesso (ex: poder acessar Matemática usando 'matematica' ou 'Matematica'). Se essa feature for um problema, por favor, abra um issue me avisando que eu posso implementar uma forma de forçar que ele verifique EXATAMENTE caracter por caracter, sem conversão alguma.

## 🛠️ Erros e Respostas Padrão

Todas as respostas seguem um padrão único para facilitar o consumo por Front-ends ou Bots.

### Sucesso
```json
{ "success": true, "data": { ... } }
```

### Erro
```json
{
    "success": false,
    "errors": [
        {
            "code": "AUTH_INVALID_TOKEN",
            "message": "Invalid JWT token",
            "field": "authorization" 
        }
    ]
}
```

---
<div align="center">
Desenvolvido com por alunos do CTI, UNESP.
</div>
<img src="https://mir-s3-cdn-cf.behance.net/project_modules/fs/0427a253368969.5a8662bdf14d0.jpg" style="border-bottom-left-radius: 15px;border-bottom-right-radius: 15px;">