# Rapport d'audit sécurité

## 1. Présentation du projet
Ce projet consiste à développer une application web de gestion de tickets permettant aux utilisateurs de créer, consulter, modifier et supprimer leurs tickets. Un administrateur peut gérer l'ensemble des tickets et des utilisateurs.


## 2. Liste des vulnérabilités intégrées
- Broken Access Control / IDOR
- Information Disclosure
- Authentification faible
- Stockage du JWT dans Local Storage
- Absence de validation des entrées
- Mass Assignment / Privilege Escalation
- Security Misconfiguration / Absence de Security Headers


# 3. Audit détaillé des vulnérabilités

# 1 — Broken Access Control / IDOR
## Type
Broken Access Control (IDOR / BOLA)

## Endpoints concernés
- `GET /api/tickets/[id]`
- `PUT /api/tickets/[id]`
- `DELETE /api/tickets/[id]`

## Description
Les opérations de consultation, de modification et de suppression d'un ticket sont réalisées uniquement à partir de son identifiant (`id`). L'application ne vérifie pas que le ticket appartient à l'utilisateur authentifié.

## Cause
Les méthodes utilisent uniquement l'identifiant du ticket :
- `findUnique()` pour consulter un ticket ;
- `update()` pour modifier un ticket ;
- `delete()` pour supprimer un ticket.

Aucune vérification n'est effectuée sur le propriétaire du ticket (`userId`).

## Exploitation
Un utilisateur authentifié peut modifier l'identifiant du ticket dans l'URL et accéder aux tickets d'un autre utilisateur.

Exemples :
```http
GET /api/tickets/2
```

```http
PUT /api/tickets/2
```

```http
DELETE /api/tickets/2
```

Si le ticket appartient à un autre utilisateur, l'application autorise malgré tout l'opération.

## Preuves
Les preuves sont réalisées avec Postman :
### 1. Consultation non autorisée d'un ticket (GET)
Un utilisateur authentifié tente d'accéder à un ticket appartenant à un autre utilisateur :
GET /api/tickets/2
Résultat obtenu :![Image preuve get](imagespreuves/v1-idor-get.png)

### 2. Modification d'un ticket appartenant à un autre utilisateur (`PUT`)
PUT /api/tickets/2
Résultat obtenu : ![Image preuve put](imagespreuves/v1-idor-put.png)

### 3. suppression d'un ticket appartenant à un autre utilisateur (`DELETE`)
DELETE /api/tickets/2
Résultat obtenu : ![Image preuve delete](imagespreuves/v1-idor-delete.png)

Des captures d'écran des requêtes et des réponses sont jointes au rapport.

## Impact
Cette vulnérabilité permet à un utilisateur malveillant de :
- consulter les données d'un autre utilisateur ;
- modifier un ticket qui ne lui appartient pas ;
- supprimer un ticket appartenant à un autre utilisateur.

Elle compromet la confidentialité et l'intégrité des données de l'application.

## Criticité
Élevée

## Correction appliquée (branche `secure`)
Avant toute opération sur un ticket, l'application vérifie que celui-ci appartient bien à l'utilisateur authentifié.

Exemple :

const ticket = await prisma.ticket.findFirst({
  where: {
    id: Number(id),
    userId: user.id,
  },
});

Si le ticket n'appartient pas à l'utilisateur connecté, l'API retourne une erreur 403 Forbidden ou 404 Not Found.

## Validation après correction

Après application de la correction :
- un utilisateur ne peut consulter que ses propres tickets ;
- un utilisateur ne peut modifier que ses propres tickets ;
- un utilisateur ne peut supprimer que ses propres tickets.

Les tentatives d'accès à un ticket appartenant à un autre utilisateur sont désormais refusées.

# 2 — Information Disclosure
## Type
Security Misconfiguration / Information Disclosure

## Endpoint concerné
- `POST /api/authentification/login`

## Description
Lors de l'authentification, l'API retourne l'objet utilisateur complet, y compris le hash du mot de passe (`password`). Cette information ne devrait jamais être transmise au client.

## Cause
Après la connexion, l'application renvoie directement l'objet utilisateur récupéré depuis la base de données sans supprimer les informations sensibles.

Exemple :
{
   "id": 3,
    "name": "Brejnev",
    "email": "brejnev@test.com",
    "password": "$2b$10$y6WAR18sSg/mxgHVA7/ntOWXUIncTy7TSOE11fJxUxZxsJ7MPfn7y",
    "role": "USER"
}

## Exploitation
Un attaquant authentifié peut consulter la réponse de l'API et récupérer le hash du mot de passe d'un utilisateur.
Cette information peut être utilisée pour effectuer des attaques hors ligne (offline) afin de tenter de retrouver le mot de passe.

## Preuves
1. Connexion avec un compte utilisateur via Postman.
2. Observation de la réponse JSON.
3. Présence du champ `password` dans l'objet `user`.

Une capture d'écran de la réponse Postman est jointe au rapport.

