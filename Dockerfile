FROM node:20.17.0 as base

LABEL org.opencontainers.image.source=https://github.com/ashutoshspunyani99-tamu/VitalVault

LABEL org.opencontainers.image.licenses=MIT

RUN corepack enable

ENV PNPM_HOME="/pnpm"

ENV PATH="$PNPM_HOME:$PATH"

ENV NODE_ENV=production

RUN apk add --update --virtual .deps --no-cache gnupg && \
    cd /tmp && \
    wget https://releases.hashicorp.com/hcp/0.4.0/hcp_0.4.0_linux_amd64.zip && \
    wget https://releases.hashicorp.com/hcp/0.4.0/hcp_0.4.0_SHA256SUMS && \
    wget https://releases.hashicorp.com/hcp/0.4.0/hcp_0.4.0_SHA256SUMS.sig && \
    wget -qO- https://www.hashicorp.com/.well-known/pgp-key.txt | gpg --import && \
    gpg --verify hcp_0.4.0_SHA256SUMS.sig hcp_0.4.0_SHA256SUMS && \
    grep hcp_0.4.0_linux_amd64.zip hcp_0.4.0_SHA256SUMS | sha256sum -c && \
    unzip /tmp/hcp_0.4.0_linux_amd64.zip -d /tmp && \
    mv /tmp/hcp /usr/local/bin/hcp && \
    rm -f /tmp/hcp_0.4.0_linux_amd64.zip hcp_0.4.0_SHA256SUMS 0.4.0/hcp_0.4.0_SHA256SUMS.sig && \
    apk del .deps

RUN apt-get update && apt-get install -y curl

RUN mkdir -p /tmp/hcp && curl -SLO https://releases.hashicorp.com/hcp/0.12.3/hcp_linux_amd64.zip \
    && unzip -d /tmp/hcp hcp_linux_amd64.zip

RUN mkdir -p /usr/local/bin && cp /tmp/hcp/hcp /usr/local/bin/

RUN chmod +x /usr/local/bin/hcp

WORKDIR /app

COPY . /app/

RUN npm pkg delete scripts.prepare

RUN rm -rf /app/packages/web

RUN pnpm i --prod && pnpm i -r --prod

WORKDIR /app/packages/prisma

RUN pnpm generate

FROM base as platform

WORKDIR /app/packages/platform

RUN pnpm build

EXPOSE 3000

CMD [ "pnpm", "start" ]

FROM base as upload

WORKDIR /app/packages/upload

RUN pnpm build

EXPOSE 3000

CMD [ "pnpm", "start" ]