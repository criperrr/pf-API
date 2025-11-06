export type User = {
    id_User?: number, // pra inserir no bd, que gera o id dps q eu enviar query
    name: string;
    email: string;
    passwordHash: string;
}