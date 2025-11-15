 <h1 align="center">NSAC Srapping API</h1>
 
<div align="center">
    <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js Badge">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript Badge">
    <img src="https://img.shields.io/badge/Express.js-4.x-lightgrey?style=for-the-badge&logo=express" alt="Express.js Badge">
    <img src="https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite" alt="SQLite Badge">
    <img src="https://img.shields.io/badge/Cheerio-:)-orange?style=for-the-badge&logo=cheerio" alt="Cheerio Badge">
</div>

# O que é esse projeto?

Este projeto consiste em uma **API Restful** robusta, desenvolvida utilizando **Typescript** e o _framework_ **Express.js**.

Nosso foco é solucionar um desafio enfrentado pela comunidade de informática: a dificuldade de acesso e uso automatizado dos dados acadêmicos fornecidos pelo **NSAC Online**.

O NSAC Online é a **única** plataforma para a consulta de notas e médias finais dos alunos do Colégio Técnico Industrial, UNESP. No entanto, sua arquitetura é uma **aplicação monolítica em PHP Laravel**, que **não disponibiliza** uma Interface de Programação de Aplicações (API) pública. Todas as interações resultam no retorno de páginas **HTML puro**.

Nossa API atua como uma **camada de abstração** vital, transformando a complexidade de interagir com o HTML do NSAC em _endpoints_ limpos e fáceis de usar. Isso permite que qualquer aplicação externa—seja um bot no Discord, um serviço de notificação no Whatsapp, ou um aplicativo móvel—possa consumir esses dados de forma moderna e eficiente, utilizando o formato **JSON**.

## Antes de tudo, o que é _scrapping_? 🕵️
Para viabilizar essa abstração, o projeto emprega a técnica de **Scrapping de Dados** (ou **Raspagem de Dados**).

Scrapping é uma técnica utilizada por desenvolvedores para **coletar informações estruturadas** de sites na internet que não fornecem um canal de acesso direto (como uma API nativa e exposta publicamente).

#### Como Funciona:

1.  **Simulação:** Em vez de acessar um _endpoint_ como `api.nsac.com/notas`, nossa API simula a interação de um usuário real.
    
2.  **Captura:** Você usa nossa API para simular essa interação, um usuário final envia seu login e senha, a API salva essas informações e o usuário pode fazer solicitações como "quero minha média final de matemática do quarto bimestre do terceiro ano", através de um **token**.
    
3.  **Extração:** Seguindo o exemplo, a API possui funções internas para fazer o **scrapping** de dados do NSAC para coletar as informações solicitadas.
    
4.  **Transformação:** Os dados extraídos são convertidos de texto e estrutura HTML para um formato limpo, **estruturado em JSON**.
    
5.  **Entrega:** A API Restful entrega esse JSON limpo e pronto para uso ao desenvolvedor.
6. **Sua hora**: Você apresenta esses dados para o usuário da forma que preferir e na plataforma que preferir.

## Tecnologias utilizadas:


