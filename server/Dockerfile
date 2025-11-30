FROM node:20-slim

RUN apt-get update && apt-get install -y \
    python3 python3-pip ffmpeg \
    && apt-get clean

RUN apt-get update && \
    apt-get install -y python3-numpy python3-pydub && \
    apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3333

CMD ["npm", "run", "dev"]