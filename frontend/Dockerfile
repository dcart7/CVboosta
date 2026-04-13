# Stage 1: Install dependencies and build
FROM node:20-alpine AS builder

WORKDIR /app

# Arguments passed during build time
ARG NEXT_PUBLIC_API_BASE=/api
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE

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

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

# Start the server using the compiled `.next` payload
CMD ["npm", "start", "--", "-p", "3000"]
