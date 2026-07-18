## 1. Présentation du projet
Ce projet consiste à développer une application web de gestion de tickets permettant aux utilisateurs de créer, consulter, modifier et supprimer leurs tickets. Un administrateur peut gérer l'ensemble des tickets et des utilisateurs.

Le projet a été réalisé en deux versions :
- vulnerable : version contenant volontairement des vulnérabilités afin de réaliser un audit de sécurité;
- secure : version corrigée dans laquelle les vulnérabilités identifiées sont corrigées.

## 2. Architecture de l'application
### Frontend
- Next.js 16
- React
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- TypeScript

### Base de données
- MySQL

### ORM
- Prisma

### Authentification
#### Branche `vulnerable`
- JWT
- Stockage du token dans le Local Storage
#### Branche `secure`
- JWT
- Refresh Token
- Cookies HttpOnly

## 3. Installation et lancement
### Installation
npm install


### Configuration
Créer un fichier `.env` contenant notamment :
DATABASE_URL="mysql://..."
JWT_SECRET="votre_secret"


### Migration Prisma
npx prisma migrate dev

### Lancement du projet
npm run dev


L'application est accessible à l'adresse :
http://localhost:3000


