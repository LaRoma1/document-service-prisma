# Installer les dépendances nécessaires
npm install --save @nestjs/platform-express
npm install --save multer
npm install --save @types/multer
npm install --save class-validator class-transformer

bash# Installer TypeORM, le driver PostgreSQL et les utilitaires NestJS pour TypeORM
npm install --save @nestjs/typeorm typeorm pg

# Installer Prisma CLI et client
npm install prisma --save-dev
npm install @prisma/client --save

# Initialiser Prisma dans votre projet
npx prisma init

# Générer les fichiers de migration
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate

# Générer le module Documents
nest generate module documents

# Générer le contrôleur Documents
nest generate controller documents

# Générer le service Documents
nest generate service documents


npm install --save @nestjs/swagger swagger-ui-express