## Impact
Cette vulnérabilité expose des informations sensibles de la base de données et augmente le risque de compromission des comptes utilisateurs.

## Criticité
Moyenne

## Correction appliquée (branche `secure`)
Le backend ne retourne plus le champ `password`.
Seules les informations nécessaires sont renvoyées au client :
{
   "id": 3,
   "name": "Brejnev",
   "email": "brejnev@test.com",
   "role": "USER"
}

## Validation après correction
Après correction, la réponse de l'API ne contient plus le champ `password`. Les informations sensibles ne sont plus exposées au client.

# 3 — Authentification faible / Absence de protection contre le brute force
## Type
Identification and Authentication Failures

## Endpoint concerné
- `POST /api/authentification/login`

## Description
L'application ne possède pas de mécanisme de limitation des tentatives de connexion.
Un attaquant peut envoyer un grand nombre de requêtes avec différents mots de passe afin de tenter de découvrir le mot de passe d'un utilisateur.

## Cause
L'API de connexion vérifie uniquement les identifiants fournis :

email + password

mais ne limite pas le nombre de tentatives échouées.
Aucun système de :
- rate limiting ;
- blocage temporaire ;
- délai entre les tentatives ;

n'est présent dans la version vulnerable.

## Exploitation
Un attaquant peut envoyer plusieurs requêtes successives :

POST /api/authentification/login

Avec différents mots de passe :
{
  "email": "user@test.com",
  "password": "123456"
}

{
  "email": "user@test.com",
  "password": "password"
}

{
  "email": "user@test.com",
  "password": "admin123"
}

L'application continue de répondre normalement sans bloquer l'utilisateur.

## Preuves
Test réalisé avec Postman :
Plusieurs tentatives de connexion échouées sont envoyées successivement.
Exemple de réponse :

{
  "message": "Identifiants incorrects"
}

La requête peut être répétée sans aucune restriction.
Une capture des différentes tentatives est ajoutée au rapport.

## Impact
Cette vulnérabilité permet :
- des attaques par force brute ;
- des attaques par dictionnaire ;
- la compromission potentielle des comptes utilisateurs.

## Criticité
Elevée

## Correction appliquée (branche `secure`)
Ajout d'un système de limitation des tentatives de connexion :
- limitation par adresse IP ;
- limitation par email ;
- blocage temporaire après plusieurs échecs.

Exemple :
Si 5 tentatives échouent,
bloquer temporairement la connexion.

## Validation après correction
Après correction :
- plusieurs tentatives échouées déclenchent une limitation ;
- l'API retourne une erreur `429 Too Many Requests`.

Exemple :
{
  "message": "Trop de tentatives. Réessayez plus tard."
}

# 4 — Cross-Site Scripting (Stored XSS)
## Type
Injection

## Endpoint concerné
- POST /api/tickets
- Page `/Administration`

## Description
L'application permet de stocker du contenu JavaScript dans les descriptions des tickets.
Lorsqu'un autre utilisateur consulte le ticket, le script est exécuté dans son navigateur.

## Cause
Les données utilisateurs sont affichées sans filtrage HTML.
L'utilisation de :

dangerouslySetInnerHTML

permet l'exécution directe du contenu fourni par l'utilisateur.

## Exploitation
Un utilisateur crée un ticket contenant :

<script>alert('XSS')</script>

Lorsqu'un utilisateur consulte le ticket, le navigateur exécute le script.

## Preuves
- Requête Postman contenant le payload XSS.
- Capture navigateur montrant l'exécution du JavaScript.

## Impact
Cette vulnérabilité peut permettre :
- le vol de cookies ;
- le vol de données utilisateur ;
- l'exécution d'actions au nom de la victime.

## Criticité
Élevée

## Correction appliquée (branche secure)
Suppression de l'affichage HTML non sécurisé.
Utilisation du rendu React classique :

{ticket.description}

ou ajout d'un système de nettoyage HTML.

## Validation après correction
Les scripts envoyés dans un ticket sont affichés comme du texte et ne sont plus exécutés dans le navigateur.

# 5 — Mass Assignment / Privilege Escalation
## Type
Insecure Design

## Endpoint concerné

- PUT /api/users/[id]

## Description
L'API accepte directement les données envoyées par l'utilisateur sans filtrer les champs modifiables.
Un utilisateur peut modifier des propriétés sensibles comme son rôle.

## Cause
Le backend utilise directement les données reçues :

data: body

Tous les champs sont donc modifiables.

## Exploitation
Un utilisateur normal envoie :
json
{
"role":"ADMIN"
}

L'application applique la modification sans contrôle.

## Preuve
Une requête PUT permet de modifier le rôle USER vers ADMIN.

## Impact
Un attaquant peut obtenir des privilèges administrateur et accéder à des ressources protégées.

## Criticité
Critique

## Correction appliquée (branche secure)
Les champs modifiables sont explicitement définis.
Le rôle ne peut être modifié que par un administrateur.

