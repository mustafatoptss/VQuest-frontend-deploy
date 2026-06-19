# Aşama 1: Build (Derleme)
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Aşama 2: Serve (Nginx ile Sunma)
FROM nginx:alpine
# Aşama 1'den elde edilen statik derlenmiş dosyaları Nginx konumuna kopyala
COPY --from=build /app/dist /usr/share/nginx/html
# React/Vite routing (SPA) için özel Nginx konfigürasyonunu kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80 portunu dışarı aç
EXPOSE 80

# Nginx sunucusunu başlat
CMD ["nginx", "-g", "daemon off;"]
