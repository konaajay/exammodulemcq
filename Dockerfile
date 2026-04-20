FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn -f "exam module backend/pom.xml" clean package -DskipTests

FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build ["/app/exam module backend/target/Exammodule-0.0.1-SNAPSHOT.jar", "app.jar"]
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
