export type User = newUser & {
    id_User?: number; // pra inserir no bd, que gera o id dps q eu enviar query
    passwordHash: string;
    masterToken: string;
};
export type newUser = {
    name: string;
    email: string;
    password: string;
};
