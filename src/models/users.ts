export type Users = newUser & {
    id_user?: number; // pra inserir no bd, que gera o id dps q eu enviar query
    passwordhash: string;
    mastertoken: string;
};
export type newUser = {
    name: string;
    email: string;
    password: string;
};
