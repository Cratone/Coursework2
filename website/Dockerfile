# Используем Node.js для сборки
FROM node:18 AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install
RUN npm install http-proxy

# Копируем исходники и собираем проект
COPY . .
RUN npm run build

CMD ["npm", "start"]
