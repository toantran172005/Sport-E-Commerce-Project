# ===== Giai doan 1: build ban production bang Vite =====
FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Dia chi API duoc "nuong" vao ban build. Mac dinh /api: nginx se chuyen tiep sang backend,
# nen trinh duyet chi goi cung 1 origin (khong vuong CORS).
ARG VITE_API_URL=/api
ARG VITE_CHATBOT_URL=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CHATBOT_URL=$VITE_CHATBOT_URL
RUN npm run build

# ===== Giai doan 2: nginx phuc vu file tinh =====
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