## Validation après correction
Un utilisateur normal ne peut plus modifier son rôle.
Toute tentative retourne une erreur d'autorisation.

# 6 — JWT mal sécurisé / Stockage du token dans Local Storage
## Type
Identification and Authentication Failures

## Endpoint / zone concernée
### Backend
POST /api/authentification/login

### Frontend
app/login/page.tsx

## Description
Après une authentification réussie, l'application stocke le token JWT dans le `localStorage` du navigateur.
Cette méthode présente un risque de sécurité car le token est accessible depuis JavaScript côté client.
En cas d'exploitation d'une vulnérabilité XSS, un attaquant pourrait récupérer ce token et l'utiliser pour usurper l'identité d'un utilisateur.

## Cause technique
Le token JWT est enregistré directement dans le navigateur :
localStorage.setItem("token", data.token);
Le stockage `localStorage` n'applique aucune protection particulière :
- pas de protection HttpOnly ;
- accessible par les scripts JavaScript ;
- disponible jusqu'à sa suppression.

## Exploitation
Un attaquant exploitant une faille XSS peut exécuter du code JavaScript permettant de récupérer le token : localStorage.getItem("token")

Le token obtenu peut ensuite être utilisé dans les requêtes API :

Authorization: Bearer TOKEN_VOLÉ

L'attaquant peut alors effectuer des actions avec les droits de la victime.

## Preuve
Test réalisé dans le navigateur :
1. Connexion avec un compte utilisateur.
2. Ouverture des outils développeur.
3. Navigation vers :

Application
 → Local Storage
 → localhost:3000

4. Observation de la présence du JWT.
Exemple :
token =eyJhbGciOiJIUzI1NiIsInR5cCI6...
Une capture d'écran du Local Storage contenant le token est ajoutée au rapport.

## Impact
Cette vulnérabilité peut permettre :
- le vol de session utilisateur ;
- l'usurpation d'identité ;
- l'accès aux données privées ;
- l'exécution d'actions avec les permissions de la victime.

## Criticité
Élevée

## Correction appliquée (branche `secure`)
Le stockage du JWT dans `localStorage` est supprimé.
Le token est désormais stocké dans un cookie sécurisé :

- HttpOnly : inaccessible depuis JavaScript ;
- Secure : envoyé uniquement en HTTPS ;
- SameSite : protection contre certaines attaques CSRF.

Exemple :

response.cookies.set(
  "access_token",
  token,
  {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  }
);

## Validation après correction
Après correction :
- aucun token JWT n'est présent dans le Local Storage ;
- le token est uniquement stocké dans un cookie HttpOnly ;
- JavaScript ne peut plus récupérer le token.

La tentative :
localStorage.getItem("token")

retourne :
null

La faille est considérée comme corrigée.


# 7 — Security Misconfiguration / Absence de Security Headers
## Type
Security Misconfiguration

## Endpoint / zone concernée
http://localhost:3000

Toutes les réponses HTTP de l'application sont concernées.

## Description
L'application ne configure pas certains headers HTTP de sécurité permettant de renforcer la protection du navigateur.
L'absence de ces protections peut faciliter certaines attaques comme :
- Clickjacking ;
- attaques XSS ;
- interprétation incorrecte du contenu ;
- exploitation de certaines failles côté navigateur.

## Cause technique
La version vulnerable ne définit pas de middleware de sécurité ajoutant des headers HTTP.
Les réponses serveur ne contiennent pas de protections supplémentaires comme :
X-Frame-Options
X-Content-Type-Options
Content-Security-Policy
Strict-Transport-Security

## Exploitation
Un attaquant peut profiter de l'absence de ces protections pour :
- intégrer l'application dans une iframe malveillante;
- augmenter l'impact d'une vulnérabilité XSS ;
- exploiter des comportements non sécurisés du navigateur.

Exemple :
<iframe src="http://localhost:3000/dashboard"></iframe>

Sans protection adaptée, la page peut être chargée dans un autre site.

## Preuve
Test réalisé avec la commande :
curl -I http://localhost:3000

Résultat observé dans la version vulnerable :
HTTP/1.1 200 OK
Content-Type: text/html

Les headers de sécurité attendus sont absents.
Capture de la réponse HTTP ajoutée au rapport.
## Impact
Cette mauvaise configuration peut permettre :
- des attaques Clickjacking ;
- une réduction de la protection contre les attaques XSS ;
- une augmentation de la surface d'attaque côté navigateur.

## Criticité
Moyenne

## Correction appliquée (branche `secure`)
Ajout d'un middleware Next.js permettant d'ajouter les headers de sécurité.

Exemple :
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );
  response.headers.set(
    "X-Frame-Options",
    "DENY"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'"
  );
  return response;
}

## Validation après correction
Après correction :
La commande :
curl -I http://localhost:3000


retourne les headers de sécurité :
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'

La configuration de sécurité du navigateur est renforcée.