![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
O [NodeJS](https://nodejs.org/en) é o ambiente de execução assíncrono que hospeda e executa toda a API. Escolhemos a versão **18+** para aproveitar as melhorias de performance e recursos mais recentes da plataforma.

![TypeScript 5.x](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
O [TypeScript](https://www.typescriptlang.org/) é utilizado para tipagem estática. Ele garante um código mais robusto, fácil de depurar e previne erros comuns de JavaScript, sendo crucial para a segurança na manipulação e estruturação dos dados de *scrapping*.

![Express.js 4.x](https://img.shields.io/badge/Express.js-4.x-lightgrey?style=for-the-badge&logo=express)
o [Express.js](https://expressjs.com/) é o *framework* web minimalista e flexível que estrutura a **API Restful**. É responsável por rotear as requisições HTTP (GET, POST), gerenciar *middlewares* e entregar a resposta JSON final ao cliente.

![Cheerio](https://img.shields.io/badge/Cheerio-:D-orange?style=for-the-badge&logo=cheerio)
O [Cheerio](https://cheerio.js.org/) é a biblioteca-chave para a técnica de *Scrapping*. O Cheerio **analisa o HTML** retornado pelo NSAC e fornece uma sintaxe similar ao jQuery, permitindo que o código localize e extraia as notas, médias e outros dados de forma eficiente e rápida.

![SQLite 3](https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite)
O [SQLite3](https://sqlite.org/) é um sistema de gerenciamento de banco de dados relacional leve e sem servidor. Utilizado primariamente para **armazenamento local** de dados de configuração, *caching* de sessões ou, se aplicável, para persistir dados estruturais da aplicação.

# ⚙️ Como Começar
## Pré-requisitos
1. NodeJS 18 ou superior
2. NPM ou outro gerenciador de pacotes de sua preferência (yarn, pnpm)
3. Um cérebro funcional
## **Instalação**
1.  **Clone o repositório:**
    ```Bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio``
2.  **Instale as dependências:**
    ```Bash
    npm i
    ```

    
3. **Configure as variáveis de ambiente:**  
    Crie um arquivo chamado .env na raiz do projeto e adicione as seguintes variáveis:
    
    ```bash
    # Porta em que o servidor irá rodar
    PORT="3000"
    
    # Chave secreta para a assinatura dos tokens JWT. Use um valor longo e aleatório.
    SECRETKEY="sua_chave_secreta_super_segura_aqui"
      ```
 4. **Execute o servidor em modo de desenvolvimento:**  
    O servidor irá reiniciar automaticamente a cada alteração no código.
    ```bash
    npm run dev 
    ``` 
  O servidor estará rodando em http://localhost:3000.
# 📚 Documentação da API
A API está dividida em duas rotas principais: /api/auth para autenticação na própria API e /api/nsac para interações com o portal NSAC.
## Autenticação (/api/auth)
Endpoints para gerenciar os usuários da API.

#### 1.  ``` POST /api/auth/register ```

Registra um novo usuário na API.

-   **Request Body:**
   
	   ```JSON
	   {
	      "name": "Seu Nome",
	      "email": "usuario@exemplo.com",
	      "password": "sua_senha_forte"
	    }
	   ```
  - **Responses:**
    
    -   201 Created: Usuário criado com sucesso.
        
    -   400 Bad Request: Campos faltando ou e-mail inválido.
        
    -   409 Conflict: O e-mail informado já está cadastrado.
        

#### 2. ```POST /api/auth/login```

Autentica um usuário e retorna um token JWT.

-   **Request Body:**
    
    ```JSON
    {
      "email": "usuario@exemplo.com",
      "password": "sua_senha_forte"
    }
    ```
   -   **Responses:**
    
	    -   200 OK: Login bem-sucedido. O token JWT é retornado no header Authorization.
	        
		       ``` JSON
				   {
		          "message": "Logged succesfully",
		          "userId": 1
		        }
	        ```
	    -   401 Unauthorized: E-mail ou senha inválidos.
----------

### NSAC (/api/nsac)

Endpoints para interagir com o portal NSAC. **Requerem autenticação JWT**.

#### POST /api/nsac/accounts

Realiza o login no portal NSAC com as credenciais fornecidas e armazena os cookies de sessão de forma segura, associados ao seu usuário da API.

-   **Headers:**
      ```Authorization: Bearer seu_token_jwt```
-   **Request Body:**
    
    ```JSON
    {
      "email": "seu_email_do_nsac@dominio.com",
      "password": "sua_senha_do_nsac"
    }
    ```
-   **Responses:**
    
    -   201 Created: Login no NSAC realizado com sucesso e token de acesso criado.
        
    -   401 Unauthorized: E-mail ou senha do NSAC inválidos.
        
    -   403 Forbidden: Token JWT inválido ou ausente.
        

(Outros endpoints como GET /grades podem ser adicionados aqui no futuro)





