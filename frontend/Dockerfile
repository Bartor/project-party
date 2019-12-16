FROM node AS build
WORKDIR /app/
COPY ./package.json ./package-lock.json /app/
RUN npm install

COPY . /app/
RUN npm run build

FROM nginx
COPY --from=build /app/dist/ /usr/share/nginx/html/