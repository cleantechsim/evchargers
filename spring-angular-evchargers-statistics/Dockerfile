FROM node:10 as node-env

WORKDIR /compile
COPY . .

WORKDIR /compile/src/main/webapp
RUN npm install --quiet
RUN ./node_modules/.bin/ng build --deploy-url="evcharger_stats/"

FROM openjdk:8 as build-env

RUN apt-get update
RUN apt-get install -y maven

WORKDIR /compile
COPY --from=node-env /compile .

WORKDIR /compile
RUN mvn install -Dmaven.test.skip=true

FROM openjdk:8

WORKDIR /app

COPY --from=build-env /compile/target/spring-angular-evchargers-statistics-2.1.7.RELEASE.jar .

CMD java -Dserver.port=6100 -Dserver.compression.enabled=true -jar spring-angular-evchargers-statistics-2.1.7.RELEASE.jar


