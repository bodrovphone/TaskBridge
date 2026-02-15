FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY playwright.config.ts ./
COPY e2e/ ./e2e/

CMD ["npx", "playwright", "test", "--grep", "@smoke"]
