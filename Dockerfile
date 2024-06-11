FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /usr/src/app
COPY src ./src
COPY pom.xml .
RUN mvn -f ./pom.xml clean package

FROM maven:3.8.4-openjdk-17 AS final
COPY --from=build /usr/src/app/target/*.jar /usr/app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/usr/app/app.jar"]

