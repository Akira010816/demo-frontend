# ベースイメージ
FROM node:14.17.0-alpine3.13 AS base

# タイムゾーンを日本に設定
RUN apk --no-cache add tzdata && \
  cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
  apk del tzdata

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# ポート番号を設定
ENV PORT 3000
EXPOSE 3000

# バックエンドAPIのURI
ENV NEXT_PUBLIC_API_URI /api/



# 開発用イメージ
FROM base AS development

# Node.jsを開発モードに設定
ENV NODE_ENV development

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
RUN apk add --update --no-cache --repository http://dl-3.alpinelinux.org/alpine/edge/community --repository http://dl-3.alpinelinux.org/alpine/edge/main vips-dev

# node_modulesのインストール
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# node_modulesのコマンドをパスに追加
ENV PATH $PATH:/usr/src/app/node_modules/.bin

# ソースファイルをコピー
COPY . .

# 実行コマンド
CMD ["yarn", "dev"]



# 本番用のビルドファイル(distディレクトリ)を作成するイメージ
FROM development AS builder

# ソースのビルド
RUN yarn build && yarn install --production --ignore-scripts --prefer-offline



# 本番用イメージ
FROM base AS production

# Node.jsを本番モードに設定
ENV NODE_ENV production

# ユーザーを追加
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# ビルドファイルをコピー
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

# 実行ユーザーを設定
USER nextjs

# 実行コマンド
CMD ["yarn", "start"]
