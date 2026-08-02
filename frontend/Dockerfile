# Stage 1: Install dependencies and build
FROM node:20-alpine AS builder

WORKDIR /app

# Arguments passed during build time
ARG NEXT_PUBLIC_API_BASE=/api
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ARG NEXT_PUBLIC_GTM_ID=
ARG NEXT_PUBLIC_GOOGLE_ADS_ID=
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID
ENV NEXT_PUBLIC_GOOGLE_ADS_ID=$NEXT_PUBLIC_GOOGLE_ADS_ID

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
# Install ALL dependencies (including devDependencies) so Next.js can compile TS
RUN npm ci --include=dev

COPY . .

# Build the Next.js app 
# (NEXT_PUBLIC_API_BASE should be passed at build-time if doing static generation,
# but we will just use relative paths locally or at runtime)
RUN npm run build

# Stage 2: Production server runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only the necessary files for production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
# Install ONLY production dependencies
RUN npm ci --omit=dev

COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/public ./public

# The official image already provides an unprivileged `node` user. Keeping the
# runtime non-root limits damage from a dependency or rendering vulnerability.
RUN chown -R node:node /app

USER node

EXPOSE 3000

# Start the server using the compiled `.next` payload
CMD ["npm", "start", "--", "-p", "3000"]
