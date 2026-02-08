# --- dev ステージ: Vite dev server (HMR対応) ---
FROM node:22-slim AS dev

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# --- build ステージ: 本番ビルド ---
FROM node:22-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- prod ステージ: 静的ファイル配信 ---
FROM node:22-slim AS prod

WORKDIR /app
RUN npm install -g serve@latest
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
