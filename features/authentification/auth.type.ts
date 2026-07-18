export type Register = {
  nom: string;
  email: string;
  password: string;
};

export type Login = {
  email: string;
  password: string;
};

export type AuthReponse = {
  idUser: number;
  email: string;
  role: string;
};
