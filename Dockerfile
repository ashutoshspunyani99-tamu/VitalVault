FROM node:20 as base

LABEL org.opencontainers.image.source=https://github.com/ashutoshspunyani99-tamu/VitalVault

LABEL org.opencontainers.image.licenses=MIT

RUN corepack enable

ENV PNPM_HOME="/pnpm"

ENV PATH="$PNPM_HOME:$PATH"

ENV NODE_ENV=production

RUN sudo apt-get update && \
    sudo apt-get install wget gpg coreutils && wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list && sudo apt-get update && sudo apt-get install hcp

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