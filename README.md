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