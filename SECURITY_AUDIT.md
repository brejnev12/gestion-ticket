# Rapport d'audit sécurité

## 1. Présentation du projet
Ce projet consiste à développer une application web de gestion de tickets permettant aux utilisateurs de créer, consulter, modifier et supprimer leurs tickets. Un administrateur peut gérer l'ensemble des tickets et des utilisateurs.


## 2. Liste des vulnérabilités intégrées
- Broken Access Control / IDOR
- Information Disclosure
- Authentification faible
- Stockage du JWT dans Local Storage
- Absence de validation des entrées


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
- consultation d'un ticket appartenant à un autre utilisateur (`GET`) ;
- modification d'un ticket appartenant à un autre utilisateur (`PUT`) ;
- suppression d'un ticket appartenant à un autre utilisateur (`DELETE`).

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
